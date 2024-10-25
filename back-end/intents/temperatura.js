// intents/temperatura.js
const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

async function handleTemperaturaIntent(cidade, consultation, queryText) {
  if (!cidade) {
    return { fulfillmentText: "Por favor, forneça o nome da cidade para obter a previsão de temperatura." };
  }

  try {
    const currentWeather = await new Promise((resolve, reject) => {
      helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
        if (err) {
          console.error("Erro ao buscar clima:", err);
          reject(new Error("Desculpe, não conseguimos encontrar a cidade ou obter os dados climáticos."));
        }
        resolve(currentWeather);
      });
    });

    if (!currentWeather || currentWeather.cod !== 200) {
      return { fulfillmentText: "Não foi possível encontrar a cidade ou obter as informações climáticas." };
    }

    const temperatura = currentWeather.main.temp;
    const descricao = currentWeather.weather[0].description;
    const resposta = `A temperatura atual em ${cidade} é de ${temperatura}°C com ${descricao}.`;

    // Cria uma nova mensagem com a resposta
    const newMessage = new Message({ question: queryText, answer: resposta });
    await newMessage.save();

    // Adiciona a mensagem à consulta
    consultation.messages.push(newMessage._id);
    await consultation.save();

    return { fulfillmentText: resposta, consultationId: consultation._id };

  } catch (error) {
    console.error("Erro ao buscar temperatura:", error);
    return { fulfillmentText: "Desculpe, não conseguimos obter os dados de temperatura." };
  }
}



module.exports = handleTemperaturaIntent;
