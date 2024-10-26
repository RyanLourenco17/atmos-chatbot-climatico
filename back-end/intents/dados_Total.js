const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function handleDadosTotalIntent(cidade, consulta, queryText) {
    if (!cidade) {
        return { "fulfillmentText": "Por favor, forneça o nome da cidade para obter os dados completos." };
    }

    try {
        const currentWeather = await new Promise((resolve, reject) => {
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    return reject("Erro ao obter dados climáticos.");
                }
                resolve(currentWeather);
            });
        });

        const { temp, temp_max, temp_min, weather } = currentWeather.main;
        const descricao = weather[0].description;

        const resposta = `Em ${cidade}: Temperatura atual ${temp}°C, máxima ${temp_max}°C, mínima ${temp_min}°C - Condições: ${descricao}`;

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consulta.messages.push(newMessage._id);
        await consulta.save();

        return { "fulfillmentText": resposta };
    } catch (error) {
        console.error("Erro ao buscar dados completos:", error);
        return { "fulfillmentText": "Erro ao obter os dados completos." };
    }
}

module.exports = handleDadosTotalIntent;
