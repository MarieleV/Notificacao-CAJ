const express = require("express");
const router = express.Router();

// Importação dos Controllers
const aiController = require("../controllers/aiController");
const calculatorController = require("../controllers/calculatorController");
const documentController = require("../controllers/documentController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const funcionarioController = require("../controllers/funcionarioController");
const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

// Rotas públicas de autenticação
router.post("/auth/login", authController.login);

// Daqui para baixo, todas as rotas exigem token JWT válido
router.use(requireAuth);

router.get("/auth/me", authController.me);
router.put("/auth/senha", authController.trocarSenha);

// Chave do Gemini do próprio usuário (guardada cifrada no banco)
router.get("/auth/gemini", authController.geminiStatus);
router.put("/auth/gemini", authController.salvarGemini);
router.delete("/auth/gemini", authController.removerGemini);

// Gestão de usuários (somente admin)
router.get("/usuarios", requireAdmin, userController.list);
router.post("/usuarios", requireAdmin, userController.create);
router.put("/usuarios/:id", requireAdmin, userController.update);
router.put("/usuarios/:id/senha", requireAdmin, userController.resetSenha);
router.delete("/usuarios/:id", requireAdmin, userController.remove);

// Funcionários (buscas do Redator e da Ouvidoria; só para usuários logados)
router.get("/funcionarios", funcionarioController.list);

// Rotas da IA
router.post("/gerar", aiController.generateNotification);

// Rotas da Calculadora
router.post("/calcular_multa", calculatorController.calculate);

// Rotas de Documentos
router.post("/exportar_parecer_word", documentController.exportParecerWord);
router.post("/exportar_parecer_pdf", documentController.exportParecerPdf);
router.post("/exportar_word", documentController.exportInfracaoWord);
router.post("/exportar_pdf", documentController.exportInfracaoPdf);

module.exports = router;
