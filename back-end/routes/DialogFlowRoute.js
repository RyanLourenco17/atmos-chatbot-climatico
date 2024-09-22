// routes/DialogFlowRoute.js
const express = require('express');
const { getWeather } = require('../config/WeatherService'); // Ajuste o caminho se necessário

const router = express.Router();

router.post('/webhook', async (req, res) => {
  if(intentName == 'Temperatura'){
    var cidade = request.body.queryResult.parameters['Cidade'];
    helper.getCurrentWeatherByCityName(""+cidade+"", (err, currentWeather) => {
      if(err){
        console.log(err);
      }
      else{
        console.log(currentWeather);
        var temperaturaAtual = parseInt (currentWeather.main.temp);
        var tempMax = parseInt (currentWeather.main.temp_max);
        var tempMin = parseInt (currentWeather.main.temp_min);

        response.json({"fulfillmentText" :
          "Cidade: "+currentWeather.name+"\n"+
          "Temperatura Atual: "+temperaturaAtual+"\n"+
          "Temperatura Máxima: "+tempMax+"\n"+
          "Temperatura Mínima: "+tempMin
        })
        console.log(currentWeather);

      }
    });
  }

});

module.exports = router;

