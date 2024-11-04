const helper = require('../middlewares/helper');
const axios = require('axios');

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

const aqiDescriptions = {
  1: "Bom: A qualidade do ar é considerada satisfatória, e a poluição do ar representa pouco ou nenhum risco.",
  2: "Moderado: A qualidade do ar é aceitável; pode haver uma preocupação leve para pessoas sensíveis.",
  3: "Insatisfatório: A qualidade do ar pode causar efeitos adversos em pessoas sensíveis.",
  4: "Ruim: A qualidade do ar é ruim para todos, especialmente para grupos sensíveis.",
  5: "Muito Ruim: A qualidade do ar é muito ruim, afetando a saúde de todos.",
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

    // Montando a resposta detalhada para cada poluente
    const { components } = pollutionData;
    const poluenteInfo = {
      co: "Monóxido de Carbono (CO)",
      no: "Monóxido de Nitrogênio (NO)",
      no2: "Dióxido de Nitrogênio (NO₂)",
      o3: "Ozônio (O₃)",
      so2: "Dióxido de Enxofre (SO₂)",
      nh3: "Amônia (NH₃)",
      pm2_5: "Material Particulado Fino (PM2.5)",
      pm10: "Material Particulado Grosso (PM10)"
    };

    const componentDetails = Object.entries(components)
      .map(([key, value]) => `${poluenteInfo[key] || key}: ${value.toFixed(2)} µg/m³`)
      .join(', ');

    // Respostas dinâmicas baseadas no AQI
    let advice;
    if (pollutionData.aqi === 1) {
      advice = `O ar está limpo em ${cidade}. Pode sair e aproveitar o dia!`;
    } else if (pollutionData.aqi === 2) {
      advice = `A qualidade do ar é boa hoje. Aproveite suas atividades ao ar livre!`;
    } else if (pollutionData.aqi === 3) {
      advice = `O índice de qualidade do ar está moderado em ${cidade}. Considere limitar o tempo ao ar livre se você for sensível a poluentes.`;
    } else if (pollutionData.aqi === 4) {
      advice = `O ar está ruim em ${cidade}. É aconselhável ficar em ambientes fechados se possível.`;
    } else {
      advice = `A qualidade do ar é muito ruim. Evite atividades intensas ao ar livre.`;
    }

    res.json({
      fulfillmentText: `O índice de qualidade do ar (AQI) em ${cidade} é ${pollutionData.aqi} (${aqiDescription}). Componentes detectados: ${componentDetails}. ${advice}`
    });
  } catch (error) {
    console.error('Erro:', error);
    res.json({ fulfillmentText: "Desculpe, ocorreu um erro interno ao processar sua solicitação." });
  }
};
