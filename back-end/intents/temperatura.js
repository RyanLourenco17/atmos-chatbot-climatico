// intents/temperatura.js
const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

async function handleTemperaturaIntent(cidade, consultation, res, queryText) {
  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
  }

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

      // Cria a mensagem para a consulta, agora usando o queryText para salvar a pergunta completa do usuário
      const newMessage = new Message({ question: queryText, answer: resposta });
      await newMessage.save();

      // Adiciona a mensagem à consulta
      consultation.messages.push(newMessage._id);
      await consultation.save();

      // Responde ao cliente
      res.json({ "fulfillmentText": resposta, consultationId: consultation._id });
    }
  });
}


module.exports = handleTemperaturaIntent;
