const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Função para simular a obtenção de um accessToken do Google OAuth
async function getGoogleAccessToken() {
  // Em uma implementação real, você chamaria a API do Google para obter um accessToken válido.
  // Aqui estamos simulando um token de acesso.
  return "simulated_google_access_token";
}

// Cadastro do usuário
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  const isEmailExists = await User.findOne({ email });

  if (isEmailExists) {
    return res.status(400).json({ error: 'O e-mail informado já está em uso.' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name: name,
    email: email,
    password: passwordHash,
  });

  try {
    const secret = process.env.JWT_SECRET || "nossosecret";
    const newUser = await user.save();
    const token = jwt.sign({ name: newUser.name, id: newUser._id }, secret);

    res.status(201).json({ message: 'Você realizou o cadastro com sucesso!' });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Autenticação de Login
router.post('/login', async (req, res) => {
  const secret = process.env.JWT_SECRET || "nossosecret";
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ error: 'Não há usuário cadastrado com este e-mail!' });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(400).json({ error: 'Senha inválida!' });
  }

  // Gerar o token de autenticação JWT
  const token = jwt.sign({ name: user.name, id: user._id }, secret);

  // Obter o accessToken do Google (simulado para este exemplo)
  const accessToken = await getGoogleAccessToken();

  res.json({ message: 'Você está autenticado!', token, userId: user._id, accessToken });
});

module.exports = router;
