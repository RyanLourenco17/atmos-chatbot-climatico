const { helper } = require('../routes/DialogFlowRoute');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.log(err);
      res.json({ fulfillmentText: "Erro ao obter dados da pressão atmosférica." });
    } else {
      const pressNivelMar = currentWeather.main.sea_level;
      const pressNivelSolo = currentWeather.main.grnd_level;
      res.json({
        fulfillmentText: pressNivelMar && pressNivelSolo
          ? `Na cidade de ${currentWeather.name}. A Pressão ao nível do mar é ${pressNivelMar} hPa, Pressão ao nível do solo: ${pressNivelSolo} hPa`
          : 'Não foi possível obter informação da pressão atmosférica para essa cidade no momento.',
      });
    }
  });
};
