require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const routes = require("./routes/indexRoutes");

const app = express();

// CORS: só o front-end publicado e o ambiente local podem chamar a API pelo navegador (PA-14).
// Para trocar a lista, defina CORS_ORIGINS com as URLs separadas por vírgula.
const ORIGENS_PADRAO = ["https://notificacao-caj-7ncb.vercel.app", "http://localhost:5173"];
const origensPermitidas = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origem) => origem.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: origensPermitidas.length > 0 ? origensPermitidas : ORIGENS_PADRAO,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
// Pluga todas as rotas (O /api indica que todas as rotas em indexRoutes terão esse prefixo)
app.use("/api", routes);

// Inicialização do Servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Motor de Notificações rodando na porta ${PORT}`);
  });
}

module.exports = app;