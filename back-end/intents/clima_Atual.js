const { helper } = require('../routes/DialogFlowRoute');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.error('Erro ao obter dados climáticos:', err);
      res.json({ fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento." });
    } else {
      const { temp, feels_like } = currentWeather.main;
      const description = currentWeather.weather[0].description;
      res.json({
        fulfillmentText: `O clima atual em ${currentWeather.name} é de ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C), Condições: ${description}`,
      });
    }
  });
};
