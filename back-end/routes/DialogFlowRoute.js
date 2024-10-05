const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Conversation = require('../models/Conversation'); // Importando o modelo
const verifyToken = require('../middlewares/VerificarToken');

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

// Rota para o Dialogflow
router.post("/Dialogflow", verifyToken, async (req, res) => {
  const userId = req.userId; // Obter o ID do usuário do token
  const intentName = req.body.queryResult.intent.displayName;
  const cidade = req.body.queryResult.parameters['Cidade'];

  // Cria uma nova conversa ou atualiza uma existente
  let conversation = await Conversation.findOne({ userId });

  if (!conversation) {
    conversation = new Conversation({
      userId,
      messages: [],
    });
  }

  switch (intentName) {
    case "Teste":
      const testResponse = "Este teste funciona";
      conversation.messages.push({
        question: "Teste",
        answer: testResponse,
        role: 'sistema',
        status: 'respondida',
      });
      await conversation.save(); // Salvar a conversa
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
          // Extraindo os dados do OpenWeather
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

          // Adiciona a resposta no banco e atualiza o status
          conversation.messages.push({
            question: cidade,
            answer: resposta,
            role: 'sistema',
            status: 'respondida',
          });

          await conversation.save(); // Salvar a conversa

          res.json({ "fulfillmentText": resposta });
        }
      });
      break;

    default:
      res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
  }
});

// Rota para obter conversas do usuário pelo ID
router.get('/conversas/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Busca todas as conversas associadas ao ID do usuário
    const conversas = await Conversation.find({ userId: id }).sort({ createdAt: -1 });

    if (!conversas.length) {
      return res.status(404).json({ message: 'Nenhuma conversa encontrada.' });
    }

    return res.json(conversas);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    return res.status(500).json({ message: 'Erro ao buscar as conversas.' });
  }
});

module.exports = router;

