const helper = require('../middlewares/helper');

function getRandomResponse(respostas) {
    return respostas[Math.floor(Math.random() * respostas.length)];
}

module.exports = async (req, res) => {
    const cidade = req.body.queryResult.parameters["cidade"];
    if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar para obter a previsão de temperatura máxima." });
    }

    try {
        const currentWeather = await new Promise((resolve, reject) => {
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error("Erro ao buscar clima: ", err);
                    return reject(err);
                }
                resolve(currentWeather);
            });
        });

        if (!currentWeather || currentWeather.cod !== 200) {
            return res.json({ "fulfillmentText": "Não foi possível encontrar o lugar ou obter as informações climáticas." });
        }

        const tempMax = Math.round(currentWeather.main.temp_max);
        const respostas = [
            `A previsão de temperatura máxima para ${currentWeather.name} é de aproximadamente ${tempMax}°C.`,
            `Hoje, a temperatura máxima esperada em ${currentWeather.name} é de ${tempMax}°C.`,
            `Em ${currentWeather.name}, a temperatura pode alcançar até ${tempMax}°C hoje.`
        ];

        res.json({
            fulfillmentText: getRandomResponse(respostas),
        });
    } catch (error) {
        console.error("Erro ao buscar temperatura máxima: ", error);
        return res.json({ "fulfillmentText": "Desculpe, não conseguimos obter os dados de temperatura máxima." });
    }
};
