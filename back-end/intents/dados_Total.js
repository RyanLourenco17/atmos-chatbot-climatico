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
      const { temp, temp_max, temp_min, humidity, pressure } = currentWeather.main;
      const { speed } = currentWeather.wind;
      const descricao = currentWeather.weather[0].description;

      // Respostas dinâmicas baseadas em umidade e pressão
      let humidityResponse;
      if (humidity < 30) {
        humidityResponse = "A umidade está baixa, o que pode deixar o ar seco.";
      } else if (humidity < 60) {
        humidityResponse = "A umidade está agradável. Um bom dia para atividades ao ar livre!";
      } else {
        humidityResponse = "A umidade está alta, considere se hidratar e evitar esforços intensos.";
      }

      let pressureResponse;
      if (pressure < 1000) {
        pressureResponse = "A pressão atmosférica está baixa, o que pode indicar mau tempo.";
      } else {
        pressureResponse = "A pressão atmosférica está normal, boas condições de tempo.";
      }

      let windResponse = speed > 15
        ? "Há ventos fortes, cuidado ao sair com objetos soltos."
        : "O vento está tranquilo, uma boa oportunidade para um passeio.";

      res.json({
        fulfillmentText: `O clima atual em ${currentWeather.name} é: Temperatura: ${parseInt(temp)}ºC com máxima de ${parseInt(temp_max)}ºC e mínima de ${parseInt(temp_min)}ºC. Condições: ${descricao}. ${humidityResponse} ${pressureResponse} ${windResponse}`,
      });
    }
  });
};
