const helper = require('../middlewares/helper');
const axios = require('axios');

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

// Mapeamento do AQI para uma descrição mais amigável
const aqiDescriptions = {
  1: "Bom (0-50): A qualidade do ar é considerada satisfatória, e a poluição do ar representa pouco ou nenhum risco.",
  2: "Moderado (51-100): A qualidade do ar é aceitável; no entanto, para alguns poluentes, pode haver uma preocupação leve para algumas pessoas.",
  3: "Insatisfatório (101-150): A qualidade do ar é insatisfatória, e pode haver efeitos adversos para a saúde em algumas pessoas, especialmente aquelas mais sensíveis à poluição do ar.",
  4: "Ruim (151-200): A qualidade do ar é ruim, e todos podem começar a sentir os efeitos da poluição. A saúde dos grupos sensíveis pode ser afetada.",
  5: "Muito Ruim (201-300): A qualidade do ar é muito ruim, e pode haver efeitos mais sérios na saúde para todos.",
  6: "Perigoso (301-500): A qualidade do ar é considerada perigosa, e toda a população pode ser afetada.",
};

module.exports = async (req, res) => {
  const cidade = req.body.queryResult.parameters["cidade"];

  try {
    const coordinates = await getCoordinates(cidade);
    if (!coordinates) {
      res.json({ fulfillmentText: 'Desculpe, não consegui obter as coordenadas da cidade.' });
      return;
    }
    const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
    if (!pollutionData) {
      res.json({ fulfillmentText: 'Desculpe, não consegui obter dados sobre a poluição do ar.' });
      return;
    }

    // Obtendo a descrição do AQI
    const aqiDescription = aqiDescriptions[pollutionData.aqi] || 'Dados de qualidade do ar não disponíveis.';

    // Montando a resposta
    const components = pollutionData.components;
    const componentDetails = Object.entries(components)
      .map(([key, value]) => `${key}: ${value.toFixed(2)} µg/m³`)
      .join(', ');

    res.json({
      fulfillmentText: `O índice de qualidade do ar (AQI) em ${cidade} é ${pollutionData.aqi} (${aqiDescription}). Os principais componentes da poluição do ar incluem: ${componentDetails}.`
    });
  } catch (error) {
    console.error('Erro:', error);
    res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno ao processar sua solicitação." });
  }
};
