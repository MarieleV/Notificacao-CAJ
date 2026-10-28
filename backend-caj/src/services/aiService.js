// src/services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = "gemini-2.5-flash";

const LABELS = [
  "Descrição do fato gerador",
  "Dispositivo legal infringido",
  "Data da constatação",
  "Protocolo",
  "Meses sem acesso",
  "Funcionário",
  "Equipe",
  "Penalidade prevista",
];
const RE_LABELS = new RegExp(`(${LABELS.join("|")})\\s*:`, "gi");
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

const isSemProtocolo = (p) => !p || /^n[ãa]o se aplica$/i.test(String(p).trim());

// Divide uma cláusula em { rotulo: valor } independente de usar \n ou espaços duplos
const parseClausula = (texto) => {
  const campos = {};
  const matches = [...String(texto).matchAll(RE_LABELS)];
  matches.forEach((m, i) => {
    const inicio = m.index + m[0].length;
    const fim = i + 1 < matches.length ? matches[i + 1].index : texto.length;
    campos[m[1].toLowerCase()] = String(texto).slice(inicio, fim).trim();
  });
  return campos;
};

const preencherCampo = (texto, rotulo, valor) =>
  texto.replace(
    new RegExp(`(${rotulo}:)[ \\t]*(?=\\r?\\n|$)`, "im"),
    (_, r) => `${r} ${valor}`
  );

const generateNotificationText = async (apiKey, baseTexts, metadata = {}) => {
  const textos = Array.isArray(baseTexts) ? baseTexts.filter(Boolean) : [];
  if (textos.length === 0) throw new Error("Nenhum texto base recebido.");

  const funcionario = metadata.funcionario || "Não informado";
  const equipe = metadata.equipe || "Não informada";

  const parsed = textos.map(parseClausula);
  const mesesLinha =
    parsed.map((p) => p["meses sem acesso"]).find((v) => v && v.trim()) || "";
  const temMeses = Boolean(mesesLinha);

  // ── CASO 1: apenas 20012 → sem IA, texto exato do modelo ─────────────────
  if (textos.length === 1 && temMeses) {
    let texto = textos[0];
    texto = preencherCampo(texto, "Funcionário", funcionario);
    texto = preencherCampo(texto, "Equipe", equipe);
    return texto.trim();
  }

  // ── CASO 2: demais códigos e combinações (inclui 20012 + outros) ─────────
  const apiKeyLimpa = String(apiKey || "").trim();
  if (!apiKeyLimpa) throw new Error("Chave de API do Gemini não informada.");

  const genAI = new GoogleGenerativeAI(apiKeyLimpa);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: { temperature: 0.1 },
  });

  // Entrega à IA só o conteúdo jurídico de cada infração
  const infracoes = parsed
    .map((p, i) => {
      const ehAcessoLeitura = Boolean(p["meses sem acesso"]);
      const cabecalho = `INFRAÇÃO ${i + 1}${
        ehAcessoListagem(ehAcessoLeitura)
      }`;

      if (!p["descrição do fato gerador"] && !p["penalidade prevista"]) {
        // Texto livre (ex.: notificação cadastral): envia bruto
        return `${cabecalho}\nTexto original: ${norm(textos[i])}`;
      }
      return [
        cabecalho,
        `Descrição: ${norm(p["descrição do fato gerador"])}`,
        `Dispositivo legal: ${norm(p["dispositivo legal infringido"])}`,
        `Penalidade: ${norm(p["penalidade prevista"])}`,
      ].join("\n");
    })
    .join("\n\n");

  // Cabeçalho fixo montado pelo código (a IA não toca nesses campos)
  const linhasFixas = [
    `Data da constatação: ${metadata.dataConstatacao || "Não informada"}`,
  ];
  if (!isSemProtocolo(metadata.protocolo)) {
    linhasFixas.push(`Protocolo: ${String(metadata.protocolo).trim()}`);
  }
  if (temMeses) linhasFixas.push(`Meses sem acesso: ${norm(mesesLinha)}`);
  linhasFixas.push(`Funcionário: ${funcionario}`, `Equipe: ${equipe}`);

  const multiplas = textos.length > 1;

  const prompt = `
Você é o assistente jurídico do sistema. Consolide ${
    multiplas ? "as infrações abaixo em UMA ÚNICA notificação coesa" : "a infração abaixo"
  }, devolvendo EXATAMENTE as 3 linhas pedidas, sem mais nada.

SAÍDA (3 linhas, nesta ordem, cada uma começando com o rótulo):
Descrição do fato gerador: ...
Dispositivo legal infringido: ...
Penalidade prevista: ...

REGRAS:
- Responda apenas com essas 3 linhas. Sem saudação, markdown, asteriscos ou comentários.
- Mantenha espaços normais entre todas as palavras.
- Descrição do fato gerador: una os fatos em uma frase fluida (ex.: "A e B", "A, B e C"), sem repetir termos comuns.
- Dispositivo legal infringido: liste todos os artigos/incisos, sem repetir a norma, e termine com a norma uma só vez (ex.: "Artigo 144, inciso XII e Artigo 144, inciso I da Resolução 019/2019 - ARIS.").
- Penalidade prevista: mencione a multa de CADA infração, com seu respectivo artigo. Se houver obrigação de padronização (90 dias úteis, Art. 144, § 3º) ou condição de isenção de multa, escreva-a UMA ÚNICA vez no final, sem duplicar.
- Não omita nenhuma obrigação, prazo ou condição presente nas penalidades originais, e não invente nada novo.
- Se alguma infração vier como "Texto original", preserve o conteúdo dela integralmente.

INFRAÇÕES:
${infracoes}
`.trim();

  let corpo;
  try {
    const result = await model.generateContent(prompt);
    corpo = result.response.text().replace(/[*#`]/g, "").trim();
  } catch (err) {
    console.error("[aiService] Erro Gemini:", err.message);
    throw new Error(`Falha na API do Gemini: ${err.message}`);
  }

  // ── Montagem final: cabeçalho fixo entre dispositivo legal e penalidade ──
  const pegar = (rotulo, proximo) => {
    const re = new RegExp(
      `${rotulo}\\s*:\\s*([\\s\\S]*?)${proximo ? `(?=\\n\\s*${proximo}\\s*:|$)` : "$"}`,
      "i"
    );
    const m = corpo.match(re);
    return m ? m[1].trim() : "";
  };

  const descricao = pegar("Descrição do fato gerador", "Dispositivo legal infringido");
  const dispositivo = pegar("Dispositivo legal infringido", "Penalidade prevista");
  const penalidade = pegar("Penalidade prevista", null);

  // Se a IA fugiu do formato, devolve o texto dela (não perde conteúdo)
  if (!descricao || !dispositivo || !penalidade) return corpo;

  return [
    `Descrição do fato gerador: ${descricao}`,
    `Dispositivo legal infringido: ${dispositivo}`,
    ...linhasFixas,
    `Penalidade prevista: ${penalidade}`,
  ].join("\n");
};

module.exports = { generateNotificationText };