const express = require("express");
const router = express.Router();
const axios = require('axios');
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');
const { getAccessToken } = require('../middlewares/TokenDoGoogle')


const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Função para enviar consulta ao Dialogflow
const detectIntent = async (queryText, sessionId) => {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID; // ID do projeto
  const token = await getAccessToken(); // Certifique-se de implementar essa função

  try {
    const response = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`,
      {
        queryInput: {
          text: {
            text: queryText,
            languageCode: 'pt-BR',
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao detectar intent:', error.response ? error.response.data : error);
    throw new Error('Erro ao detectar intent'); // Lançar um erro para tratamento posterior
  }
};

// Função para extrair cidade dos parâmetros ou do texto
function extrairCidade(queryResult) {
  let cidade = queryResult.parameters?.cidade;
  if (!cidade || cidade === '') {
    const queryText = queryResult.queryText;
    const match = queryText.match(/em\s+(\w+)/i);
    if (match) {
      cidade = match[1];
    }
  }
  return cidade;
}

// Rota para criar uma nova consulta
router.post("/nova-consulta", verifyToken, async (req, res) => {
  const userId = req.userId;
  const queryText = req.body.queryText;

  // Criação do sessionId como userId + DateNow
  const sessionId = `${userId}_${Date.now()}`;

  try {
    const dialogflowResult = await detectIntent(queryText, sessionId);
    const intentName = dialogflowResult.intent.displayName;
    const cidade = extrairCidade(dialogflowResult);

    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });
    await newConsultation.save();

    // Aqui chamamos a API do OpenWeather com base na intent identificada
    let fulfillmentText = '';
    switch (intentName) {
      case "clima_Atual":
        // Supondo que você tenha os dados de temperatura e descrição
        const temp = 25; // Exemplo de temperatura
        const feels_like = 24; // Exemplo de sensação térmica
        const descricao = "ensolarado"; // Exemplo de descrição
        fulfillmentText = `O clima atual em ${cidade} é ${temp}°C (Sensação térmica: ${feels_like}°C) - Condições: ${descricao}`;  // Conecte à API do OpenWeather se necessário.
        break;
      case "poluicao_Dados":
        const aqi = 50; // Exemplo de AQI
        fulfillmentText = `O índice de poluição do ar em ${cidade} é ${aqi}.`;
        break;
      // Adicione os outros cases de intents aqui
      default:
        fulfillmentText = "Desculpe, não entendi sua solicitação.";
    }

    res.json({ fulfillmentText });

  } catch (error) {
    console.error('Erro ao criar nova consulta:', error);
    res.status(500).json({ "fulfillmentText": "Houve um erro ao criar a consulta." });
  }
});

// Rota para adicionar uma nova mensagem em uma consulta existente
router.post("/adicionar-mensagem/:id", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const queryText = req.body.queryText;

  // Utiliza o userId para criar o sessionId
  const sessionId = `${userId}_${Date.now()}`;

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });
    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    const dialogflowResult = await detectIntent(queryText, sessionId);
    const intentName = dialogflowResult.intent.displayName;
    const cidade = extrairCidade(dialogflowResult);

    let fulfillmentText = '';
    switch (intentName) {
      case "clima_Atual":
        fulfillmentText = `O clima atual em ${cidade} é...`;  // Conecte à API do OpenWeather se necessário.
        break;
      case "poluicao_Dados":
        fulfillmentText = `Os dados de poluição do ar em ${cidade} são...`;
        break;
      // Adicione os outros cases de intents aqui
      default:
        fulfillmentText = "Desculpe, não entendi sua solicitação.";
    }

    const newMessage = new Message({
      question: queryText,
      answer: fulfillmentText
    });

    consultation.messages.push(newMessage._id);
    await newMessage.save();
    await consultation.save();

    res.json(newMessage);

  } catch (error) {
    console.error('Erro ao adicionar mensagem:', error);
    res.status(500).json({ "fulfillmentText": "Erro ao adicionar mensagem." });
  }
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
    const consultation = await Consultation.findOne({ _id: consultationId, user: userId })
      .populate('messages');

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
    const consultation = await Consultation.findOne({ _id: consultationId, user: userId })
      .populate('messages', 'question answer');

    if (!consultation) {
      return res.status(404).json({ message: 'Consulta não encontrada ou não pertence ao usuário.' });
    }

    // Use deleteOne ou findByIdAndDelete para deletar
    await Consultation.deleteOne({ _id: consultationId, user: userId });

    res.json({ message: 'Consulta deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({ message: 'Erro ao deletar consulta.' });
  }
});

module.exports = router;
