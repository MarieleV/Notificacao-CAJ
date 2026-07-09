const express = require("express");
const router = express.Router();

// Importação dos Controllers
const aiController = require("../controllers/aiController");
const calculatorController = require("../controllers/calculatorController");
const documentController = require("../controllers/documentController");

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