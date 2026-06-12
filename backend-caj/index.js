const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Document, Packer, Paragraph, AlignmentType } = require("docx");

const app = express();

// Middlewares
app.use(cors({ origin: "*" })); // Em produção, restrinja para a URL do seu React
app.use(express.json()); // Permite ler o body das requisições em JSON

// ==============================================================================
// 1. ROTA: GERAR NOTIFICAÇÃO COM IA
// ==============================================================================
app.post("/api/gerar", async (req, res) => {
  const { api_key, textos_base } = req.body;

  if (!api_key) {
    return res.status(400).json({ detail: "API Key é obrigatória." });
  }

  try {
    const genAI = new GoogleGenerativeAI(api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const textosJuntos = textos_base.join("\n---\n");

    const prompt = `
        Você é o assistente jurídico do sistema. Sua tarefa é ler as infrações brutas abaixo e consolidá-las NO EXATO FORMATO exigido a seguir. 
        Não adicione saudações ou textos extras. Apenas preencha o template.
        
        Se houver mais de uma infração, some as informações nos campos "Descrição do fato gerador", "Dispositivo legal" e "Penalidade prevista" de forma coesa.
        Deixe os campos de Data, Protocolo, Funcionário e Equipe vazios.

        FORMATO OBRIGATÓRIO:
        Descrição do fato gerador: [Suas consolidações aqui]
        Dispositivo legal infringido: [Suas consolidações aqui]
        Data da constatação: 
        Protocolo: 
        Funcionário: 
        Equipe: 
        Penalidade prevista: [Suas consolidações aqui]

        INFRAÇÕES BRUTAS (SELECIONADAS PELO USUÁRIO):
        ${textosJuntos}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ texto_gerado: response.text().trim() });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// ==============================================================================
// 2. ROTA: EXPORTAR PARA WORD (Padrão Jurídico)
// ==============================================================================
app.post("/api/exportar_word", async (req, res) => {
  const { texto_final } = req.body;

  // 1. Verificamos se o texto está chegando corretamente do front-end
  if (!texto_final) {
    console.log("ERRO: texto_final chegou vazio ou undefined!");
    return res.status(400).json({ detail: "O texto final não foi enviado ao servidor." });
  }

  try {
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Arial", size: 24 },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1699, left: 1699, bottom: 1123, right: 1123 },
            },
          },
          children: [
            new Paragraph({
              text: String(texto_final), // Garante que é uma string
              alignment: AlignmentType.JUSTIFY,
              spacing: { line: 360 },
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader("Content-Disposition", "attachment; filename=Notificacao.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
    
  } catch (error) {
    // 2. Se a biblioteca docx quebrar, o erro vai aparecer no terminal!
    console.error("ERRO FATAL AO GERAR DOCX:", error);
    res.status(500).json({ detail: "Erro interno ao gerar o documento." });
  }
});

// ==============================================================================
// 3. ROTA: CALCULADORA DE MULTAS
// ==============================================================================

// Funções auxiliares matemáticas equivalentes ao Python
const parseBRL = (val) => {
  if (!val) return 0.0;
  const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
  return isNaN(parsed) ? 0.0 : parsed;
};

const parseMY = (val) => {
  if (!val) return null;
  const parts = val.split("/");
  if (parts.length !== 2) return null;
  return parseInt(parts[1]) * 12 + parseInt(parts[0]); // Converte para um número absoluto de meses para facilitar comparação
};

const inRange = (targetStr, startStr, endStr) => {
  const target = parseMY(targetStr);
  const start = parseMY(startStr);
  const end = parseMY(endStr);

  if (!target || !start) return false;
  if (end) return target >= start && target <= end;
  return target >= start;
};

const fmtBRL = (val) => {
  return "R$ " + val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

app.post("/api/calcular_multa", (req, res) => {
  // ATENÇÃO: Agora recebemos m3Tiers no lugar de m3Rates
  const { serviceRates = [], m3Tiers = [], rows = [], aiNumber, removalDate, postRegM3, postRegRef, billedM3 } = req.body;

  const calcRows = [];
  const validDates = [];

  // 1. Processamento linha a linha
  for (const r of rows) {
    const targetDtNum = parseMY(r.monthYear);
    const consumption = parseBRL(r.consumption);
    const cWater = parseBRL(r.chargedWater);
    const cService = parseBRL(r.chargedService);
    const tCharged = cWater + cService;

    let sRateVal = null;
    let correctWater = null; 

    if (targetDtNum) {
      // Busca taxa de serviço normalmente
      for (const s of serviceRates) {
        if (inRange(r.monthYear, s.startMonth, s.endMonth) && parseBRL(s.value) > 0) {
          sRateVal = parseBRL(s.value);
          break;
        }
      }

      // CÁLCULO DA ÁGUA EM CASCATA (FAIXAS DE CONSUMO)
      if (m3Tiers.length > 0 && consumption > 0) {
        correctWater = 0;
        let remainingConsumption = consumption;
        
        // Garante que as faixas estão na ordem certa (0 a 10, 11 a 15...)
        const sortedTiers = [...m3Tiers].sort((a, b) => a.min - b.min);

        for (const tier of sortedTiers) {
          if (remainingConsumption <= 0) break;

          // Descobre quantos m³ cabem nesta faixa específica
          const capacity = tier.max === "Infinity" ? Infinity : (tier.max - tier.min + 1);
          
          // O volume faturado nesta faixa é o que sobrou do consumo OU o limite da faixa
          const volumeInTier = Math.min(remainingConsumption, capacity);
          
          correctWater += volumeInTier * parseBRL(tier.value);
          remainingConsumption -= volumeInTier;
        }
      }
    }

    const correctService = sRateVal;
    const totalCorrect = (correctWater !== null && correctService !== null) ? correctWater + correctService : null;
    const diff = totalCorrect !== null ? totalCorrect - tCharged : null;

    // Erro se não achou data, taxa de serviço, ou se as faixas vieram vazias
    const hasError = !targetDtNum || sRateVal === null || m3Tiers.length === 0;

    if (!hasError) validDates.push(r.monthYear);

    calcRows.push({
      id: r.id,
      monthYear: r.monthYear,
      hasError,
      consumption,
      correctWater,
      correctService,
      totalCorrect,
      chargedWater: cWater,
      chargedService: cService,
      totalCharged: tCharged,
      diff,
      m3Rate: "Faixas" // Retorna texto genérico pois são vários valores
    });
  }

  // 2. Totalizadores (KPIs)
  const validRows = calcRows.filter((cr) => !cr.hasError && cr.totalCorrect !== null);
  const totalM3 = validRows.reduce((acc, cr) => acc + cr.consumption, 0);
  const grandCorrect = validRows.reduce((acc, cr) => acc + cr.totalCorrect, 0);
  const grandCharged = validRows.reduce((acc, cr) => acc + cr.totalCharged, 0);
  const grandDiff = grandCorrect - grandCharged;

  // 3. Geração do Texto de Relatório
  validDates.sort((a, b) => parseMY(a) - parseMY(b));
  const numMonths = validRows.length;
  const firstMonth = validDates[0] || "—";
  const lastMonth = validDates[validDates.length - 1] || "—";

  const aiRef = (aiNumber || "").trim() ? `AI ${aiNumber.trim()}` : "[Nº do AI]";
  const dateLine = (removalDate || "").trim() ? removalDate.trim() : "[data]";
  const postM3 = (postRegM3 || "").trim() ? postRegM3.trim() : "[m³]";
  const postRef = (postRegRef || "").trim() ? postRegRef.trim().toUpperCase() : "[MM/AAAA]";
  const billedVol = (billedM3 || "").trim() ? billedM3.trim() : "[m³]";
  const mesStr = numMonths === 1 ? "mês" : "meses";

  const reportText = `Cálculo do consumo estimado de água ref. ${aiRef}.
Data da retirada da irregularidade: ${dateLine}.
${numMonths} ${mesStr}, com consumo impactado pela violação: ${firstMonth} até ${lastMonth}.
Maior consumo mês cheio lido após a regularização: ${postM3} m³ REF. ${postRef}.
Valor total do consumo estimado no período: ${fmtBRL(grandCorrect)}.
Valor pago pelo cliente no período da irregularidade: ${fmtBRL(grandCharged)}.
Valor a ser lançado ${fmtBRL(grandDiff)}.
Volume faturado no mês impactado pela violação: ${billedVol} m³.
Volume total recuperado: ${totalM3} m³.`;

  res.json({
    rows: calcRows,
    totals: { totalM3, grandCorrect, grandCharged, grandDiff, validCount: numMonths },
    reportText,
  });
});

// Condicional vital para rodar tanto localmente quanto no Vercel (Serverless)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Motor de Notificações rodando na porta ${PORT}`);
  });
}

module.exports = app;