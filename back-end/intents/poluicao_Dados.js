const helper = require('../middlewares/helper');

// Funções auxiliares para dados de geolocalização e poluição
async function getCoordinates(cidade) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (!response.data || response.data.length === 0) throw new Error('No data returned for coordinates.');
    return { lat: response.data[0].lat, lon: response.data[0].lon };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function getAirPollution(lat, lon) {
  const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
  try {
    const response = await axios.get(url);
    return {
      aqi: response.data.list[0].main.aqi,
      components: response.data.list[0].components,
    };
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  try {
    const coordinates = await getCoordinates(cidade);
    if (!coordinates) {
      res.json({ fulfillmentText: 'Erro ao obter coordenadas.' });
      return;
    }
    const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
    if (!pollutionData) {
      res.json({ fulfillmentText: 'Erro ao obter dados de Poluição' });
      return;
    }
    res.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${pollutionData.aqi}.` });
  } catch (error) {
    console.error('Erro:', error);
    res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
  }
};
