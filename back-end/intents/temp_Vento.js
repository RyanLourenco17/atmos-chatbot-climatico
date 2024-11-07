const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar." });
  }

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.log(`Erro ao obter dados meteorológicos: ${err}`);
      res.json({
        fulfillmentText: `Erro ao obter dados sobre o vento em ${currentWeather.name}`,
      });
    }else {
      const { speed, deg, gust } = currentWeather.wind;
      const respostasVento = [
        `Em ${currentWeather.name}, a velocidade do vento é de ${parseInt(speed)} m/s, vindo de ${deg} graus.`,
        `Atualmente, a velocidade do vento em ${currentWeather.name} é de ${parseInt(speed)} m/s, com rajadas de ${gust} m/s.`
  ];
      const resposta = respostasVento[Math.floor(Math.random() * respostasVento.length)];
      res.json({fulfillmentText: resposta });
    }
  });
};
