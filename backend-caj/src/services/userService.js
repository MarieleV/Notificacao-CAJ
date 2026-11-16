// src/services/userService.js
const bcrypt = require("bcryptjs");
const db = require("../db/pool");

const BCRYPT_ROUNDS = 10;
const PERFIS = ["admin", "usuario"];
const USUARIO_REGEX = /^[a-z0-9._-]{3,50}$/;
const SENHA_MIN = 8;

const PUBLIC_COLUMNS = "id, usuario, nome, perfil, ativo, criado_em, atualizado_em";

/** Erro de regra de negócio com status HTTP associado. */
class UserError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function normalizarUsuario(usuario) {
  return String(usuario || "").trim().toLowerCase();
}

function validarSenha(senha) {
  if (typeof senha !== "string" || senha.length < SENHA_MIN) {
    throw new UserError(400, `A senha deve ter no mínimo ${SENHA_MIN} caracteres.`);
  }
}

function validarNome(nome) {
  const n = String(nome || "").trim();
  if (n.length < 2 || n.length > 120) {
    throw new UserError(400, "Informe um nome válido (2 a 120 caracteres).");
  }
  return n;
}

function validarPerfil(perfil) {
  if (!PERFIS.includes(perfil)) {
    throw new UserError(400, "Perfil inválido. Use 'admin' ou 'usuario'.");
  }
}

function hashSenha(senha) {
  return bcrypt.hash(senha, BCRYPT_ROUNDS);
}

async function findByUsuarioComSenha(usuario) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_COLUMNS}, senha_hash FROM usuarios WHERE usuario = $1`,
    [normalizarUsuario(usuario)]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function list() {
  const { rows } = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios ORDER BY nome`);
  return rows;
}

async function create({ usuario, nome, senha, perfil = "usuario" }) {
  const login = normalizarUsuario(usuario);
  if (!USUARIO_REGEX.test(login)) {
    throw new UserError(
      400,
      "Usuário inválido. Use de 3 a 50 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado."
    );
  }
  const nomeOk = validarNome(nome);
  validarSenha(senha);
  validarPerfil(perfil);

  try {
    const { rows } = await db.query(
      `INSERT INTO usuarios (usuario, nome, senha_hash, perfil)
       VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
      [login, nomeOk, await hashSenha(senha), perfil]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw new UserError(409, "Já existe um usuário com esse login.");
    throw err;
  }
}

/** Atualiza nome, perfil e/ou status. `atorId` é o admin que está fazendo a alteração. */
async function update(id, { nome, perfil, ativo }, atorId) {
  const atual = await findById(id);
  if (!atual) throw new UserError(404, "Usuário não encontrado.");

  const novo = {
    nome: nome !== undefined ? validarNome(nome) : atual.nome,
    perfil: perfil !== undefined ? perfil : atual.perfil,
    ativo: ativo !== undefined ? Boolean(ativo) : atual.ativo,
  };
  validarPerfil(novo.perfil);

  // Impede que o admin tire o próprio acesso (garante que sempre exista um admin ativo).
  if (atual.id === atorId && (novo.perfil !== "admin" || !novo.ativo)) {
    throw new UserError(400, "Você não pode remover seu próprio perfil de admin nem desativar sua conta.");
  }

  const { rows } = await db.query(
    `UPDATE usuarios SET nome = $1, perfil = $2, ativo = $3, atualizado_em = NOW()
     WHERE id = $4 RETURNING ${PUBLIC_COLUMNS}`,
    [novo.nome, novo.perfil, novo.ativo, id]
  );
  return rows[0];
}

async function setSenha(id, senha) {
  validarSenha(senha);
  const { rowCount } = await db.query(
    "UPDATE usuarios SET senha_hash = $1, atualizado_em = NOW() WHERE id = $2",
    [await hashSenha(senha), id]
  );
  if (!rowCount) throw new UserError(404, "Usuário não encontrado.");
}

/** Troca da própria senha: exige a senha atual. */
async function trocarPropriaSenha(id, senhaAtual, novaSenha) {
  const { rows } = await db.query("SELECT senha_hash FROM usuarios WHERE id = $1", [id]);
  if (!rows[0]) throw new UserError(404, "Usuário não encontrado.");
  const ok = await bcrypt.compare(String(senhaAtual || ""), rows[0].senha_hash);
  if (!ok) throw new UserError(400, "Senha atual incorreta.");
  await setSenha(id, novaSenha);
}

async function remove(id, atorId) {
  if (id === atorId) throw new UserError(400, "Você não pode excluir sua própria conta.");
  const { rowCount } = await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
  if (!rowCount) throw new UserError(404, "Usuário não encontrado.");
}

module.exports = {
  UserError,
  findByUsuarioComSenha,
  findById,
  list,
  create,
  update,
  setSenha,
  trocarPropriaSenha,
  remove,
};
