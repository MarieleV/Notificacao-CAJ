// Cria a tabela de usuários (se não existir) e cadastra o primeiro administrador.
// Uso: npm run criar-admin -- <usuario> "<Nome Completo>" "<senha>"
// Se o usuário já existir, ele é promovido a admin, reativado e tem a senha redefinida.
require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { getPool } = require("../src/db/pool");

async function main() {
  const [usuario, nome, senha] = process.argv.slice(2);
  if (!usuario || !nome || !senha) {
    console.error('Uso: npm run criar-admin -- <usuario> "<Nome Completo>" "<senha>"');
    process.exit(1);
  }
  if (senha.length < 8) {
    console.error("A senha deve ter no mínimo 8 caracteres.");
    process.exit(1);
  }

  const pool = getPool();
  try {
    const schema = fs.readFileSync(path.join(__dirname, "../src/db/schema.sql"), "utf8");
    await pool.query(schema);

    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (usuario, nome, senha_hash, perfil, ativo)
       VALUES ($1, $2, $3, 'admin', TRUE)
       ON CONFLICT (usuario) DO UPDATE
         SET nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash,
             perfil = 'admin', ativo = TRUE, atualizado_em = NOW()
       RETURNING id, usuario, nome, perfil`,
      [usuario.trim().toLowerCase(), nome.trim(), hash]
    );
    console.log("Administrador pronto:", rows[0]);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Falha ao criar admin:", err.message);
  process.exit(1);
});
