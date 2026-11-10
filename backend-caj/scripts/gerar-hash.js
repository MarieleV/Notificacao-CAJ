// Gera o hash bcrypt de uma senha para usar em AUTH_USERS.
// Uso: npm run hash -- "minhaSenha"
const bcrypt = require("bcryptjs");

const senha = process.argv[2];
if (!senha) {
  console.error('Uso: npm run hash -- "minhaSenha"');
  process.exit(1);
}

console.log(bcrypt.hashSync(senha, 10));
