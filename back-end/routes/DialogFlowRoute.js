const express = require('express');
const { getWeather } = require('../config/WeatherService');

const router = express.Router();

router.post('/webhook', async (req, res) => {
    const intentName = req.body.queryResult.intent.displayName;
    const location = req.body.queryResult.parameters.location; // Local fornecido pelo usuário

    if (intentName === 'GetCurrentWeather') {
        try {
            const weatherResponse = await getWeather(location);
            return res.json({ fulfillmentText: weatherResponse });
        } catch (error) {
            return res.json({ fulfillmentText: 'Desculpe, não consegui obter as informações do clima.' });
        }
    } else {
        return res.json({ fulfillmentText: 'Desculpe, não entendi sua solicitação.' });
    }
});

module.exports = router;
