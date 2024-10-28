const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Acesso negado!" });
  }

  try {
    const secret = process.env.JWT_SECRET || "nossosecret";
    const verified = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.userId = verified.id;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    res.status(400).json({ error: "O Token é inválido!" });
  }
};

module.exports = checkToken;
