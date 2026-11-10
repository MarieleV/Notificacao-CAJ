// src/controllers/authController.js
const authService = require("../services/authService");

const login = async (req, res) => {
  const { usuario, senha } = req.body || {};

  if (!usuario || !senha) {
    return res.status(400).json({ detail: "Usuário e senha são obrigatórios." });
  }

  try {
    const result = await authService.authenticate(usuario, senha);
    if (!result) {
      return res.status(401).json({ detail: "Usuário ou senha inválidos." });
    }
    res.json(result);
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(500).json({ detail: "Erro interno ao autenticar." });
  }
};

const me = (req, res) => {
  const { usuario, nome } = req.user;
  res.json({ usuario: { usuario, nome } });
};

module.exports = { login, me };
