// src/services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateNotificationText = async (apiKey, baseTexts, metadata) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  const joinedTexts = baseTexts.join("\n---\n");

  const prompt = `
      Você é o assistente jurídico do sistema. Sua tarefa é ler as infrações brutas abaixo e consolidá-las NO EXATO FORMATO exigido a seguir. 
      Não adicione saudações ou textos extras. Apenas preencha o template.
      
      Se houver mais de uma infração, some as informações nos campos "Descrição do fato gerador", "Dispositivo legal" e "Penalidade prevista" de forma coesa.

      FORMATO OBRIGATÓRIO:
      Descrição do fato gerador: [Suas consolidações aqui]
      Dispositivo legal infringido: [Suas consolidações aqui]
      Data da constatação: ${metadata.dataConstatacao || "Não informada"}
      Protocolo: ${metadata.protocolo || "Não informado"}
      Funcionário: ${metadata.funcionario || "Não informado"}
      Equipe: ${metadata.equipe || "Não informada"}
      Penalidade prevista: [Suas consolidações aqui]

      INFRAÇÕES BRUTAS (SELECIONADAS PELO USUÁRIO):
      ${joinedTexts}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

module.exports = { generateNotificationText };