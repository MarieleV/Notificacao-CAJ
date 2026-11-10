// src/services/authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Falha "fechada": sem segredo forte configurado, ninguém autentica.
    throw new Error("JWT_SECRET não configurado (mínimo de 32 caracteres).");
  }
  return secret;
}

/**
 * Lê os usuários da variável de ambiente AUTH_USERS.
 * Formato: JSON array -> [{ "usuario": "maria", "nome": "Maria Silva", "senhaHash": "$2b$10$..." }]
 * Gere o hash com: npm run hash -- "minhaSenha"
 */
function loadUsers() {
  const raw = process.env.AUTH_USERS;
  if (!raw) return [];
  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (err) {
    console.error("AUTH_USERS inválido (não é um JSON válido).");
    return [];
  }
}

// Hash "dummy" usado quando o usuário não existe, para que o tempo de resposta
// seja parecido com o de uma senha errada (dificulta descobrir usuários válidos).
const DUMMY_HASH = bcrypt.hashSync("usuario-inexistente", 10);

async function authenticate(usuario, senha) {
  const login = String(usuario).trim().toLowerCase();
  const user = loadUsers().find((u) => String(u.usuario).trim().toLowerCase() === login);

  const senhaOk = await bcrypt.compare(String(senha), user ? user.senhaHash : DUMMY_HASH);
  if (!user || !senhaOk) return null;

  const publicUser = { usuario: user.usuario, nome: user.nome || user.usuario };
  const token = jwt.sign(publicUser, getJwtSecret(), {
    subject: String(user.usuario),
    expiresIn: JWT_EXPIRES_IN,
  });

  return { token, usuario: publicUser };
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
}

module.exports = { authenticate, verifyToken };
