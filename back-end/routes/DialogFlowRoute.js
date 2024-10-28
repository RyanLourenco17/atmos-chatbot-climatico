const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const Consultation = require('../models/Consultation');
const Message = require('../models/Message');
const verifyToken = require('../middlewares/VerificarToken');
const { SessionsClient } = require('@google-cloud/dialogflow');
const languageCode = 'pt-BR';
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Inicializando o cliente do Dialogflow
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});


const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g,'\n');


// console.log('DIALOGFLOW_PROJECT_ID:', projectId);
// console.log('GOOGLE_APPLICATION_CREDENTIALS: ', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('DIALOGFLOW_PRIVATE_KEY:', privateKey);


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

// Inicializando o helper do OpenWeatherMap
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: 'metric',
    lang: "pt_br"
});

// Funções auxiliares para obter dados climáticos
async function getCoordinates(cidade) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    try {
        const response = await axios.get(url);
        if (!response.data || response.data.length === 0) {
            throw new Error('No data returned for coordinates.');
        }
        return { lat: response.data[0].lat, lon: response.data[0].lon };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getAirPollution(lat, lon) {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
    try {
        const response = await axios.get(url);
        return {
            aqi: response.data.list[0].main.aqi,
            components: response.data.list[0].components,
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Função para detectar a intent do Dialogflow
async function detectIntent(projectId, userId, query) {
    const sessionId = `${userId}_${Date.now()}`;
    const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
    const accessToken = await getAccessToken();

    console.log("TOKEN DE ACESSO: ", accessToken)

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    const [response] = await client.detectIntent(request);
    return response.queryResult;
}

// Rota para criar uma nova consulta
router.post('/nova-consulta', async (req, res) => {
    const { userId, query } = req.body;

    if (!userId || !query) {
        return res.status(400).json({ message: 'userId e query são obrigatórios.' });
    }

    const { intent, parameters } = await detectIntent(projectId, userId, query);
    const intentName = intent.displayName;
    const cidade = parameters["Cidade"];

    switch (intentName) {
        case "clima_Atual":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error('Erro ao obter dados climáticos:', err);
                    return res.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                }
                if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    return res.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                }
                const { temp, feels_like } = currentWeather.main;
                const description = currentWeather.weather[0].description;
                return res.json({
                    fulfillmentText: `O clima atual em ${currentWeather.name} é: Temperatura: ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C). Condições: ${description}`
                });
            });
            break;

        case "pressao_Atm":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                    return res.json({ fulfillmentText: "Erro ao obter dados climáticos." });
                }
                if (!currentWeather) {
                    return res.json({ fulfillmentText: 'Não foi possível obter informações da pressão atmosférica para essa cidade no momento.' });
                }
                const pressNivelMar = currentWeather.main.sea_level;
                const pressNivelSolo = currentWeather.main.grnd_level;

                return res.json({
                    fulfillmentText: `Na cidade de ${currentWeather.name}: A pressão atmosférica ao nível do mar está em torno de ${pressNivelMar} hPa. A pressão atmosférica ao nível do solo está em torno de ${pressNivelSolo} hPa.`
                });
            });
            break;

        case "poluicao_Dados":
            try {
                const coordinates = await getCoordinates(cidade);
                if (!coordinates) {
                    return res.json({ fulfillmentText: 'Erro ao obter coordenadas.' });
                }
                const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
                if (!pollutionData) {
                    return res.json({ fulfillmentText: 'Erro ao obter dados de Poluição' });
                }
                const aqi = pollutionData.aqi; // chamadas de poluição
                return res.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${aqi}.` });
            } catch (error) {
                console.error('Error:', error);
                return res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
            }
            break;

        case "dados_Total":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                }
                if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    return res.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                }
                const { temp, temp_max, temp_min } = currentWeather.main;
                const descricao = currentWeather.weather[0].description;
                return res.json({
                    fulfillmentText: `O clima atual em ${currentWeather.name} é: Temperatura: ${parseInt(temp)}ºC, Máxima: ${parseInt(temp_max)}ºC, Mínima: ${parseInt(temp_min)}ºC, Condições: ${descricao}`
                });
            });
            break;
    }
});

module.exports = router;
