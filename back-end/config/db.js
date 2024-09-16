const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
dotenv.config();

// Importando Rotas
const authRoute = require('../routes/AuthRoute');
const userRoute = require('../routes/UserRoute');
const dialogflowRoute = require('../routes/DialogFlowRoute')

// middlewares
const verifyToken = require('../middlewares/VerificarToken');

// Chamando as rotas
// app.use('/auth', authRoute);
// app.use('/users', userRoute);
app.use('/dialogflow', dialogflowRoute);

// Configurando  o servidor e a porta  do Express.js
const dbName = 'Atmos';
const port = 8000;

// Conectando com o Banco de dados
mongoose
  .connect(`mongodb://localhost/${dbName}`)
  .then(() => {
    console.log(`Conectado ao banco de dados ${dbName}`);
  })
  .catch((err) => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });

app.listen(port, () => {
  console.log(`O backend está rodando na porta ${port}`);
});
