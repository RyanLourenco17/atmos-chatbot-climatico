const fetch = require('node-fetch');
const Message = require("../models/Message");
const Consultation = require("../models/Consultation");

const fetchAirPollution = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Erro na requisição de poluição do ar: ' + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de poluição do ar:', error);
    throw error;
  }
};

const poluicaoArIntent = async (cidade, newConsultation, res) => {
  const helper = new OpenWeatherMapHelper({
    APPID: process.env.OPENWEATHER_API_KEY,
    units: "metric",
  });

  // Busca os dados de clima da cidade
  helper.getCurrentWeatherByCityName(cidade, async (err, currentWeather) => {
    if (err) {
      console.log(err);
      return res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados da cidade." });
    } else {
      const lat = currentWeather.coord.lat;
      const lon = currentWeather.coord.lon;

      try {
        // Obtemos os dados de poluição do ar com as coordenadas
        const pollutionData = await fetchAirPollution(lat, lon);

        // Extraindo informações de poluição do ar
        const qualidadeAr = pollutionData.list[0].main.aqi;
        const pm2_5 = pollutionData.list[0].components.pm2_5;
        const pm10 = pollutionData.list[0].components.pm10;
        const no2 = pollutionData.list[0].components.no2;
        const o3 = pollutionData.list[0].components.o3;
        const co = pollutionData.list[0].components.co;

        const resposta =
          "Cidade: " + cidade + "\n" +
          "Qualidade do Ar (1-5): " + qualidadeAr + "\n" +
          "PM2.5: " + pm2_5 + " µg/m³\n" +
          "PM10: " + pm10 + " µg/m³\n" +
          "NO2: " + no2 + " µg/m³\n" +
          "O3: " + o3 + " µg/m³\n" +
          "CO: " + co + " µg/m³";

        // Cria uma nova mensagem com a resposta
        const newMessage = new Message({ question: cidade, answer: resposta });
        await newMessage.save();

        // Adiciona a mensagem à consulta
        newConsultation.messages.push(newMessage._id);
        await newConsultation.save();

        // Responde ao cliente
        res.json({ "fulfillmentText": resposta, consultationId: newConsultation._id });
      } catch (error) {
        console.error("Erro ao buscar dados de poluição do ar:", error);
        return res.json({ "fulfillmentText": "Desculpe, não conseguimos obter os dados de poluição do ar." });
      }
    }
  });
};

module.exports = poluicaoArIntent;
