const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getWeather } = require('./WeatherService');

const app = express();

app.use(cors({
  origin: 'https://atmos-chatbot-climatico.vercel.app',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE'],
  credentials: true
}));

// Suporte para preflight requests
app.options('*', cors());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Rota funcionando com CORS habilitado!' });
});

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
const port = process.env.PORT || 8000;
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

// Testando rota
app.get('/webhook/dialogflow', (req, res) => {
  res.send('Rota do webhook funcionando!');
});




