const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Document, Packer, Paragraph, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType } = require("docx");

const app = express();

app.use(cors({ origin: "*" })); 
app.use(express.json()); 

// ==============================================================================
// 1. ROTA: GERAR NOTIFICAÇÃO COM IA
// ==============================================================================
app.post("/api/gerar", async (req, res) => {
  const { api_key, textos_base, dataConstatacao, protocolo, funcionario, equipe } = req.body;

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

        FORMATO OBRIGATÓRIO:
        Descrição do fato gerador: [Suas consolidações aqui]
        Dispositivo legal infringido: [Suas consolidações aqui]
        Data da constatação: ${dataConstatacao || "Não informada"}
        Protocolo: ${protocolo || "Não informado"}
        Funcionário: ${funcionario || "Não informado"}
        Equipe: ${equipe || "Não informada"}
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
// 2. ROTA: EXPORTAR PARA WORD (Tabela Padrão ERP + AR)
// ==============================================================================
app.post("/api/exportar_word", async (req, res) => {
  const { texto_final, protocolo } = req.body;

  if (!texto_final) {
    return res.status(400).json({ detail: "O texto final não foi enviado ao servidor." });
  }

  try {
    const numProtocolo = protocolo ? protocolo : "{PROTOCOLO}";

    // --- TABELA 1: DADOS DO AUTO DE INFRAÇÃO ---
    const table1 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Matricula: ", bold: true }), new TextRun("{MATRICULA}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Categoria: ", bold: true }), new TextRun("{CATEGORIA_TARIFA_PRINCIPAL}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Nº HD: ", bold: true }), new TextRun("{NUMERO_HIDROMETRO}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [new Paragraph({ children: [new TextRun({ text: "Cliente: ", bold: true }), new TextRun("{NOME_CLIENTE_MORADOR}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "Endereço: ", bold: true }), new TextRun("{ENDERECO_LOGRADOURO}, "), new TextRun({ text: "Nº ", bold: true }), new TextRun("{ENDERECO_NUMERO_IMOVEL}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Bairro: ", bold: true }), new TextRun("{ENDERECO_BAIRRO}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [new Paragraph({ children: [new TextRun({ text: "Localização: ", bold: true }), new TextRun("{LOCALIZACAO} - "), new TextRun({ text: "CEP: ", bold: true }), new TextRun("{ENDERECO_CEP_PRINCIPAL}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: texto_final.split('\n').map(line => new Paragraph({ text: line, alignment: AlignmentType.JUSTIFY, spacing: { after: 120 } })),
              margins: { top: 200, bottom: 200, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Defesa: ", bold: true }),
                    new TextRun("Fica assegurado ao notificado o direito ao contraditório e à ampla defesa, podendo apresentar defesa ou impugnação, pessoalmente ou por intermédio de procurador legalmente constituído, por meio de um dos canais de atendimento desta prestadora, no prazo de 15 (quinze) dias úteis, contados da data de recebimento desta notificação. Decorrido o prazo sem a apresentação de defesa, ou sendo esta indeferida após análise administrativa, serão adotadas as medidas cabíveis e aplicadas as penalidades previstas na legislação e regulamentação vigentes.")
                  ],
                  alignment: AlignmentType.JUSTIFY
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Canais de atendimento: ", bold: true }),
                    new TextRun("Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira."),
                    new TextRun({ text: " Comasa: Rua Albano Schmidt, 4932 - Comasa (Subprefeitura Leste), das 8h às 12h, de segunda a sexta-feira.", break: 1 }),
                    new TextRun({ text: "Pirabeiraba: Rua Joinville, 13.500 (Subprefeitura Pirabeiraba), das 7h30 às 12h e das 13h às 15h30, somente às segundas e terças-feiras. WhatsApp: (47) 99771-8115 - Call Center: 115 ou 0800 723 0300 - E-mail: atendimento@aguasdejoinville.com.br", break: 1 })
                  ],
                  alignment: AlignmentType.JUSTIFY
                })
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ],
        })
      ],
    });

    // --- TABELA 2: DESTINATÁRIO CORREIOS ---
    const table2 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "Destinatário: ", bold: true }), new TextRun("{NOME_CLIENTE_MORADOR}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Endereço: ", bold: true }), new TextRun("{ENDERECO_LOGRADOURO}, "), new TextRun({ text: "Nº ", bold: true }), new TextRun("{ENDERECO_NUMERO_IMOVEL}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Localização: ", bold: true }), new TextRun("{LOCALIZACAO}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Auto de infração: ", bold: true }), new TextRun(numProtocolo)] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Matricula: ", bold: true }), new TextRun("{MATRICULA}")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
      ]
    });

    // --- TABELA 3: AVISO DE RECEBIMENTO (AR) ---
    const table3 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "AVISO DE RECEBIMENTO - AR", bold: true })], alignment: AlignmentType.CENTER })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "AUTO DE INFRAÇÃO: ", bold: true }), new TextRun(`${numProtocolo}.`)] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "MATRICULA: ", bold: true }), new TextRun("{MATRICULA}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "NOME: ", bold: true }), new TextRun("{NOME_CLIENTE_MORADOR}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "ENDEREÇO: ", bold: true }), new TextRun("{ENDERECO}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "LOCALIZAÇÃO: ", bold: true }), new TextRun("{LOCALIZACAO}.")] })],
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "TENTATIVAS: ", bold: true }), new TextRun("1ª ___ / ___ / _______. - 2ª___ / ___ / _______.   - 3ª  ___ / ___ / _______.")] })],
              margins: { top: 150, bottom: 150, left: 100, right: 100 },
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ children: [new TextRun({ text: "NOME LEGIVEL DO RECEBEDOR:", bold: true })] })],
              margins: { top: 250, bottom: 250, left: 100, right: 100 }, // Margem extra para assinatura
            }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "DOCUMENTO:", bold: true })] })],
              margins: { top: 250, bottom: 250, left: 100, right: 100 },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "DATA DE RECEBIMENTO:", bold: true })] })],
              margins: { top: 250, bottom: 250, left: 100, right: 100 },
            }),
          ]
        }),
      ]
    });

    const doc = new Document({
      styles: { default: { document: { run: { font: "Arial", size: 24 } } } }, // Arial tamanho 12pt
      sections: [
        {
          properties: {
            page: { margin: { top: 1699, left: 1699, bottom: 1123, right: 1123 } },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Auto de Infração nº ${numProtocolo}`,
                  bold: true,
                  underline: {},
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            table1,
            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }), // Espaço entre as tabelas
            table2,
            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }), // Espaço entre as tabelas
            table3,
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader("Content-Disposition", "attachment; filename=Notificacao.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
    
  } catch (error) {
    console.error("ERRO FATAL AO GERAR DOCX:", error);
    res.status(500).json({ detail: "Erro interno ao gerar o documento." });
  }
});

// ==============================================================================
// 3. ROTA: CALCULADORA DE MULTAS
// ==============================================================================
const parseBRL = (val) => {
  if (!val) return 0.0;
  const parsed = parseFloat(val.replace(/\./g, "").replace(",", "."));
  return isNaN(parsed) ? 0.0 : parsed;
};
const parseMY = (val) => {
  if (!val) return null;
  const parts = val.split("/");
  if (parts.length !== 2) return null;
  return parseInt(parts[1]) * 12 + parseInt(parts[0]); 
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
  const { 
    serviceRates = [], m3Tiers = [], rows = [], sewageRows = [], k1Factor = "1,00",
    aiNumber, removalDate, postRegM3, postRegRef, billedM3 
  } = req.body;

  const k1 = parseBRL(k1Factor) || 1.0;
  const calcRows = [];
  const validDates = [];

  for (const r of rows) {
    const targetDtNum = parseMY(r.monthYear);
    const consumption = parseBRL(r.consumption);
    const cWater = parseBRL(r.chargedWater);
    const cService = parseBRL(r.chargedService);
    const tCharged = cWater + cService;

    let sRateVal = null;
    let correctWater = null; 

    if (targetDtNum) {
      for (const s of serviceRates) {
        if (inRange(r.monthYear, s.startMonth, s.endMonth) && parseBRL(s.value) > 0) {
          sRateVal = parseBRL(s.value);
          break;
        }
      }
      if (m3Tiers.length > 0 && consumption > 0) {
        correctWater = 0;
        let remainingConsumption = consumption;
        const sortedTiers = [...m3Tiers].sort((a, b) => a.min - b.min);

        for (const tier of sortedTiers) {
          if (remainingConsumption <= 0) break;
          const capacity = tier.max === "Infinity" ? Infinity : (tier.max - tier.min + 1);
          const volumeInTier = Math.min(remainingConsumption, capacity);
          correctWater += volumeInTier * parseBRL(tier.value);
          remainingConsumption -= volumeInTier;
        }
      }
    }

    const correctService = sRateVal;
    const totalCorrect = (correctWater !== null && correctService !== null) ? correctWater + correctService : null;
    const diff = totalCorrect !== null ? totalCorrect - tCharged : null;
    const hasError = !targetDtNum || sRateVal === null || m3Tiers.length === 0;

    if (!hasError) validDates.push(r.monthYear);

    calcRows.push({
      id: r.id, monthYear: r.monthYear, hasError, consumption, correctWater, correctService,
      totalCorrect, chargedWater: cWater, chargedService: cService, totalCharged: tCharged, diff
    });
  }

  const calcSewageRows = [];
  for (const sr of sewageRows) {
    const waterMatch = calcRows.find(wr => wr.monthYear === sr.monthYear && !wr.hasError);
    const cSewage = parseBRL(sr.chargedSewage);
    const cService = parseBRL(sr.chargedService);
    const tCharged = cSewage + cService;
    let totalCorrect = null;
    let hasError = true;

    if (waterMatch && waterMatch.totalCorrect !== null) {
      totalCorrect = waterMatch.totalCorrect * 0.8 * k1;
      hasError = false;
    }

    const diff = totalCorrect !== null ? totalCorrect - tCharged : null;

    calcSewageRows.push({
      id: sr.id, monthYear: sr.monthYear, hasError,
      chargedSewage: cSewage, chargedService: cService,
      totalCharged: tCharged, totalCorrect, diff
    });
  }

  const validRows = calcRows.filter((cr) => !cr.hasError && cr.totalCorrect !== null);
  const totalM3 = validRows.reduce((acc, cr) => acc + cr.consumption, 0);
  const grandCorrect = validRows.reduce((acc, cr) => acc + cr.totalCorrect, 0);
  const grandCharged = validRows.reduce((acc, cr) => acc + cr.totalCharged, 0);
  const grandDiff = grandCorrect - grandCharged;

  const validSewageRows = calcSewageRows.filter((sr) => !sr.hasError && sr.totalCorrect !== null);
  const grandSewageCorrect = validSewageRows.reduce((acc, sr) => acc + sr.totalCorrect, 0);
  const grandSewageCharged = validSewageRows.reduce((acc, sr) => acc + sr.totalCharged, 0);
  const grandSewageDiff = grandSewageCorrect - grandSewageCharged;

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
  const absoluteTotalDiff = grandDiff + grandSewageDiff;

  const waterReportText = `Cálculo do consumo estimado de água ref. ${aiRef}.
Data da retirada da irregularidade: ${dateLine}.
${numMonths} ${mesStr}, com consumo impactado pela violação: ${firstMonth} até ${lastMonth}.
Maior consumo mês cheio lido após a regularização: ${postM3} m³ REF. ${postRef}.
Valor total do consumo estimado no período: ${fmtBRL(grandCorrect)}.
Valor pago pelo cliente no período da irregularidade: ${fmtBRL(grandCharged)}.
Valor a ser lançado ${fmtBRL(grandDiff)}.
Volume faturado no mês impactado pela violação: ${billedVol} m³.
Volume total recuperado: ${totalM3} m³.`;

  let sewageReportText = "";
  if (validSewageRows.length > 0) {
    sewageReportText = `Cálculo do consumo estimado de esgoto ref. ${aiRef}.
Data da retirada da irregularidade: ${dateLine}.
${numMonths} ${mesStr}, anterior à retirada, com consumo irregular ${firstMonth} até ${lastMonth}.
Maior consumo mês cheio sem cortes de água da unidade antes da regularização: ${postM3} m³ REF. ${postRef}.
Valor total do consumo estimado no período: ${fmtBRL(grandSewageCorrect)}.
Valor pago pelo cliente no período da irregularidade: ${fmtBRL(grandSewageCharged)}.
Valor a ser lançado ${fmtBRL(grandSewageDiff)}.
Volume total recuperado: ${totalM3} m³.`;
  }

  res.json({
    rows: calcRows, sewageRows: calcSewageRows,
    totals: { totalM3, grandCorrect, grandCharged, grandDiff, validCount: numMonths, grandSewageCorrect, grandSewageCharged, grandSewageDiff, absoluteTotalDiff },
    waterReportText, sewageReportText
  });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Motor de Notificações rodando na porta ${PORT}`);
  });
}
module.exports = app;