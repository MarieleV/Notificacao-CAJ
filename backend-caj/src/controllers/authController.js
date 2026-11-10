// src/controllers/authController.js
const authService = require("../services/authService");
const userService = require("../services/userService");

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
  res.json({ usuario: req.user });
};

const trocarSenha = async (req, res) => {
  const { senhaAtual, novaSenha } = req.body || {};
  try {
    await userService.trocarPropriaSenha(req.user.id, senhaAtual, novaSenha);
    res.json({ detail: "Senha alterada com sucesso." });
  } catch (error) {
    if (error instanceof userService.UserError) {
      return res.status(error.status).json({ detail: error.message });
    }
    console.error("Erro ao trocar senha:", error.message);
    res.status(500).json({ detail: "Erro interno ao trocar senha." });
  }
};

module.exports = { login, me, trocarSenha };
