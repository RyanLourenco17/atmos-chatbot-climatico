const express = require("express");
const router = express.Router();
const OpenWeatherMapHelper = require("openweathermap-node");
const Conversation = require('../models/Conversation'); // Importando o modelo
const verifyToken = require('../middlewares/VerificarToken');

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

router.post("/Dialogflow", verifyToken, async (req, res) => {
  const userId = req.userId;
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  const cidade = req.body.queryResult.parameters['Cidade']; // Corrigido aqui

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
    question: cidade,
    role: 'usuário',
    status: 'pendente',
  });

  await conversation.save();

  switch (intentName) {
    case "Teste":
      res.json({ "fulfillmentText": "Este teste funciona" });
      break;

    case "Temperatura":
      if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
      }

      // Chama a API do OpenWeather
      helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
        if (err) {
          console.log(err);
          res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados do clima." });
        } else {
          // Extraindo os dados do OpenWeather
          var temperaturaAtual = parseInt(currentWeather.main.temp);
          var tempMax = parseInt(currentWeather.main.temp_max);
          var tempMin = parseInt(currentWeather.main.temp_min);
          var umidade = parseInt(currentWeather.main.humidity);
          var velocidadeVento = parseInt(currentWeather.wind.speed);
          var pressao = currentWeather.main.pressure;
          var descricaoClima = currentWeather.weather[0].description;
          var visibilidade = currentWeather.visibility;
          var nascerDoSol = new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString();
          var porDoSol = new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString();

          // Convertendo o Unix timestamp para data e hora local
          var dataHora = new Date(currentWeather.dt * 1000).toLocaleString();

          const resposta =
            `Cidade: ${currentWeather.name}\n` +
            `Data e Hora: ${dataHora}\n` +
            `Temperatura Atual: ${temperaturaAtual}ºC\n` +
            `Temperatura Máxima: ${tempMax}ºC\n` +
            `Temperatura Mínima: ${tempMin}ºC\n` +
            `Umidade: ${umidade}%\n` +
            `Velocidade do vento: ${velocidadeVento}km/h\n` +
            `Pressão Atmosférica: ${pressao} hPa\n` +
            `Descrição do clima: ${descricaoClima}\n` +
            `Visibilidade: ${visibilidade} metros\n` +
            `Nascer do sol: ${nascerDoSol}\n` +
            `Pôr do sol: ${porDoSol}`;

          // Adiciona a resposta no banco e atualiza o status
          conversation.messages.push({
            answer: resposta,
            role: 'sistema',
            status: 'respondida',
          });

          await conversation.save();

          res.json({
            "fulfillmentText": resposta
          });
        }
      });
      break;

    default:
      res.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
  }
});



// Rota para obter conversas do usuário pelo ID
router.get('/conversas/:id', verifyToken, async (req, res) => {
  const { id } = req.params; // Obtém o ID do usuário a partir do parâmetro da URL

  try {
    // Busca todas as conversas associadas ao id do usuário
    const conversas = await Conversation.find({ userId: id }).sort({ createdAt: -1 });

    if (!conversas.length) {
      return res.status(404).json({ message: 'Nenhuma conversa encontrada.' });
    }

    res.json(conversas);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ message: 'Erro ao buscar as conversas.' });
  }
});



module.exports = router;
