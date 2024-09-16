const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota para registrar usuário
router.post('/register', async (req, res) => {});

// Rota para entrar com um usuário
router.post('/login', async (req, res) => {});
