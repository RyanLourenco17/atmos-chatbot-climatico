const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const Consultation = require('../models/Consultation');
const Message = require('../models/Message');
const verifyToken = require('../middlewares/VerificarToken');
const { SessionsClient, dialogflow } = require('@google-cloud/dialogflow');
const languageCode = 'pt-BR';
const { GoogleAuth } = require('google-auth-library');

// Inicializando o cliente do Dialogflow
const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

console.log('DIALOGFLOW_PROJECT_ID:', process.env.DIALOGFLOW_PROJECT_ID);
console.log('GOOGLE_APPLICATION_CREDENTIALS: ', process.env.GOOGLE_APPLICATION_CREDENTIALS);


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
            components: data.list[0].components,
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Função para detectar a intent do Dialogflow
async function detectIntent(projectId ,sessionId, query) {
  const sessionId = `${userId}_${Date.now()}`;
    const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
    const accessToken = await getAccessToken();

    console.log(accessToken);

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
    return responses.queryResult;
}

// Rota para criar uma nova consulta
router.post('/nova-consulta', async (req, res) => {
  const { intent, parameters } = await detectIntent(projectId, req.body.userId, req.body.query); // Exemplo de chamada
  const intentName = intent.displayName;
  const cidade = parameters["Cidade"];

  switch (intentName){

      case "clima_Atual":
        helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
            if (err) {
                console.error('Erro ao obter dados climáticos:', err);
                response.json({
                    fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                });
            } else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                response.json({
                    fulfillmentText: "Dados climáticos inválidos."
                });
            } else {
                const { temp, feels_like } = currentWeather.main;
                const description = currentWeather.weather[0].description;
                response.json({
                    fulfillmentText: `O clima atual em ${currentWeather.name} é:
                                      Temperatura: ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C)
                                      Condições: ${description}`
                });
            }
        });
        break;

        case "pressao_Atm":
    helper.getCurrentWeatherByCityName(cidade, (err, currentWeather)=> {
      if(err){
        console.log(err);
      }else{
        console.log(currentWeather);
        var pressNivelMar = currentWeather.main.sea_level;
        var pressNivelSolo = currentWeather.main.grnd_level;

        if (pressNivelMar > 1 || pressNivelSolo > 1){
        response.json({fulfillmentText:
                      "Na cidade de  " + currentWeather.name + ":"+ '\n'+
                      "A pressão atmosferica ao nivel do mar esta em torno de " + pressNivelMar + 'hPa.' + '\n\n' +
                      "A pressão atmosferica ao nivel do solo esta em torno de " + pressNivelSolo + 'hPa.'
                      })
        }else{
          response.json({fulfillmentText: 'Nao foi possivel obter informaçao da pressao atmosferica para essa cidade no momento.'})
        }
      }
    });break;

  case "poluicao_Dados":
    try{
      const coordinates = await getCoordinates(cidade);
      if(!coordinates){
        response.json({fulfillmentText: 'Erro ao obter coordenadas.'});
        return;
      }
      const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
      if(!pollutionData){
        response.json({fulfillmentText: 'Erro ao obter dados de Poluição'});
        return;
      }
      const aqi = pollutionData.aqi; // chamadas de poluiçao

      response.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${aqi}.` }); // fulfillment
    }catch(error){
      console.error('Error:', error);
      response.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
    }
    break;

  case "dados_Total":
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) =>{
        if(err){
          console.log(err)
          response.json({
            fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
        });
        }else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
          response.json({
              fulfillmentText: "Dados climáticos inválidos."
          });
        }else{
          console.log(currentWeather);
                const {temp, temp_max, temp_min, description} = currentWeather.main;
                const descricao = currentWeather.weather[0].description;
                response.json({fulfillmentText:
                  `O clima atual em ${currentWeather.name} é:
                  Temperatura: ${parseInt(temp)}ºC Com maxima de ${parseInt(temp_max)}ºC e
                  minima de ${parseInt(temp_min)}ºC  Condições: ${descricao}`
                });
        }
      });break;
  }
});


module.exports = router;
