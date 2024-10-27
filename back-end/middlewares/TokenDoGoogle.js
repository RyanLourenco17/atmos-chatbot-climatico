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


module.exports = getAccessToken;
