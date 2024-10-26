const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function handleTemperaturaIntent(cidade, consulta, queryText) {
    if (!cidade) {
        return { "fulfillmentText": "Por favor, forneça o nome da cidade para obter a temperatura." };
    }

    try {
        const currentWeather = await new Promise((resolve, reject) => {
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    return
                    console.error("Erro ao buscar clima:", err);
                    reject("Desculpe, não conseguimos encontrar a cidade ou obter os dados climáticos.");
                }
                resolve(currentWeather);
            });
        });

        const { temp, feels_like, weather } = currentWeather.main;
        const descricao = weather[0].description;

        const resposta = `O clima atual em ${cidade} é ${temp}°C (Sensação térmica: ${feels_like}°C) - Condições: ${descricao}`;

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consulta.messages.push(newMessage._id);
        await consulta.save();

        return { "fulfillmentText": resposta, consultationId: consultation._id  };
    } catch (error) {
        console.error("Erro ao buscar temperatura:", error);
        return { "fulfillmentText": "Erro ao obter os dados de temperatura." };
    }
}

module.exports = handleTemperaturaIntent;
