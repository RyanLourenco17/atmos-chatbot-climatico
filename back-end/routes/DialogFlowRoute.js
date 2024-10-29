const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Intents
const clima_Atual = require('../intents/clima_Atual')
const dados_Total = require('../intents/dados_Total')
const poluicao_Dados = require('../intents/poluicao_Dados')
const pressao_Atm = require('../intents/pressao_Atm')

// Modelos de Dados
const Message = require('../models/Message');
const Consultation = require('../models/Consultation');

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const client = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Inicializando o helper do OpenWeatherMap
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: 'metric',
  lang: 'pt_br',
});

module.exports = { helper };

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

    // Extraindo dados da resposta do Dialogflow
    const dialogflowAnswer = response.data.queryResult.fulfillmentText;
    const parameters = response.data.queryResult.parameters || {};
    const intentName = response.data.queryResult.intent.displayName || '';

    // Criando e salvando a mensagem no banco de dados
    const message = new Message({
      question,
      answer: dialogflowAnswer,
      parameters,
      intentName,
    });
    await message.save();

    // Buscando ou criando a consulta associada ao usuário
    let consultation = await Consultation.findOne({ user: userId });
    if (!consultation) {
      consultation = new Consultation({ user: userId, messages: [message._id] });
    } else {
      consultation.messages.push(message._id);
    }
    await consultation.save();

    // Respondendo ao front-end
    res.json({ fulfillmentText: dialogflowAnswer });
  } catch (error) {
    console.error('Erro ao consultar o Dialogflow ou salvar no banco:', error);
    res.status(500).json({ error: 'Erro interno ao processar a solicitação.' });
  }
});

// Endpoint para funcionar como webhook do Dialogflow
router.post('/webhook', async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  switch (intentName) {
    case "clima_Atual":
      return clima_Atual(req, res);

    case "pressao_Atm":
      return pressao_Atm(req, res);

    case "poluicao_Dados":
      return poluicao_Dados(req, res);

    case "dados_Total":
      return dados_Total(req, res);

    default:
      res.json({ fulfillmentText: "Desculpe, não entendi sua solicitação." });
      break;
  }
});

module.exports = router;
