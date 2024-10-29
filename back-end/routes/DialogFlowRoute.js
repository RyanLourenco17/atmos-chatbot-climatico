const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Modelos de Dados
const Message = require('../models/Message');
const Consultation = require('../models/Consultation');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

let accessToken = null;

// Função para obter o token de acesso do Google
const getAccessToken = async () => {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: credentials,
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  accessToken = tokenResponse.token; // Armazenando o token em uma variável de escopo mais amplo
  console.log(`TOKEN DE ACESSO: ${accessToken}`);
};

// Obtendo o AccessToken ao carregar o módulo
getAccessToken().catch(err => console.error('Erro ao obter o AccessToken:', err));

// Inicializando o helper do OpenWeatherMap
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: 'metric',
  lang: 'pt_br',
});

// Funções auxiliares para dados de geolocalização e poluição
async function getCoordinates(cidade) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (!response.data || response.data.length === 0) throw new Error('No data returned for coordinates.');
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

// Rota para consultar Dialogflow
router.post('/consultar-dialogflow', async (req, res) => {
  const { userId, question } = req.body;

  try {
    await getAccessToken();

    const sessionId = `${userId}_${Date.now()}`;
    const languageCode = 'pt-BR';

    // Requisição para o Dialogflow
    const response = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`,
      {
        queryInput: {
          text: {
            text: question,
            languageCode: languageCode,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Obtendo a resposta do Dialogflow
    // const dialogflowAnswer = response.data.queryResult.fulfillmentText;

    // Salvando as mensagens no banco de dados
    const message = new Message({ question, answer: response.data });
    await message.save();

    // Salvando a consulta no banco
    let consultation = await Consultation.findOne({ user: userId });
    if (!consultation) {
      consultation = new Consultation({ user: userId, messages: [message._id] });
    } else {
      consultation.messages.push(message._id);
    }
    await consultation.save();

    // Respondendo ao front-end
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao consultar o Dialogflow ou salvar no banco:', error);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
});



// Endpoint para funcionar como webhook do Dialogflow
router.post('/nova-consulta', async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];
  const intentName = req.body.queryResult.intent.displayName;
  console.log(`Usando TOKEN DE ACESSO: ${accessToken}`);

  switch (intentName) {
    case "clima_Atual":
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if (err) {
          console.error('Erro ao obter dados climáticos:', err);
          res.json({
            fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento.",
          });
        } else {
          const { temp, feels_like } = currentWeather.main;
          const description = currentWeather.weather[0].description;
          res.json({
            fulfillmentText: `O clima atual em ${currentWeather.name} é de ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C), Condições: ${description}`,
          });
        }
      });
      break;

    case "pressao_Atm":
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if (err) {
          console.log(err);
          res.json({ fulfillmentText: "Erro ao obter dados da pressão atmosférica." });
        } else {
          const pressNivelMar = currentWeather.main.sea_level;
          const pressNivelSolo = currentWeather.main.grnd_level;
          res.json({
            fulfillmentText: pressNivelMar && pressNivelSolo
              ? `Na cidade de ${currentWeather.name}. A Pressão ao nível do mar é ${pressNivelMar} hPa, Pressão ao nível do solo: ${pressNivelSolo} hPa`
              : 'Não foi possível obter informação da pressão atmosférica para essa cidade no momento.',
          });
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
        res.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${pollutionData.aqi}.` });
      } catch (error) {
        console.error('Erro:', error);
        res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
      }
      break;

    case "dados_Total":
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if (err) {
          console.log(err);
          res.json({
            fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento.",
          });
        } else {
          const { temp, temp_max, temp_min } = currentWeather.main;
          const descricao = currentWeather.weather[0].description;
          res.json({
            fulfillmentText: `O clima atual em ${currentWeather.name} é: Temperatura: ${parseInt(temp)}ºC com máxima de ${parseInt(temp_max)}ºC e mínima de ${parseInt(temp_min)}ºC. Condições: ${descricao}`,
          });
        }
      });
      break;

    default:
      res.json({ fulfillmentText: "Desculpe, não entendi sua solicitação." });
      break;
  }
});

module.exports = router;
