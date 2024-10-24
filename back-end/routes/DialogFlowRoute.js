const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');
const poluicaoArIntent = require('../intents/poluicaoAr');
const handleTemperaturaIntent = require('../intents/temperatura');

// Configuração do helper do OpenWeather
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Rota para criar uma nova consulta
router.post("/nova-consulta", verifyToken, async (req, res) => {
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  let cidade = req.body.queryResult.parameters['Cidade'];

  // Se não encontrar a cidade nos parâmetros, tenta extrair do queryText
  if (!cidade || cidade === '') {
    const queryText = req.body.queryResult.queryText;
    const match = queryText.match(/em\s+(\w+)/i); // Exemplo de regex para encontrar "em [Cidade]"
    if (match) {
      cidade = match[1]; // Captura a cidade encontrada na frase
    }
  }

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para realizar a consulta." });
  }

  try {
    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });

    await newConsultation.save();

    switch (intentName) {
      case "Temperatura":
        await handleTemperaturaIntent(cidade, newConsultation, res, req.body.queryResult.queryText);
        break;
      case "PoluiçaoDoAr":
        await poluicaoArIntent(cidade, newConsultation, res, req.body.queryResult.queryText);
        break;
      default:
        res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
    }
  } catch (error) {
    console.error('Erro ao criar nova consulta:', error);
    res.status(500).json({ "fulfillmentText": "Houve um erro ao criar a consulta." });
  }
});

// Rota para adicionar uma nova mensagem em uma consulta existente
router.post("/adicionar-mensagem/:id", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const intentName = req.body.queryResult.intent.displayName;
  let cidade = req.body.queryResult.parameters['Cidade'];

  if (!cidade || cidade === '') {
    const queryText = req.body.queryResult.queryText;
    const match = queryText.match(/em\s+(\w+)/i); // Exemplo de regex para encontrar "em [Cidade]"
    if (match) {
      cidade = match[1];
    }
  }

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para realizar a consulta." });
  }

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });

    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    switch (intentName) {
      case "Temperatura":
        await handleTemperaturaIntent(cidade, consultation, res, req.body.queryResult.queryText);
        break;
      case "PoluiçaoDoAr":
        await poluicaoArIntent(cidade, consultation, res);
        break;
      default:
        res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
    }
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

    await consultation.remove();
    res.json({ message: 'Consulta deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({ message: 'Erro ao deletar consulta.' });
  }
});

module.exports = router;
