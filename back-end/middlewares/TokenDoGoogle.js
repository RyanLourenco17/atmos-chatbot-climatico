

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
