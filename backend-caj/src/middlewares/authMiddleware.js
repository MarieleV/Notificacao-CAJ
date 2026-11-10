// src/middlewares/authMiddleware.js
const { verifyToken } = require("../services/authService");

// Exige o header "Authorization: Bearer <token>" válido.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ detail: "Token de acesso ausente." });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    const expirado = error.name === "TokenExpiredError";
    return res.status(401).json({
      detail: expirado ? "Sessão expirada. Faça login novamente." : "Token inválido.",
    });
  }
}

module.exports = { requireAuth };
