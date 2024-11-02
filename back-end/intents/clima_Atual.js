const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.error('Erro ao obter dados climáticos:', err);
      res.json({ fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento." });
    } else {
      const { temp, feels_like } = currentWeather.main;
      const description = currentWeather.weather[0].description;

      let dynamicResponse;
      if (temp < 0) {
        dynamicResponse = `Está muito frio em ${cidade}. Vista-se bem e tome cuidado ao sair!`;
      } else if (temp < 15) {
        dynamicResponse = `A temperatura está baixa em ${cidade}. É uma boa ideia usar um casaco!`;
      } else if (temp < 25) {
        dynamicResponse = `O clima está ameno em ${cidade}. Aproveite o dia!`;
      } else {
        dynamicResponse = `Está quente em ${cidade}. Não esqueça de se manter hidratado!`;
      }

      res.json({
        fulfillmentText: `O clima atual em ${currentWeather.name} é de ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C), Condições: ${description}. ${dynamicResponse}`,
      });
    }
  });
};
