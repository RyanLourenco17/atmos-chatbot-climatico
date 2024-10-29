const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.log(err);
      res.json({
        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento.",
      });
    } else {
      const { temp, temp_max, temp_min } = currentWeather.main;
      const descricao = currentWeather.weather[0].description;
      res.json({
        fulfillmentText: `O clima atual em ${currentWeather.name} é: Temperatura: ${parseInt(temp)}ºC com máxima de ${parseInt(temp_max)}ºC e mínima de ${parseInt(temp_min)}ºC. Condições: ${descricao}`,
      });
    }
  });
};
