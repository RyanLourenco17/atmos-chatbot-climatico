const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  if (!cidade) {
    return res.json({ "fulfillmentText": "Por favor, forneça o nome do lugar." });
  }

  helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
    if (err) {
      console.log(err);
      res.json({
        fulfillmentText: `Erro ao obter dados sobre o indice de umidade em ${currentWeather.name}`,
      });
    } else {
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
    }
  });
};
