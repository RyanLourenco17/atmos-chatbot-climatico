const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar." });
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
      return res.json({ "fulfillmentText": "Lugar ou informações não disponíveis." });
    }

    const umidadeTempo = currentWeather.main.humidity;

    const respostasUmidade = [
      `A umidade atual em ${currentWeather.name} está em ${umidadeTempo}%.`,
      `Em ${currentWeather.name}, a umidade é de ${umidadeTempo}%.`,
      `Atualmente, ${currentWeather.name} apresenta uma umidade de ${umidadeTempo}%.`
    ];

    const resposta = umidadeTempo
      ? respostasUmidade[Math.floor(Math.random() * respostasUmidade.length)]
      : "Não temos dados sobre a umidade deste lugar.";

    res.json({ "fulfillmentText": resposta });

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.json({ "fulfillmentText": "Erro ao obter os dados climáticos." });
  }
};
