const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// middlewares
const verifyToken = require('../middlewares/VerificarToken');
const getUserByToken = require('../middlewares/obterUsuario_PorToken');

// Rota para mostrar dados do usuario
router.get('/user/:id', async (req, res) => {});

// Rota para atualizar as informações do usuário
router.put('/user/:id', async (req, res) => {});

// Rota para excluir a conta
router.delete('/user/:id', async (req, res) => {});
