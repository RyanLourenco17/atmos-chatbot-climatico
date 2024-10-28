const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

// Chamando as rotas
app.use('/api/auth', authRoute);
app.use('/api/user', verifyToken, userRoute);
app.use('/api/dialogflow', dialogflowRoute);

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
