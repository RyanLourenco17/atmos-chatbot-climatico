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
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  const cidade = parameters['Cidade']; // Certifique-se de que o parâmetro está correto

  // Cria uma nova conversa ou atualiza uma existente
  let conversation = await Conversation.findOne({ userId });

  if (!conversation) {
    conversation = new Conversation({
      userId,
      messages: [],
    });
  }

  // Adiciona a mensagem de pergunta no banco
  conversation.messages.push({
    question: cidade || "Pergunta não fornecida",
    role: 'usuário',
    status: 'pendente',
  });

  await conversation.save();

  switch (intentName) {
    case "Teste":
      return res.json({ "fulfillmentText": "Este teste funciona" });

    case "Temperatura":
      if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
      }

      // Chama a API do OpenWeather
      helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
        if (err) {
          console.error(err); // Melhorei a mensagem de log para ser mais clara
          return res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados do clima." });
        }

        const temperaturaAtual = Math.round(currentWeather.main.temp); // Arredondando a temperatura
        const descricaoClima = currentWeather.weather[0].description;

        const resposta = `Cidade: ${currentWeather.name}\n` +
                         `Temperatura Atual: ${temperaturaAtual}ºC\n` +
                         `Descrição do clima: ${descricaoClima}`;

        // Adiciona a resposta no banco e atualiza o status
        conversation.messages.push({
          answer: resposta,
          role: 'sistema',
          status: 'respondida',
        });

        await conversation.save();

        return res.json({
          "fulfillmentText": resposta
        });
      });

    default:
      return res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
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
