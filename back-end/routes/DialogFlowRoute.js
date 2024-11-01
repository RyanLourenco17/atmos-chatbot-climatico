const express = require('express');
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require('openweathermap-node');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

// Middleware
const verifyToken = require('../middlewares/VerificarToken');
const helper = require('../middlewares/helper');

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
// Rota para consultar Dialogflow
router.post('/consultar-dialogflow', verifyToken, async (req, res) => {
  const { question } = req.body;

  try {
    await getAccessToken();

    const sessionId = `${req.userId}_${Date.now()}`;
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

    // Criando uma nova consulta associada ao usuário
    const consultation = new Consultation({ user: req.userId, messages: [message._id] });
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

// Rota para pegar todas as consultas
router.get('/consultas', verifyToken, async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.userId }).populate('messages');
    res.json(consultations);
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar consultas.' });
  }
});

// Rota para pegar uma consulta específica
router.get('/consultas/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const consultation = await Consultation.findOne({ _id: id, user: req.userId }).populate('messages');
    if (!consultation) {
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Erro ao buscar consulta:', error);
    res.status(500).json({ error: 'Erro interno ao buscar consulta.' });
  }
});


// Rota para deletar uma consulta e suas mensagens associadas
router.delete('/consultas/:id', verifyToken, async (req, res) => {
  const consultationId = req.params.id;
  try {
    // Verificando se a consulta existe e pertence ao usuário autenticado
    const consultation = await Consultation.findOne({ _id: consultationId, user: req.userId });
    if (!consultation) {
      console.error(`Consulta com ID ${consultationId} não encontrada ou não pertence ao usuário.`);
      return res.status(404).json({ error: 'Consulta não encontrada.' });
    }

    // Deletando a consulta
    await consultation.remove();
    res.status(200).json({ message: 'Consulta deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({ error: 'Erro ao deletar consulta.' });
  }
});


module.exports = router;
