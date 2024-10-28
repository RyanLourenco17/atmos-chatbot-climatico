const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { SessionsClient } = require('@google-cloud/dialogflow');

dotenv.config();

const app = express();
const port = process.env.DIALOGFLOW_PORT || 3000;

const corsOptions = {
  origin: ['https://atmos-chatbot-climatico.vercel.app', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const client = new SessionsClient();
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

app.post('/api/dialogflow', async (req, res) => {
  const { sessionId, query } = req.body;

  if (!sessionId || !query) {
    return res.status(400).send('sessionId e query são obrigatórios.');
  }

  const queryInput = {
    text: {
      text: query,
      languageCode: 'pt-BR',
    },
  };

  const request = {
    session: client.projectAgentSessionPath(projectId, sessionId),
    queryInput: queryInput,
  };

  try {
    const [response] = await client.detectIntent(request);
    res.json(response.queryResult);
  } catch (error) {
    console.error('Erro ao interagir com o Dialogflow:', error);
    res.status(500).send('Erro ao processar a requisição no Dialogflow');
  }
});

app.listen(port, () => {
  console.log(`Servidor Dialogflow rodando na porta ${port}`);
});
