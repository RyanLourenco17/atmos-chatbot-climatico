const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const OpenWeatherMapHelper = require("openweathermap-node");
const fetch = require('node-fetch'); // Adicione esta linha se o fetch não estiver disponível

// Importando Rotas
const authRoute = require('../routes/AuthRoute');
const userRoute = require('../routes/UserRoute');
const dialogflowRoute = require('../routes/DialogFlowRoute');

// Middlewares
const verifyToken = require('../middlewares/VerificarToken');

dotenv.config();

const app = express();

const corsOptions = {
  origin: ['https://atmos-chatbot-climatico.vercel.app', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors());

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// OpenWeatherMap Helper Configuration
const apiKey = process.env.OPENWEATHER_API_KEY;
const helper = new OpenWeatherMapHelper({
    APPID: apiKey,
    units: "metric",
    lang: "pt_br",
});

// Funções auxiliares
async function getCoordinates(cidade) {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${cidade}&limit=1&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }

        const data = await response.json();
        return { lat: data[0].lat, lon: data[0].lon };

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getAirPollution(lat, lon) {
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = await response.json();

        return {
            aqi: data.list[0].main.aqi,
            CO: data.list[0].components.co,
            NO: data.list[0].components.no,
            NO2: data.list[0].components.no2,
            O3: data.list[0].components.o3,
            SO2: data.list[0].components.so2,
            pm2_5: data.list[0].components.pm2_5,
            pm10: data.list[0].components.pm10,
            nh3: data.list[0].components.nh3
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Endpoint para o Dialogflow
app.post("/api/dialogflow", async function (request, response) {
    const intentName = request.body.queryResult.intent.displayName;
    const cidade = request.body.queryResult.parameters["Cidade"];

    switch (intentName) {
        case "clima_Atual":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.error('Erro ao obter dados climáticos:', err);
                    response.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                } else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    response.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                } else {
                    const { temp, feels_like } = currentWeather.main;
                    const description = currentWeather.weather[0].description;
                    response.json({
                        fulfillmentText: `O clima atual em ${currentWeather.name} é:
                                          Temperatura: ${parseInt(temp)}°C (Sensação térmica: ${parseInt(feels_like)}°C)
                                          Condições: ${description}`
                    });
                }
            });
            break;

        case "pressao_Atm":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                } else {
                    const pressNivelMar = currentWeather.main.sea_level;
                    const pressNivelSolo = currentWeather.main.grnd_level;

                    if (pressNivelMar > 1 || pressNivelSolo > 1) {
                        response.json({
                            fulfillmentText: `Na cidade de ${currentWeather.name}:\nA pressão atmosférica ao nível do mar está em torno de ${pressNivelMar} hPa.\n\nA pressão atmosférica ao nível do solo está em torno de ${pressNivelSolo} hPa.`
                        });
                    } else {
                        response.json({ fulfillmentText: 'Não foi possível obter informação da pressão atmosférica para essa cidade no momento.' });
                    }
                }
            });
            break;

        case "Poluicao":
            try {
                const coordinates = await getCoordinates(cidade);
                if (!coordinates) {
                    response.json({ fulfillmentText: 'Erro ao obter coordenadas.' });
                    return;
                }
                const pollutionData = await getAirPollution(coordinates.lat, coordinates.lon);
                if (!pollutionData) {
                    response.json({ fulfillmentText: 'Erro ao obter dados de Poluição' });
                    return;
                }
                const aqi = pollutionData.aqi;

                response.json({ fulfillmentText: `O índice de poluição do ar em ${cidade} é ${aqi}.` });
            } catch (error) {
                console.error('Error:', error);
                response.json({ fulfillmentText: "Desculpe, ocorreu um erro interno." });
            }
            break;

        case "Dados.total":
            helper.getCurrentWeatherByCityName(cidade, (err, currentWeather) => {
                if (err) {
                    console.log(err);
                    response.json({
                        fulfillmentText: "Desculpe, não foi possível encontrar as informações climáticas para essa cidade no momento."
                    });
                } else if (!currentWeather || !currentWeather.main || !currentWeather.weather) {
                    response.json({
                        fulfillmentText: "Dados climáticos inválidos."
                    });
                } else {
                    const { temp, temp_max, temp_min } = currentWeather.main;
                    const descricao = currentWeather.weather[0].description;
                    response.json({
                        fulfillmentText: `O clima atual em ${currentWeather.name} é:
                        Temperatura: ${parseInt(temp)}ºC, Máxima: ${parseInt(temp_max)}ºC, Mínima: ${parseInt(temp_min)}ºC, Condições: ${descricao}`
                    });
                }
            });
            break;
    }
});

// Chamando as rotas
app.use('/api/auth', authRoute);
app.use('/api/user', verifyToken, userRoute);

// Configurando o servidor e a porta do Express.js
const port = process.env.PORT || 10000;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = 'ATMOS';

// Conectando com o Banco de dados
mongoose
    .connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.rslx3.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log(`Conectado ao banco de dados ${DB_NAME}`);
    })
    .catch((err) => {
        console.error('Erro ao conectar com o banco de dados:', err);
    });

app.listen(port, () => {
    console.log(`O backend está rodando na porta ${port}`);
});
