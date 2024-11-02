const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.log(err);
      res.json({ fulfillmentText: "Erro ao obter dados da pressão atmosférica." });
    } else {
      const pressNivelMar = currentWeather.main.sea_level;
      const pressNivelSolo = currentWeather.main.grnd_level;

      let pressureResponse;
      if (pressNivelMar && pressNivelSolo) {
        pressureResponse = `Na cidade de ${currentWeather.name}, a pressão ao nível do mar é ${pressNivelMar} hPa e a pressão ao nível do solo é ${pressNivelSolo} hPa.`;

        if (pressNivelMar < 1013) {
          pressureResponse += " A pressão está abaixo do normal, o que pode indicar condições climáticas instáveis.";
        } else if (pressNivelMar > 1013) {
          pressureResponse += " A pressão está acima do normal, sugerindo um clima mais estável e seco.";
        } else {
          pressureResponse += " A pressão está normal, indicando condições climáticas típicas.";
        }
      } else {
        pressureResponse = 'Não foi possível obter informações da pressão atmosférica para essa cidade no momento.';
      }

      res.json({
        fulfillmentText: pressureResponse,
      });
    }
  });
};
