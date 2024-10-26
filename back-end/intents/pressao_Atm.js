const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function handlePressaoAtmosfericaIntent(cidade, consultation, res, queryText) {
    if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade para obter as informações de pressão atmosférica." });
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

        const pressNivelMar = currentWeather.main.sea_level;
        const pressNivelSolo = currentWeather.main.grnd_level;
        const resposta = pressNivelMar || pressNivelSolo
            ? `Em ${currentWeather.name}, a pressão atmosférica ao nível do mar está em torno de ${pressNivelMar} hPa e ao nível do solo em torno de ${pressNivelSolo} hPa.`
            : "Não foi possível obter informações da pressão atmosférica para essa cidade no momento.";

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consultation.messages.push(newMessage._id);
        await consultation.save();

        res.json({ "fulfillmentText": resposta, consultationId: consultation._id });

    } catch (error) {
        console.error("Erro ao buscar pressão atmosférica: ", error);
        return res.json({ "fulfillmentText": "Desculpe, não conseguimos obter os dados de pressão atmosférica." });
    }
}

module.exports = handlePressaoAtmosfericaIntent;
