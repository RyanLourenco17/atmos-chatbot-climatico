const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];
  const queryText = req.body.queryResult.queryText;

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

    const visibilidade = currentWeather.visibility;
    const nebulosidade = currentWeather.clouds.all;

    const respostasVisibilidade = [
      `A região de ${currentWeather.name} está com visibilidade de ${visibilidade} metros e a nebulosidade é de ${nebulosidade}%.`,
      `Em ${currentWeather.name}, a visibilidade é de ${visibilidade} metros, com uma taxa de nebulosidade de ${nebulosidade}%.`,
      `Na região de ${currentWeather.name}, temos uma visibilidade de ${visibilidade} metros e uma nebulosidade de ${nebulosidade}%.`
    ];

    const resposta = respostasVisibilidade[Math.floor(Math.random() * respostasVisibilidade.length)];
    res.json({ "fulfillmentText": resposta });

  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.json({ "fulfillmentText": "Erro ao obter os dados climáticos." });
  }
};
