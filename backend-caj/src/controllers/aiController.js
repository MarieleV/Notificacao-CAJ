// src/controllers/aiController.js
const aiService = require("../services/aiService");
const userService = require("../services/userService");

const generateNotification = async (req, res) => {
  const { textos_base, dataConstatacao, protocolo, funcionario, equipe } = req.body;

  // Validações básicas
  if (!textos_base || !Array.isArray(textos_base)) {
    return res.status(400).json({ detail: "Textos base inválidos ou ausentes." });
  }

  try {
    // Chave do Gemini do usuário logado, guardada cifrada no banco. O navegador não a envia.
    // Se não houver chave, o serviço só reclama quando precisar da IA (o 20012 sozinho não usa).
    let apiKey = null;
    let erroChave = null;
    try {
      apiKey = await userService.getGeminiKey(req.user.id);
    } catch (error) {
      erroChave = error;
    }

    // Chama a regra de negócio
    const texto_gerado = await aiService.generateNotificationText(apiKey, textos_base, {
      dataConstatacao, protocolo, funcionario, equipe
    }, erroChave);

    // Retorna o sucesso
    res.json({ texto_gerado });
  } catch (error) {
    console.error("Erro no AI Service:", error.message);
    res.status(error.status || 500).json({ detail: error.message || "Erro interno ao gerar notificação." });
  }
};

module.exports = { generateNotification };
