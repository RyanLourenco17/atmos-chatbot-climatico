const { google } = require('googleapis');

const getAccessToken = async () => {
  const jwtClient = new google.auth.JWT(
    process.env.DIALOGFLOW_CLIENT_EMAIL, // Email do serviço
    null,
    process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'), // Chave privada
    ['https://www.googleapis.com/auth/cloud-platform'] // Escopos necessários
  );

  await jwtClient.authorize();
  const accessToken = jwtClient.credentials.access_token;
  return accessToken;
};

const { GoogleAuth } = require('google-auth-library');

async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform', // Ou o escopo específico que você precisa
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken;
}


module.exports = getAccessToken;
