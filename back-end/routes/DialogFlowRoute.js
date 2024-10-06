const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Consultation = require('../models/Consultation');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const verifyToken = require('../middlewares/VerificarToken');

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Rota para o Dialogflow
router.post("/Dialogflow", verifyToken, async (req, res) => {
  const userId = req.userId; // ID do usuário extraído do token
  const intentName = req.body.queryResult.intent.displayName;
  const cidade = req.body.queryResult.parameters['Cidade'];

  try {
    // Encontra ou cria uma nova consulta para o usuário
    let consultation = await Consultation.findOne({ user: userId }).populate('conversations');

    if (!consultation) {
      consultation = new Consultation({
        user: userId,
        conversations: [],
      });
      await consultation.save();
    }

    // Encontra ou cria uma nova conversa na consulta
    let conversation = consultation.conversations.length > 0
      ? consultation.conversations[consultation.conversations.length - 1]
      : new Conversation({
          consultation: consultation._id,
          messages: [],
        });

    if (!conversation._id) {
      await conversation.save();
      consultation.conversations.push(conversation._id);
      await consultation.save();
    }

    let newMessage;

    switch (intentName) {
      case "Teste":
        const testResponse = "Este teste funciona";

        // Cria uma nova mensagem e salva no banco de dados
        newMessage = new Message({
          question: "Teste",
          answer: testResponse,
        });
        await newMessage.save();

        // Adiciona a mensagem à conversa
        conversation.messages.push(newMessage._id);
        await conversation.save(); // Salva a conversa com a nova mensagem

        res.json({ "fulfillmentText": testResponse });
        break;

      case "Temperatura":
        if (!cidade) {
          res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
          return;
        }

        // Chama a API do OpenWeather
        helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
          if (err) {
            console.log(err);
            res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados do clima." });
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

            // Cria a mensagem para a conversa
            newMessage = new Message({
              question: cidade,
              answer: resposta
            });
            await newMessage.save();

            // Adiciona a mensagem à conversa
            conversation.messages.push(newMessage._id);
            await conversation.save(); // Salva a conversa

            res.json({ "fulfillmentText": resposta });
          }
        });
        break;

      default:
        res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
    }
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    res.status(500).json({ "fulfillmentText": "Houve um erro ao processar sua solicitação." });
  }
});

// Rota para obter todas as consultas do usuário
router.get('/consultas', verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    // Busca todas as consultas do usuário e popula as conversas e mensagens
    const consultas = await Consultation.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'conversations',
        populate: {
          path: 'messages',
        },
      });

    if (!consultas.length) {
      return res.status(404).json({ message: 'Nenhuma consulta encontrada.' });
    }

    return res.json(consultas);
  } catch (error) {
    console.error('Erro ao buscar consultas:', error);
    return res.status(500).json({ message: 'Erro ao buscar as consultas.' });
  }
});

// Rota para obter uma consulta específica pelo ID
router.get('/consultas/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Obter o ID do usuário do token

  try {
    // Busca a consulta pelo ID e verifica se pertence ao usuário
    const consulta = await Consultation.findOne({ _id: id, user: userId })
      .populate({
        path: 'conversations',
        populate: {
          path: 'messages',
        },
      });

    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada.' });
    }

    return res.json(consulta);
  } catch (error) {
    console.error('Erro ao buscar a consulta:', error);
    return res.status(500).json({ message: 'Erro ao buscar a consulta.' });
  }
});

module.exports = router;


