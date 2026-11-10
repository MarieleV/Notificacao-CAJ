// src/controllers/userController.js
// Gestão de usuários — rotas acessíveis apenas por admins.
const userService = require("../services/userService");

/** Envolve o handler tratando erros de regra de negócio (UserError) e erros inesperados. */
const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof userService.UserError) {
      return res.status(error.status).json({ detail: error.message });
    }
    console.error("Erro na gestão de usuários:", error.message);
    res.status(500).json({ detail: "Erro interno na gestão de usuários." });
  }
};

function parseId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new userService.UserError(400, "ID inválido.");
  return id;
}

const list = handle(async (req, res) => {
  res.json({ usuarios: await userService.list() });
});

const create = handle(async (req, res) => {
  const { usuario, nome, senha, perfil } = req.body || {};
  const novo = await userService.create({ usuario, nome, senha, perfil });
  res.status(201).json({ usuario: novo });
});

const update = handle(async (req, res) => {
  const { nome, perfil, ativo } = req.body || {};
  const atualizado = await userService.update(parseId(req), { nome, perfil, ativo }, req.user.id);
  res.json({ usuario: atualizado });
});

const resetSenha = handle(async (req, res) => {
  await userService.setSenha(parseId(req), (req.body || {}).senha);
  res.json({ detail: "Senha redefinida com sucesso." });
});

const remove = handle(async (req, res) => {
  await userService.remove(parseId(req), req.user.id);
  res.status(204).end();
});

module.exports = { list, create, update, resetSenha, remove };
