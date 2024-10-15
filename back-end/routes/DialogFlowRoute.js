const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Message = require("../models/Message");
const verifyToken = require('../middlewares/VerificarToken');

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
    // Cria uma nova consulta sem mensagens
    const newConsultation = new Consultation({
      user: userId,
      messages: []
    });

    await newConsultation.save(); // Salva a consulta no banco de dados

    let newMessage;

    if (intentName === "Temperatura") {
      if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
      }

      // Chama a API do OpenWeather
      helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
        if (err) {
          console.log(err);
          return res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados do clima." });
        } else {
          const temperaturaAtual = parseInt(currentWeather.main.temp);
          const tempMax = parseInt(currentWeather.main.temp_max);
          const tempMin = parseInt(currentWeather.main.temp_min);
          const umidade = parseInt(currentWeather.main.humidity);
          const velocidadeVento = parseInt(currentWeather.wind.speed);
          const pressao = currentWeather.main.pressure;
          const descricaoClima = currentWeather.weather[0].description;
          const visibilidade = currentWeather.visibility;
          const nascerDoSol = new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString();
          const porDoSol = new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString();
          const dataHora = new Date(currentWeather.dt * 1000).toLocaleString();

          const resposta =
            "Cidade: " + currentWeather.name + "\n" +
            "Data e Hora: " + dataHora + "\n" +
            "Temperatura Atual: " + temperaturaAtual + "º" + "\n" +
            "Temperatura Máxima: " + tempMax + "º" + "\n" +
            "Temperatura Mínima: " + tempMin + "º" + "\n" +
            "Umidade: " + umidade + "%" + "\n" +
            "Velocidade do vento: " + velocidadeVento + "km/h" + "\n" +
            "Pressão Atmosférica: " + pressao + " hPa" + "\n" +
            "Descrição do clima: " + descricaoClima + "\n" +
            "Visibilidade: " + visibilidade + " metros" + "\n" +
            "Nascer do sol: " + nascerDoSol + "\n" +
            "Pôr do sol: " + porDoSol;

          // Cria a mensagem para a consulta
          newMessage = new Message({ question: cidade, answer: resposta });
          await newMessage.save();

          // Adiciona a mensagem à nova consulta
          newConsultation.messages.push(newMessage._id);
          await newConsultation.save();

          res.json({ "fulfillmentText": resposta, consultationId: newConsultation._id });
        }
      });
    } else {
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
  const cidade = req.body.queryResult.parameters['Cidade'];

  try {
    const consultation = await Consultation.findOne({ _id: id, user: userId });

    if (!consultation) {
      return res.status(404).json({ "fulfillmentText": "Consulta não encontrada ou não pertence ao usuário." });
    }

    let newMessage;

    if (intentName === "Temperatura") {
      if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
      }

      // API do OpenWeather
      helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
        if (err) {
          console.log(err);
          return res.json({ "fulfillmentText": "Erro ao buscar clima." });
        } else {

          const temperaturaAtual = currentWeather.main.temp;
          const tempMax = currentWeather.main.temp_max;
          const tempMin = currentWeather.main.temp_min;
          const umidade = currentWeather.main.humidity;
          const velocidadeVento = currentWeather.wind.speed;
          const pressao = currentWeather.main.pressure;
          const descricaoClima = currentWeather.weather[0].description;
          const visibilidade = currentWeather.visibility;
          const nascerDoSol = new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString();
          const porDoSol = new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString();
          const dataHora = new Date(currentWeather.dt * 1000).toLocaleString();

          // Dados de clima e mensagem gerada
          const resposta = "Cidade: " + currentWeather.name + "\n" +
            "Data e Hora: " + dataHora + "\n" +
            "Temperatura Atual: " + temperaturaAtual + "º" + "\n" +
            "Temperatura Máxima: " + tempMax + "º" + "\n" +
            "Temperatura Mínima: " + tempMin + "º" + "\n" +
            "Umidade: " + umidade + "%" + "\n" +
            "Velocidade do vento: " + velocidadeVento + "km/h" + "\n" +
            "Pressão Atmosférica: " + pressao + " hPa" + "\n" +
            "Descrição do clima: " + descricaoClima + "\n" +
            "Visibilidade: " + visibilidade + " metros" + "\n" +
            "Nascer do sol: " + nascerDoSol + "\n" +
            "Pôr do sol: " + porDoSol;

          newMessage = new Message({ question: cidade, answer: resposta });
          await newMessage.save();

          consultation.messages.push(newMessage._id);
          await consultation.save();

          res.json({ "fulfillmentText": resposta });
        }
      });
    } else {
      res.json({ "fulfillmentText": "Não entendi sua solicitação." });
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

    res.json({ message: 'Consulta deletada com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar consulta:', error);
    res.status(500).json({ message: 'Erro ao deletar consulta.' });
  }
});

module.exports = router;
