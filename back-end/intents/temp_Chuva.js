const helper = require('../middlewares/helper');

function getRandomResponse(respostas) {
    return respostas[Math.floor(Math.random() * respostas.length)];
}

module.exports = async (req, res) => {
    const cidade = req.body.queryResult.parameters["cidade"];

    if (!cidade) {
        return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar para obter as informações de precipitação de chuva." });
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

        const precipitacaoChuva = currentWeather.rain ? currentWeather.rain["1h"] : null;
        const respostas = precipitacaoChuva !== null
            ? [
                `A cidade de ${currentWeather.name} está com precipitação de chuva de aproximadamente ${precipitacaoChuva} mm/h na última hora.`,
                `Atualmente, em ${currentWeather.name}, há ${precipitacaoChuva} mm/h de chuva registrada na última hora.`,
                `Chuva registrada em ${currentWeather.name} é de ${precipitacaoChuva} mm/h.`
            ]
            : [
                `Não há registros de chuva recente em ${currentWeather.name}.`,
                `Parece que não há precipitação de chuva em ${currentWeather.name} no momento.`,
                `Atualmente, não temos dados de chuva para ${currentWeather.name}.`
            ];

        res.json({
            fulfillmentText: getRandomResponse(respostas),
        });
    } catch (error) {
        console.error("Erro ao buscar dados de chuva: ", error);
        return res.json({ "fulfillmentText": "Desculpe, não conseguimos obter os dados de chuva." });
    }
};
