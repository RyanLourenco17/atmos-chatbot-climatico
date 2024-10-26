const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function handleTempMaxIntent(cidade, consultation, res, queryText) {
    if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para obter a previsão de temperatura máxima." });
    }
    try {
        const currentWeather = await new Promise((resolve, reject) => {
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error("Erro ao buscar clima: ", err);
                    return res.json({ "fulfillmentText": "Desculpe, não consegui encontrar a cidade ou obter os dados climáticos." });
                }
                resolve(currentWeather);
            });
        });

        if (!currentWeather || currentWeather.cod !== 200) {
            return res.json({ "fulfillmentText": "Não foi possível encontrar a cidade ou obter as informações climáticas." });
        }

        const tempMax = Math.round(currentWeather.main.temp_max);
        const resposta = `A temperatura máxima prevista para ${currentWeather.name} é de ${tempMax}°C.`;

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consultation.messages.push(newMessage._id);
        await consultation.save();

        res.json({ "fulfillmentText": resposta, consultationId: consultation._id });

    } catch (error) {
        console.error("Erro ao buscar temperatura máxima: ", error);
        return res.json({ "fulfillmentText": "Desculpe, não conseguimos obter os dados de temperatura máxima." });
    }
}

module.exports = handleTempMaxIntent;
