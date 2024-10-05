const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getUserByToken = async (token) => {
  if (!token) return res.status(401).json({error: "Acesso negado!"});


  try {
    const secret = process.env.JWT_SECRET || "nossosecret";
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    const user = await User.findOne({_id: userId});

    if (!user) throw new Error("Usuário não encontrado!");

    return user;
  } catch (error) {
    throw new Error("Token inválido ou expirado!");
  }
};


module.exports = getUserByToken;

