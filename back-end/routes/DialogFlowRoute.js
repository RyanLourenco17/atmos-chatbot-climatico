const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');

// Intents
const handleTemperaturaIntent = require('../intents/clima_Atual');
const handleDadosTotalIntent = require('../intents/dados_Total')
const poluicaoArIntent = require('../intents/poluicao_Dados');
const handlePressaoAtmosfericaIntent = require('../intents/pressao_Atm');
const handleChuvaIntent = require('../intents/temp_Chuva');
const handleTempMaxIntent = require('../intents/temp_max');
const handleTempMinIntent = require('../intents/temp_min');
const handleNebulosidadeVisibilidadeIntent = require('../intents/temp_NeblVisb');
const handleUmidadeIntent = require('../intents/temp_Umidade');
const handleVentoIntent = require('../intents/temp_Vento');


// Configuração do helper do OpenWeather
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Função para extrair cidade dos parâmetros ou do texto
function extrairCidade(queryResult) {
  let cidade = queryResult.parameters['cidade'];
  if (!cidade || cidade === '') {
    const queryText = queryResult.queryText;
    const match = queryText.match(/em\s+(\w+)/i);
    if (match) {
      cidade = match[1];
    }
  }
  return cidade;
}

// Função para lidar com a intent com base no nome
async function lidarComIntent(intentName, cidade, consulta, queryText) {
  switch (intentName) {
    case "clima_Atual":
      return await handleTemperaturaIntent(cidade, consulta, queryText);
    case "poluicao_Dados":
      return await poluicaoArIntent(cidade, consulta, queryText);
    case "dados_Total":
      return await handleDadosTotalIntent(cidade, consulta, queryText);
    case "pressao_Atm":
      return await handlePressaoAtmosfericaIntent(cidade, consulta, queryText);
    case "temp_Chuva":
      return await handleChuvaIntent(cidade, consulta, queryText);
    case "temp_max":
      return await handleTempMaxIntent(cidade, consulta, queryText);
    case "temp_min":
      return await handleTempMinIntent(cidade, consulta, queryText);
    case "temp_NeblVisb":
      return await handleNebulosidadeVisibilidadeIntent(cidade, consulta, queryText);
    case "temp_Umidade":
      return await handleUmidadeIntent(cidade, consulta, queryText);
    case "temp_Vento":
      return await handleVentoIntent(cidade, consulta, queryText);
    default:
      return { fulfillmentText: "Desculpe, não entendi sua solicitação." };
  }
}

// Rota para criar uma nova consulta
router.post("/nova-consulta", verifyToken, async (req, res) => {
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  const { parameters} = req.body.queryResult;

  const cidade = extrairCidade(req.body.queryResult);

  if (!parameters || !parameters.cidade) {
    return res.status(400).json({ error: "Cidade não fornecida." });
  }

  try {
    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });

    await newConsultation.save();

    // Lidar com a intent dinamicamente
    const result = await lidarComIntent(intentName, cidade, newConsultation, req.body.queryResult.queryText);

    res.json({ fulfillmentText: result.fulfillmentText });

  } catch (error) {
    console.error('Erro ao criar nova consulta:', error);
    res.status(500).json({ "fulfillmentText": "Houve um erro ao criar a consulta." });
  }
});

// Rota para adicionar uma nova mensagem em uma consulta existente
router.post("/adicionar-mensagem/:id", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!req.body.queryResult) {
    return res.status(400).json({ "fulfillmentText": "Dados da consulta não foram fornecidos." });
  }

  const intentName = req.body.queryResult.intent.displayName;
  const cidade = extrairCidade(req.body.queryResult);
  const queryText = req.body.queryResult.queryText;

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para realizar a consulta." });
  }

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });

    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    const result = await lidarComIntent(intentName, cidade, consultation, queryText);

    // Cria e salva a nova mensagem no banco de dados com o resultado da intent
    const newMessage = new Message({
      question: queryText,
      answer: result.fulfillmentText || "Desculpe, não consegui responder a sua pergunta."
    });

    consultation.messages.push(newMessage._id);
    await newMessage.save();
    await consultation.save();

    // Enviar resposta ao cliente
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
