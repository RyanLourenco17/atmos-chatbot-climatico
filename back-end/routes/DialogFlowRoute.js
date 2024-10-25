const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');
const poluicaoArIntent = require('../intents/poluicaoAr');
const handleTemperaturaIntent = require('../intents/temperatura');

// const dialogflow = require('@google-cloud/dialogflow');
// const sessionClient = new dialogflow.SessionsClient();
// const projectId = 'atmos-goat';

// Configuração do helper do OpenWeather
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Função para extrair cidade dos parâmetros ou do texto
function extrairCidade(queryResult) {
  let cidade = queryResult.parameters['Cidade'];
  if (!cidade || cidade === '') {
    const queryText = queryResult.queryText;
    const match = queryText.match(/em\s+(\w+)/i); // Regex para encontrar "em [Cidade]"
    if (match) {
      cidade = match[1];
    }
  }
  return cidade;
}

// Função para lidar com a intent com base no nome
async function lidarComIntent(intentName, cidade, consulta, res, queryText, outputContexts) {
  // Aqui você pode usar os contextos para decidir o que fazer
  console.log("Output Contexts:", outputContexts);

  switch (intentName) {
    case "Temperatura":
      await handleTemperaturaIntent(cidade, consulta, res, queryText, outputContexts);
      break;
    case "PoluiçaoDoAr":
      await poluicaoArIntent(cidade, consulta, res, queryText, outputContexts);
      break;
    default:
      res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
  }
}


// Rota para criar uma nova consulta
router.post("/nova-consulta", verifyToken, async (req, res) => {
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  const { parameters, outputContexts } = req.body.queryResult; // Adicionamos outputContexts aqui

  const cidade = extrairCidade(req.body.queryResult);

  if (!parameters || !parameters.Cidade) {
    return res.status(400).json({ error: "Cidade não fornecida." });
  }

  try {
    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });

    await newConsultation.save();

    // Lidar com a intent dinamicamente
    await lidarComIntent(intentName, cidade, newConsultation, res, req.body.queryResult.queryText, outputContexts);

  } catch (error) {
    console.error('Erro ao criar nova consulta:', error);
    res.status(500).json({ "fulfillmentText": "Houve um erro ao criar a consulta." });
  }
});


// Rota para adicionar uma nova mensagem em uma consulta existente
router.post("/adicionar-mensagem/:id", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  // Verifique se o corpo da requisição contém o queryResult
  if (!req.body.queryResult) {
    return res.status(400).json({ "fulfillmentText": "Dados da consulta não foram fornecidos." });
  }

  const intentName = req.body.queryResult.intent.displayName;
  let cidade = extrairCidade(req.body.queryResult);

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para realizar a consulta." });
  }

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });

    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    // Lidar com a intent dinamicamente
    const result = await lidarComIntent(intentName, cidade, consultation, res, req.body.queryResult.queryText);

    // Aqui você pode querer salvar a nova mensagem
    const newMessage = new Message({
      question: req.body.queryResult.queryText,
      answer: result ? result.fulfillmentText : "Desculpe, não consegui responder a sua pergunta."
    });

    // Salvar a mensagem na consulta
    consultation.messages.push(newMessage._id);
    await newMessage.save();
    await consultation.save();

    res.json(newMessage); // Retornar a nova mensagem como resposta

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
