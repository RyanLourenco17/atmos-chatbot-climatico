// const axios = require('axios');

// const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // Use a chave do ambiente

// async function getWeather(location) {
//     try {
//         const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${OPENWEATHER_API_KEY}`, {
//             params: {
//                 q: location,
//                 appid: OPENWEATHER_API_KEY,
//                 units: 'metric',
//                 lang: 'pt'
//             }
//         });

//         const data = response.data;
//         const description = data.weather[0].description;
//         const temperature = data.main.temp;

//         return `O clima em ${location} está ${description} com temperatura de ${temperature}°C.`;
//     } catch (error) {
//         console.error('Erro ao obter clima:', error);
//         throw new Error('Não foi possível obter as informações climáticas.');
//     }
// }

// module.exports = { getWeather };


