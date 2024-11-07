const helper = require('../middlewares/helper');

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

    helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
      if (err) {
        console.log(err);
        res.json({
          fulfillmentText: `Erro ao obter dados sobre a visibilidade e a taxa de nebulosidade em ${currentWeather.name}.`});
      } else {
        const visibilidade = currentWeather.visibility;
        const nebulosidade = currentWeather.clouds.all;

        const respostasVisibilidade = [
          `A região de ${currentWeather.name} está com visibilidade de ${visibilidade} metros e a nebulosidade é de ${nebulosidade}%.`,
          `Em ${currentWeather.name}, a visibilidade é de ${visibilidade} metros, com uma taxa de nebulosidade de ${nebulosidade}%.`,
          `Na região de ${currentWeather.name}, temos uma visibilidade de ${visibilidade} metros e uma nebulosidade de ${nebulosidade}%.`];

        const resposta = respostasVisibilidade[Math.floor(Math.random() * respostasVisibilidade.length)];
        res.json({
          fulfillmentText: resposta});
      }
    })
}
