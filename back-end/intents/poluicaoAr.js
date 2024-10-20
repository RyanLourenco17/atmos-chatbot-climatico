const OpenWeatherMapHelper = require("openweathermap-node");
const Message = require("../models/Message");
const Consultation = require("../models/Consultation");

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: "metric",
});

const poluicaoArIntent = async (cidade, newConsultation, res) => {
  // Checa a poluição do ar usando a API OpenWeather
  helper.getCurrentAirPollutionByCityName(cidade, async (err, pollutionData) => {
    if (err) {
      console.log(err);
      return res.json({ "fulfillmentText": "Desculpe, houve um erro ao buscar os dados de poluição do ar." });
    } else {
      // Extraindo informações de poluição do ar
      const qualidadeAr = pollutionData.list[0].main.aqi; // Índice de qualidade do ar
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
    }
  });
};

module.exports = poluicaoArIntent;
