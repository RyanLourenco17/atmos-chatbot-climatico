const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota para registrar usuário
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  console.log(req.body);

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  const isEmailExists = await User.findOne({ email });

  if (isEmailExists) {
    return res.status(400).json({ error: 'O e-mail informado já está em uso.' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Instancia um novo usuário
  const user = new User({
    username: username,
    email: email,
    password: passwordHash,
  });

  try {
    const newUser = await user.save();
    res.status(201).json({ message: 'Você realizou o cadastro com sucesso!' });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Rota para entrar com um usuário
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

  const token = jwt.sign({ username: user.username, id: user._id }, secret, { expiresIn: '1h' });
  res.json({ message: 'Você está autenticado!', token, userId: user._id });
});
