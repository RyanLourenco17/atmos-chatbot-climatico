// helper.js
const OpenWeatherMapHelper = require('openweathermap-node');
const dotenv = require('dotenv');
dotenv.config();

const helper = new OpenWeatherMapHelper({
  APPID: process.env.OPENWEATHER_API_KEY,
  units: 'metric',
  lang: 'pt_br',
});

module.exports = helper;
