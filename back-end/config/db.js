const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getWeather } = require('./WeatherService');

const app = express();

const corsOptions = {
  origin: ['https://atmos-chatbot-climatico.vercel.app'], // Lista de origens permitidas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Authorization', 'Content-Type'], // Cabeçalhos permitidos
  credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors());

app.use(express.json());
app.use(express.static('public'));
dotenv.config();

// Importando Rotas
const authRoute = require('../routes/AuthRoute');
const userRoute = require('../routes/UserRoute');
const dialogflowRoute = require('../routes/DialogFlowRoute');
const hello = require('../routes/hello');

// Middlewares
const verifyToken = require('../middlewares/VerificarToken');

// Chamando as rotas
app.use('/auth', authRoute);
app.use('/user', verifyToken, userRoute);
// app.use('/dialogflow', verifyToken, dialogflowRoute);
app.use('/hello', hello);

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


app.get("/", (req, res) => {
  res.json({ message: "Rota teste." });
});

app.get("/auth/register", (req, res) => {
  res.json({message: "Rota de cadastro"});
});

app.get("/auth/login", (req, res) => {
  res.json({message: "Rota de login"});
});
