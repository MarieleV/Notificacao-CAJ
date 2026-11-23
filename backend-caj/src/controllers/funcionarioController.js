// src/controllers/funcionarioController.js
// Lista de funcionários para as buscas do Redator e da Ouvidoria.
// A rota fica depois de requireAuth: só usuários logados recebem nomes e matrículas (PA-14).
const { FUNCIONARIOS } = require("../data/funcionarios");

const list = (req, res) => {
  res.json({ funcionarios: FUNCIONARIOS });
};

module.exports = { list };
