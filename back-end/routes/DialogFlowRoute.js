const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Inicializando o cliente do Dialogflow
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Função para obter o token de acesso do Google
const getAccessToken = async () => {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: credentials,
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
};

// Inicializando o helper do OpenWeatherMap
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: 'metric',
  lang: "pt_br"
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

// Função para detectar intent do Dialogflow
async function detectIntent(projectId, userId, query) {
  const sessionId = `${userId}_${Date.now()}`;
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
  const accessToken = await getAccessToken();

  const request = {
    session: sessionPath,
    queryInput: {
      text: { text: query, languageCode: "pt-BR" }
    }
  };

  const [response] = await client.detectIntent(request);
  return response.queryResult;
}

// Endpoint para funcionar como webhook do Dialogflow
router.post('/nova-consulta', async (req, res) => {
  const { query, cidade } = req.body;

  if (!query || !cidade) {
    return res.status(400).json({ message: 'Query e cidade são obrigatórios.' });
  }

  const queryResult = await detectIntent(projectId, 'webhook-user', query);
  const intentName = queryResult.intent.displayName;

  switch (intentName) {
    case "clima_Atual":
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if (err || !currentWeather || !currentWeather.main || !currentWeather.weather) {
          return res.json({ fulfillmentText: "Erro ao obter informações climáticas." });
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
        if (err || !currentWeather.main) {
          return res.json({ fulfillmentText: 'Erro ao obter informações de pressão atmosférica.' });
        }
        const { sea_level: pressNivelMar, grnd_level: pressNivelSolo } = currentWeather.main;
        return res.json({
          fulfillmentText: `Na cidade de ${currentWeather.name}: Pressão ao nível do mar: ${pressNivelMar} hPa. Pressão ao nível do solo: ${pressNivelSolo} hPa.`
        });
      });
      break;

    case "Poluicao":
      try {
        const coordinates = await getCoordinates(cidade);
        if (!coordinates) return res.json({ fulfillmentText: 'Erro ao obter coordenadas.' });
        const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
        if (!pollutionData) return res.json({ fulfillmentText: 'Erro ao obter dados de poluição.' });
        return res.json({
          fulfillmentText: `O índice de poluição do ar em ${cidade} é ${pollutionData.aqi}.`
        });
      } catch (error) {
        console.error('Error:', error);
        return res.json({ fulfillmentText: "Erro ao processar solicitação." });
      }
      break;

    default:
      res.json({ fulfillmentText: 'Intent não reconhecida.' });
      break;
  }
});

module.exports = router;
