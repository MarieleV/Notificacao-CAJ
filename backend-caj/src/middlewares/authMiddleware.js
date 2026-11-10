// src/middlewares/authMiddleware.js
const { verifyToken, toPublicUser } = require("../services/authService");
const userService = require("../services/userService");

/**
 * Exige o header "Authorization: Bearer <token>" válido.
 * Também confere no banco se o usuário ainda existe e está ativo, para que
 * desativações e mudanças de perfil valham imediatamente (sem esperar o token expirar).
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ detail: "Token de acesso ausente." });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    const expirado = error.name === "TokenExpiredError";
    return res.status(401).json({
      detail: expirado ? "Sessão expirada. Faça login novamente." : "Token inválido.",
    });
  }

  try {
    const user = await userService.findById(Number(payload.sub));
    if (!user || !user.ativo) {
      return res.status(401).json({ detail: "Usuário inativo ou inexistente." });
    }
    req.user = toPublicUser(user);
    next();
  } catch (error) {
    console.error("Erro ao validar usuário:", error.message);
    res.status(500).json({ detail: "Erro interno ao validar acesso." });
  }
}

/** Use depois de requireAuth: permite apenas usuários com perfil admin. */
function requireAdmin(req, res, next) {
  if (req.user?.perfil !== "admin") {
    return res.status(403).json({ detail: "Acesso restrito a administradores." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
