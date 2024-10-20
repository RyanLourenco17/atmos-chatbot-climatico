const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');
const poluicaoArIntent = require('../intents/poluicaoAr')
const handleTemperaturaIntent = require('../intents/temperatura');

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Rota para criar uma nova consulta
router.post("/nova-consulta", verifyToken, async (req, res) => {
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  const cidade = req.body.queryResult.parameters['Cidade'];

  try {
    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });

    await newConsultation.save();

    let response = '';

    switch (intentName) {
      case "Temperatura":
        await handleTemperaturaIntent(cidade, newConsultation);
        break;
      case "PoluicaoDoAr":
        await poluicaoArIntent(cidade, newConsultation, res);
        break;
      // Outros intents podem ser adicionados aqui
      default:
        response = { fulfillmentText: "Desculpe, não entendi sua solicitação." };
    }

    res.json(response);
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
  const cidade = req.body.queryResult.parameters['Cidade'];

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });

    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    switch (intentName) {
      case "Temperatura":
        await handleTemperaturaIntent(cidade, consultation, res); // Chama a intent de temperatura
        break;
      case "Poluição do Ar":
        await poluicaoArIntent(cidade, consultation, res); // Já existente
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
  const consultationId = req.params.id; // ID da consulta

  try {
    // Encontra a consulta pelo ID e verifica se pertence ao usuário
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
  const consultationId = req.params.id; // ID da consulta

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
