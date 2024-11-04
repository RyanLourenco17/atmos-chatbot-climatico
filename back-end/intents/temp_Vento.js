const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];
  const queryText = req.body.queryResult.queryText;

  await handleVentoIntent(cidade, res, queryText);
}

async function handleVentoIntent(cidade, res, queryText) {
  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar ." });
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

    const { speed, deg, gust } = currentWeather.wind;

    const respostasVento = [
      `Em ${currentWeather.name}, a velocidade do vento é de ${parseInt(speed)} m/s, vindo de ${deg} graus.`,
      `Atualmente, a velocidade do vento em ${currentWeather.name} é de ${parseInt(speed)} m/s, com rajadas de ${gust} m/s.`
    ];

    const resposta = respostasVento[Math.floor(Math.random() * respostasVento.length)];


  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.json({ "fulfillmentText": "Erro ao obter os dados climáticos." });
  }
}
