// src/index.js
const express = require("express");
const cors = require("cors");
const routes = require("./routes/indexRoutes");

const app = express();

// Middlewares Globais
app.use(cors({ origin: "*" })); 
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