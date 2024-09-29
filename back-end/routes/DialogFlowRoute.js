const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const OpenWeatherMapHelper = require("openweathermap-node");
const verifyToken = require('../middlewares/VerificarToken')

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric"
});


// Ryan
router.post("/Dialogflow", verifyToken, async (req, res) => {
  var intentName = request.body.queryResult.intent.displayName;

  switch(intentName) {
    case "Teste":
      response.json({ "fulfillmentText": "Este teste funciona" });
      break;

    case "Temperatura":
      var cidade = request.body.queryResult.parameters['Cidade'];
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if(err){
          console.log(err);
          response.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados do clima." });
        }
        else {
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

          response.json({
            "fulfillmentText":
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
              "Pôr do sol: " + porDoSol
          });
        }
      });
      break;

    default:
      response.json({ "fulfillmentText": "Desculpe, não entendi sua solicitação." });
  }
});

module.exports = router;
