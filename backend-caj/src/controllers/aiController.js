// src/controllers/aiController.js
const aiService = require("../services/aiService");

const generateNotification = async (req, res) => {
  const { textos_base, dataConstatacao, protocolo, funcionario, equipe } = req.body;

  // Validações básicas (a chave do Gemini fica no servidor, em GEMINI_API_KEY; PA-14)
  if (!textos_base || !Array.isArray(textos_base)) {
    return res.status(400).json({ detail: "Textos base inválidos ou ausentes." });
  }

  try {
    // Chama a regra de negócio
    const texto_gerado = await aiService.generateNotificationText(textos_base, {
      dataConstatacao, protocolo, funcionario, equipe
    });

    // Retorna o sucesso
    res.json({ texto_gerado });
  } catch (error) {
    console.error("Erro no AI Service:", error);
    res.status(500).json({ detail: error.message || "Erro interno ao gerar notificação." });
  }
};

module.exports = { generateNotification };
