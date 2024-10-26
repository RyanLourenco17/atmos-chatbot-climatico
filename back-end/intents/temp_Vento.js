const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function handleVentoIntent(cidade, consultation, res, queryText) {
    if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome da cidade." });
    }
    try {
        const currentWeather = await new Promise((resolve, reject) => {
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error("Erro ao buscar clima:", err);
                    return res.json({ "fulfillmentText": "Erro ao obter os dados climáticos." });
                }
                resolve(currentWeather);
            });
        });

        if (!currentWeather || currentWeather.cod !== 200) {
            return res.json({ "fulfillmentText": "Cidade ou informações não disponíveis." });
        }

        const { speed, deg, gust } = currentWeather.wind;
        const resposta = `Cidade: ${currentWeather.name}\nVelocidade do Vento: ${parseInt(speed)} m/s\nDireção do Vento: ${deg} graus\nRajada de Vento: ${gust} m/s`;

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consultation.messages.push(newMessage._id);
        await consultation.save();

        res.json({ "fulfillmentText": resposta, consultationId: consultation._id });
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        res.json({ "fulfillmentText": "Erro ao obter os dados climáticos." });
    }
}

module.exports = handleVentoIntent;