const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// middlewares
const verifyToken = require('../middlewares/VerificarToken');
const getUserByToken = require('../middlewares/obterUsuario_PorToken');

// Rota para mostrar dados do usuário
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const user = await getUserByToken(token);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para atualizar usuário
router.put('/:id', verifyToken, async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Recupera o token do cabeçalho

  try {
    const user = await getUserByToken(token); // Verifica o token e obtém o usuário
    const userId = req.params.id;

    // Verifica se o ID do usuário corresponde ao ID do token
    if (user._id.toString() !== userId) {
      return res.status(401).json({ error: "Acesso negado!" });
    }

    // Cria o objeto de atualização do usuário
    const updateData = {
      name: req.body.name,
      email: req.body.email,
      theme: req.body.theme,  // Adiciona a troca de tema
    };

    // Verifica se uma nova senha foi fornecida
    if (req.body.password) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(req.body.password, salt);
      updateData.password = passwordHash;
    }

    // Atualiza os dados do usuário no banco de dados
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ error: null, msg: "Usuário atualizado com sucesso!", data: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para deletar usuário
router.delete("/:id", verifyToken, async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  try {
    const user = await getUserByToken(token);
    const userId = req.params.id;

    if (user._id.toString() !== userId) {
      return res.status(401).json({ error: "Acesso negado!" });
    }

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ msg: "Usuário removido com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

