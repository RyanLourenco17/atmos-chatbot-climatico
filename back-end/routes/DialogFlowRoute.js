const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const Consultation = require('../models/Consultation');
const Message = require('../models/Message');
const verifyToken = require('../middlewares/VerificarToken');

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: 'metric',
});

const { GoogleAuth } = require('google-auth-library');

// Função para obter o Access Token
const getAccessToken = async () => {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: credentials,
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

async function detectIntent(projectId, sessionId, query) {
  const accessToken = await getAccessToken();
  console.log(accessToken);

  const response = await axios.post(`https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`, {
    queryInput: {
      text: {
        text: query,
        languageCode: 'pt-BR'
      }
    }
  }, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  // Verifica se a resposta foi bem-sucedida
  if (response.status !== 200) {
    throw new Error(`Dialogflow Error: ${response.data.error.message}`);
  }

  return response.data;
}



// Funções auxiliares para obter dados climáticos
async function getCoordinates(cidade) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = await response.json();
        return { lat: data[0].lat, lon: data[0].lon };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getAirPollution(lat, lon) {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = await response.json();

        return {
            aqi: data.list[0].main.aqi,
            CO: data.list[0].components.co,
            NO: data.list[0].components.no,
            NO2: data.list[0].components.no2,
            O3: data.list[0].components.o3,
            SO2: data.list[0].components.so2,
            pm2_5: data.list[0].components.pm2_5,
            pm10: data.list[0].components.pm10,
            nh3: data.list[0].components.nh3
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Rota para criar uma nova consulta
router.post('/nova-consulta', async (req, res) => {
    const userId = req.userId;
    const cidade = req.body.queryResult.parameters["Cidade", "cidade"];
    const sessionId = `${userId}_${Date.now()}`;
    const projectId = process.env.DIALOGFLOW_PROJECT_ID


    try{
      const accessToken = await getAccessToken();

      const dialogflowResponse = await axios.post(`https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`,
        {
            queryInput: req.body.queryInput
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
      });

      const intentName = dialogflowResponse.data.queryResult.intent.displayName;


      switch (intentName) {
        case "clima_Atual":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error('Erro ao obter dados climáticos:', err);
                    res.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                } else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    res.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                } else {
                    const { temp, feels_like } = currentWeather.main;
                    const description = currentWeather.weather[0].description;
                    res.json({
                        fulfillmentText: `O clima atual em ${currentWeather.name} é:
                                          Temperatura: ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C)
                                          Condições: ${description}`
                    });
                }
            });
            break;

        case "pressao_Atm":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                } else {
                    const pressNivelMar = currentWeather.main.sea_level;
                    const pressNivelSolo = currentWeather.main.grnd_level;

                    if (pressNivelMar > 1 || pressNivelSolo > 1) {
                        res.json({
                            fulfillmentText: `Na cidade de ${currentWeather.name}:\nA pressão atmosférica ao nível do mar está em torno de ${pressNivelMar} hPa.\n\nA pressão atmosférica ao nível do solo está em torno de ${pressNivelSolo} hPa.`
                        });
                    } else {
                        res.json({ fulfillmentText: 'Não foi possível obter informação da pressão atmosférica para essa cidade no momento.' });
                    }
                }
            });
            break;

        case "poluicao_Dados":
            try {
                const coordinates = await getCoordinates(cidade);
                if (!coordinates) {
                    res.json({ fulfillmentText: 'Erro ao obter coordenadas.' });
                    return;
                }
                const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
                if (!pollutionData) {
                    res.json({ fulfillmentText: 'Erro ao obter dados de Poluição' });
                    return;
                }
                const aqi = pollutionData.aqi;

                res.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${aqi}.` });
            } catch (error) {
                console.error('Error:', error);
                res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
            }
            break;

        case "dados_Total":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                    res.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                } else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    res.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                } else {
                    const { temp, temp_max, temp_min } = currentWeather.main;
                    const descricao = currentWeather.weather[0].description;
                    res.json({
                        fulfillmentText: `O clima atual em ${currentWeather.name} é:
                        Temperatura: ${parseInt(temp)}ºC, Máxima: ${parseInt(temp_max)}ºC, Mínima: ${parseInt(temp_min)}ºC, Condições: ${descricao}`
                    });
                }
            });
            break;
        default:
            res.json({ fulfillmentText: "Desculpe, não entendi a sua pergunta." });
      }
    } catch(error){
      console.log('Erro ao processar a consulta: ', error);
      res.status(500).json({message: 'Erro ao processar a consulta'})
    }
});

// Rota para adicionar uma nova mensagem em uma consulta existente
router.post('/adicionar-mensagem/:id', async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    // Implementação para adicionar mensagem
});

// Rota para pegar todas as consultas climáticas do usuário
router.get('/consultas', verifyToken, async (req, res) => {
    const userId = req.userId;

    try {
        const consultations = await Consultation.find({ user: userId }).populate({
            path: 'messages',
            select: 'question answer',
        });

        if (!consultations || consultations.length === 0) {
            return res.status(404).json({ message: 'Nenhuma consulta encontrada para este usuário.' });
        }

        res.json(consultations);
    } catch (error) {
        console.error('Erro ao buscar consultas:', error);
        res.status(500).json({ message: 'Erro ao buscar consultas.' });
    }
});

// Rota para pegar informações detalhadas de uma consulta específica
router.get('/consultas/:id', verifyToken, async (req, res) => {
    const userId = req.userId;
    const consultationId = req.params.id;

    try {
        const consultation = await Consultation.findOne({ _id: consultationId, user: userId }).populate('messages');

        if (!consultation) {
            return res.status(404).json({ message: 'Consulta não encontrada ou não pertence ao usuário.' });
        }

        res.json(consultation);
    } catch (error) {
        console.error('Erro ao buscar consulta:', error);
        res.status(500).json({ message: 'Erro ao buscar consulta.' });
    }
});

// Rota para deletar uma consulta específica
router.delete('/consultas/:id', verifyToken, async (req, res) => {
    const userId = req.userId;
    const consultationId = req.params.id;

    try {
        const consultation = await Consultation.findOne({ _id: consultationId, user: userId });

        if (!consultation) {
            return res.status(404).json({ message: 'Consulta não encontrada ou não pertence ao usuário.' });
        }

        await Consultation.deleteOne({ _id: consultationId, user: userId });

        res.json({ message: 'Consulta deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar consulta:', error);
        res.status(500).json({ message: 'Erro ao deletar consulta.' });
    }
});

module.exports = router;
