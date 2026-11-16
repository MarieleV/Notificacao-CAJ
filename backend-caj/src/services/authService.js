// src/services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("./userService");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Falha "fechada": sem segredo forte configurado, ninguém autentica.
    throw new Error("JWT_SECRET não configurado (mínimo de 32 caracteres).");
  }
  return secret;
}

// Hash "dummy" usado quando o usuário não existe, para que o tempo de resposta
// seja parecido com o de uma senha errada (dificulta descobrir usuários válidos).
const DUMMY_HASH = bcrypt.hashSync("usuario-inexistente", 10);

function toPublicUser(u) {
  return { id: u.id, usuario: u.usuario, nome: u.nome, perfil: u.perfil };
}

async function authenticate(usuario, senha) {
  const user = await userService.findByUsuarioComSenha(usuario);

  const senhaOk = await bcrypt.compare(String(senha), user ? user.senha_hash : DUMMY_HASH);
  if (!user || !senhaOk || !user.ativo) return null;

  const publicUser = toPublicUser(user);
  const token = jwt.sign(publicUser, getJwtSecret(), {
    subject: String(user.id),
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, usuario: publicUser };
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
}

module.exports = { authenticate, verifyToken, toPublicUser };
