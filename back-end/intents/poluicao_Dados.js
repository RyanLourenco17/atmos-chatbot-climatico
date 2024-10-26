const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
    lang: "pt_br"
});

async function poluicaoArIntent(cidade, consulta, queryText) {
    if (!cidade) {
        return { "fulfillmentText": "Por favor, forneça o nome da cidade para obter os dados de poluição do ar." };
    }

    async function getCoordinates(cidade) {
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return { lat: data[0].lat, lon: data[0].lon };
    }

    async function getAirPollution(lat, lon) {
        const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        return response.json();
    }

    try {
        const { lat, lon } = await getCoordinates(cidade);
        const pollutionData = await getAirPollution(lat, lon);
        const aqi = pollutionData.list[0].main.aqi;

        const resposta = `O índice de poluição do ar em ${cidade} é ${aqi}.`;

        const newMessage = new Message({ question: queryText, answer: resposta });
        await newMessage.save();

        consulta.messages.push(newMessage._id);
        await consulta.save();

        return { "fulfillmentText": resposta };
    } catch (error) {
        console.error("Erro ao buscar dados de poluição do ar:", error);
        return { "fulfillmentText": "Erro ao obter os dados de poluição do ar." };
    }
}

module.exports = poluicaoArIntent;
