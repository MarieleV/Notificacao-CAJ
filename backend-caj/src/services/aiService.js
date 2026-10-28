const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-2.5-flash";

const RE_MESES = /Meses sem acesso:[^\n]*/i;
const isSemProtocolo = (p) => !p || /^n[ãa]o se aplica$/i.test(String(p).trim());

// Preenche "Campo: " vazio (fim de linha) com o valor informado
const preencherCampo = (texto, rotulo, valor) =>
  texto.replace(
    new RegExp(`(${rotulo}:)[ \\t]*(?=\\r?\\n|$)`, "im"),
    (_, r) => `${r} ${valor}`
  );

const generateNotificationText = async (apiKey, baseTexts, metadata) => {
  const textos = Array.isArray(baseTexts) ? baseTexts : [];
  if (textos.length === 0) throw new Error("Nenhum texto base recebido.");

  const funcionario = metadata.funcionario || "Não informado";
  const equipe = metadata.equipe || "Não informada";

  const temMeses = textos.some((t) => RE_MESES.test(t));

  // ── CASO 1: apenas 20012 (Falta de acesso para leitura) → sem IA ──────────
  // Não tem Data da constatação nem Protocolo; tem "Meses sem acesso".
  if (textos.length === 1 && temMeses) {
    let texto = textos[0];
    texto = preencherCampo(texto, "Funcionário", funcionario);
    texto = preencherCampo(texto, "Equipe", equipe);
    return texto.trim();
  }

  // ── CASO 2: demais códigos (e combinações) → IA consolida ────────────────
  const apiKeyLimpa = String(apiKey || "").trim();
  if (!apiKeyLimpa) throw new Error("Chave de API do Gemini não informada.");

  const genAI = new GoogleGenerativeAI(apiKeyLimpa);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { temperature: 0.2 },
  });

  const joinedTexts = textos.join("\n---\n");

  // Monta o formato dinamicamente
  const linhas = [
    "Descrição do fato gerador: [consolidação]",
    "Dispositivo legal infringido: [consolidação]",
    `Data da constatação: ${metadata.dataConstatacao || "Não informada"}`,
  ];

  if (!isSemProtocolo(metadata.protocolo)) {
    linhas.push(`Protocolo: ${metadata.protocolo}`);
  }

  if (temMeses) {
    const linhaMeses = textos.map((t) => t.match(RE_MESES)).find(Boolean)[0].trim();
    linhas.push(linhaMeses);
  }

  linhas.push(
    `Funcionário: ${funcionario}`,
    `Equipe: ${equipe}`,
    "Penalidade prevista: [consolidação]"
  );

  const prompt = `
Você é o assistente jurídico do sistema. Sua tarefa é ler as infrações brutas abaixo e consolidá-las NO EXATO FORMATO exigido a seguir.

REGRAS:
- Não adicione saudações, comentários, markdown, asteriscos ou textos extras. Apenas preencha o template.
- Mantenha os espaços normais entre todas as palavras (nunca junte palavras).
- Copie literalmente as linhas que já vêm preenchidas no formato (Data, Protocolo, Meses sem acesso, Funcionário, Equipe).
- Se houver mais de uma infração, una as informações nos campos "Descrição do fato gerador", "Dispositivo legal infringido" e "Penalidade prevista" de forma coesa (ex.: "Artigo 144, inciso I e Artigo 144, inciso XIII da Resolução 019/2019 - ARIS.").
- Não omita nenhuma obrigação ou prazo presente nas penalidades originais.

FORMATO OBRIGATÓRIO:
${linhas.join("\n")}

INFRAÇÕES BRUTAS (SELECIONADAS PELO USUÁRIO):
${joinedTexts}
`.trim();

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[aiService] Erro Gemini:", err.message);
    throw new Error(`Falha na API do Gemini: ${err.message}`);
  }
};

module.exports = { generateNotificationText };