const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { 
  Document, Packer, Paragraph, AlignmentType, TextRun, 
  Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun 
} = require("docx");
// Importação do módulo PDFKit
const PDFDocument = require("pdfkit");

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
// 2. ROTA: EXPORTAR PARA WORD (Padrão ERP Oficial + AR - 1 Página A4)
// ==============================================================================
app.post("/api/exportar_word", async (req, res) => {
  const { 
    texto_final, protocolo, autoInfracao, matricula, nomeCliente, 
    logradouro, bairro, cep, localizacao, 
    categoriaTarifa, numeroHidrometro 
  } = req.body;

  if (!texto_final) {
    return res.status(400).json({ detail: "O texto final não foi enviado ao servidor." });
  }

  try {
    const numProtocolo = protocolo || "{PROTOCOLO}";
    const numAutoInfracao = autoInfracao || "{AUTO_INFRACAO}"; 
    const mat = matricula || "{MATRICULA}";
    const cliente = nomeCliente || "{NOME_CLIENTE_MORADOR}";
    const endLogradouro = logradouro || "{ENDERECO_LOGRADOURO}";
    const endBairro = bairro || "{ENDERECO_BAIRRO}";
    const endCep = cep || "{ENDERECO_CEP_PRINCIPAL}";
    const loc = localizacao || "{LOCALIZACAO}";
    const catTarifa = categoriaTarifa || "{CATEGORIA_TARIFA_PRINCIPAL}";
    const numHd = numeroHidrometro || "{NUMERO_HIDROMETRO}";

    const now = new Date();
    const dataStr = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });
    const horaStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const noBorders = {
      top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL },
      left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL },
      insideHorizontal: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL },
    };

    const logoPath = path.join(__dirname, "public","logo-docx-vale.jpg");
    let logoElements = [new Paragraph({ children: [new TextRun(" ")] })]; 
    if (fs.existsSync(logoPath)) {
      logoElements = [new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(logoPath), transformation: { width: 85, height: 85 }, type: "jpg" })], alignment: AlignmentType.LEFT })];
    }

    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: logoElements, width: { size: 25, type: WidthType.PERCENTAGE }, verticalAlign: "center" }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "COMPANHIA ÁGUAS DE JOINVILLE", bold: true })] }),
                new Paragraph({ children: [new TextRun("Rua TIJUCAS, 213")] }),
                new Paragraph({ children: [new TextRun({ text: "AUTO DE INFRAÇÃO - CFC", bold: true })] }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }, verticalAlign: "center",
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: `Data:   ${dataStr}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Hora:   ${horaStr}` })] })
              ],
              width: { size: 25, type: WidthType.PERCENTAGE }, verticalAlign: "bottom",
            })
          ]
        })
      ]
    });

    const processedTextParagraphs = texto_final.split('\n').map(line => {
      const safeLine = line.trim() === "" ? " " : line;
      return new Paragraph({ children: [new TextRun(safeLine)], alignment: AlignmentType.JUSTIFY, spacing: { after: 60 } });
    });

    const defaultMargin = { top: 40, bottom: 40, left: 80, right: 80 };

    const table1 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Matricula: ", bold: true }), new TextRun(mat)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Categoria: ", bold: true }), new TextRun(catTarifa)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nº HD: ", bold: true }), new TextRun(numHd)] })], margins: defaultMargin }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: "Cliente: ", bold: true }), new TextRun(cliente)] })], margins: defaultMargin }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Endereço: ", bold: true }), new TextRun(endLogradouro)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bairro: ", bold: true }), new TextRun(endBairro)] })], margins: defaultMargin }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: "Localização: ", bold: true }), new TextRun(`${loc} - `), new TextRun({ text: "CEP: ", bold: true }), new TextRun(endCep)] })], margins: defaultMargin }),
          ],
        }),
        new TableRow({
          children: [new TableCell({ columnSpan: 3, children: processedTextParagraphs, margins: { top: 80, bottom: 80, left: 80, right: 80 } })],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Defesa: ", bold: true }), new TextRun("Fica assegurado ao notificado o direito ao contraditório e à ampla defesa, podendo apresentar defesa ou impugnação, pessoalmente ou por intermédio de procurador legalmente constituído, por meio de um dos canais de atendimento desta prestadora, no prazo de 15 (quinze) dias úteis, contados da data de recebimento desta notificação. Decorrido o prazo sem a apresentação de defesa, ou sendo esta indeferida após análise administrativa, serão adotadas as medidas cabíveis e aplicadas as penalidades previstas na legislação e regulamentação vigentes.")],
                  alignment: AlignmentType.JUSTIFY
                })
              ],
              margins: defaultMargin,
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({ children: [new TextRun({ text: "Canais de atendimento: ", bold: true }), new TextRun("Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira.")], alignment: AlignmentType.JUSTIFY }),
                new Paragraph({ children: [new TextRun("Comasa: Rua Albano Schmidt, 4932 - Comasa (Subprefeitura Leste), das 8h às 12h, de segunda a sexta-feira.")], alignment: AlignmentType.JUSTIFY }),
                new Paragraph({ children: [new TextRun("Pirabeiraba: Rua Joinville, 13.500 (Subprefeitura Pirabeiraba), das 7h30 às 12h e das 13h às 15h30, somente às segundas e terças-feiras. WhatsApp: (47) 99771-8115 - Call Center: 115 ou 0800 723 0300 - E-mail: atendimento@aguasdejoinville.com.br")], alignment: AlignmentType.JUSTIFY })
              ],
              margins: defaultMargin,
            }),
          ],
        })
      ],
    });

    const table2 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "Destinatário: ", bold: true }), new TextRun(`${cliente}.`)] })], margins: defaultMargin })]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Endereço: ", bold: true }), new TextRun(endLogradouro)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Localização: ", bold: true }), new TextRun(`${loc}.`)] })], margins: defaultMargin }),
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Auto de infração: ", bold: true }), new TextRun(numAutoInfracao)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Matricula: ", bold: true }), new TextRun(mat)] })], margins: defaultMargin }),
          ]
        }),
      ]
    });

    const table3 = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "AVISO DE RECEBIMENTO - AR", bold: true })], alignment: AlignmentType.CENTER })], margins: defaultMargin })] }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "AUTO DE INFRAÇÃO: ", bold: true }), new TextRun(`${numAutoInfracao}.`)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "MATRICULA: ", bold: true }), new TextRun(`${mat}.`)] })], margins: defaultMargin }),
          ]
        }),
        new TableRow({ children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "NOME: ", bold: true }), new TextRun(`${cliente}.`)] })], margins: defaultMargin })] }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ENDEREÇO: ", bold: true }), new TextRun(`${endLogradouro}.`)] })], margins: defaultMargin }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "LOCALIZAÇÃO: ", bold: true }), new TextRun(`${loc}.`)] })], margins: defaultMargin }),
          ]
        }),
        new TableRow({ children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "TENTATIVAS: ", bold: true }), new TextRun("1ª ___ / ___ / _______. - 2ª___ / ___ / _______.   - 3ª  ___ / ___ / _______.")] })], margins: { top: 80, bottom: 80, left: 80, right: 80 } })] }),
        new TableRow({ children: [new TableCell({ columnSpan: 2, children: [new Paragraph({ children: [new TextRun({ text: "NOME LEGÍVEL DO RECEBEDOR:", bold: true })] })], margins: { top: 200, bottom: 50, left: 80, right: 80 } })] }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DOCUMENTO:", bold: true })] })], margins: { top: 150, bottom: 50, left: 80, right: 80 } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DATA DE RECEBIMENTO:", bold: true })] })], margins: { top: 150, bottom: 50, left: 80, right: 80 } }),
          ]
        }),
      ]
    });

    const doc = new Document({
      styles: { default: { document: { run: { font: "Arial", size: 20 } }, paragraph: { spacing: { after: 0 } } } },
      sections: [
        {
          properties: { page: { margin: { top: 1000, left: 1133, bottom: 1000, right: 1133 } } },
          children: [
            headerTable,
            new Paragraph({ children: [new TextRun({ text: `Auto de Infração nº ${numAutoInfracao}`, bold: true, underline: {} })], alignment: AlignmentType.CENTER, spacing: { before: 150, after: 150 } }),
            table1,
            new Paragraph({ children: [new TextRun(" ")], spacing: { before: 50, after: 50 } }), 
            table2,
            new Paragraph({ children: [new TextRun(" ")], spacing: { before: 50, after: 50 } }), 
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
// 3. NOVA ROTA: EXPORTAR PARA PDF (Otimizado para Vercel Serverless)
// ==============================================================================
app.post("/api/exportar_pdf", async (req, res) => {
  const { 
    texto_final, protocolo, autoInfracao, matricula, nomeCliente, 
    logradouro, bairro, cep, localizacao, 
    categoriaTarifa, numeroHidrometro 
  } = req.body;

  if (!texto_final) {
    return res.status(400).json({ detail: "O texto final não foi enviado." });
  }

  try {
    const numAutoInfracao = autoInfracao || "{AUTO_INFRACAO}";
    const mat = matricula || "{MATRICULA}";
    const cliente = nomeCliente || "{NOME_CLIENTE_MORADOR}";
    const endLogradouro = logradouro || "{ENDERECO_LOGRADOURO}";
    const loc = localizacao || "{LOCALIZACAO}";

    const now = new Date();
    const dataStr = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const horaStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });

    // Instancia o PDF em memória (Margens padrão A4)
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Configura os cabeçalhos de resposta para download binário direto
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Notificacao_Extrajudicial_${numAutoInfracao}.pdf`);
    
    // Vincula o gerador à resposta HTTP stream
    doc.pipe(res);

    // --- RENDERIZAÇÃO DO LOGO CORPORATIVO ---
    const logoPath = path.join(__dirname, "public", "logo-docx-vale.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 35, { width: 55 });
    }

    // --- CABEÇALHO ---
    doc.font("Helvetica-Bold").fontSize(10).text("COMPANHIA ÁGUAS DE JOINVILLE", 110, 40);
    doc.font("Helvetica").fontSize(8).text("Rua TIJUCAS, 213", 110, 53);
    doc.font("Helvetica-Bold").fontSize(9).text("AUTO DE INFRAÇÃO - CFC", 110, 65);

    doc.font("Helvetica").fontSize(8)
       .text(`Data:   ${dataStr}`, 470, 40)
       .text(`Hora:   ${horaStr}`, 470, 53);

    // Linha divisória do cabeçalho
    doc.moveTo(40, 85).lineTo(555, 85).lineWidth(0.5).stroke();

    // --- TÍTULO DO AUTO ---
    doc.font("Helvetica-Bold").fontSize(12).text(`Auto de Infração nº ${numAutoInfracao}`, 40, 100, { align: "center", underline: true });

    // --- BOX DE DADOS CADASTRAIS (Tabela 1 adaptada) ---
    let currentY = 130;
    doc.rect(40, currentY, 515, 65).lineWidth(0.5).stroke();

    doc.font("Helvetica-Bold").fontSize(9).text("Matrícula: ", 45, currentY + 8).font("Helvetica").text(mat, 95, currentY + 8);
    doc.font("Helvetica-Bold").text("Categoria: ", 220, currentY + 8).font("Helvetica").text(categoriaTarifa || "-", 270, currentY + 8);
    doc.font("Helvetica-Bold").text("Nº HD: ", 410, currentY + 8).font("Helvetica").text(numeroHidrometro || "-", 445, currentY + 8);
    
    doc.font("Helvetica-Bold").text("Cliente: ", 45, currentY + 22).font("Helvetica").text(cliente, 85, currentY + 22);
    doc.font("Helvetica-Bold").text("Endereço: ", 45, currentY + 36).font("Helvetica").text(endLogradouro, 95, currentY + 36);
    doc.font("Helvetica-Bold").text("Bairro: ", 410, currentY + 36).font("Helvetica").text(bairro || "-", 445, currentY + 36);
    doc.font("Helvetica-Bold").text("Localização: ", 45, currentY + 50).font("Helvetica").text(`${loc} - CEP: ${cep || "-"}`, 105, currentY + 50);

    // --- CORPO DO TEXTO (GERADO PELA IA) ---
    doc.font("Helvetica").fontSize(9.5).text(texto_final, 40, 215, { align: "justify", width: 515, lineGap: 3 });

    // --- SEÇÃO JURÍDICA E CANAIS DE ATENDIMENTO ---
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(8.5).text("Defesa: ", { continued: true })
       .font("Helvetica").text("Fica assegurado ao notificado o direito ao contraditório e à ampla defesa, podendo apresentar defesa ou impugnação, pessoalmente ou por intermédio de procurador legalmente constituído, por meio de um dos canais de atendimento desta prestadora, no prazo de 15 (quinze) dias úteis...", { align: "justify" });
    
    doc.moveDown(1);
    doc.font("Helvetica-Bold").text("Canais de atendimento: ")
       .font("Helvetica").text("• Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira.\n• Comasa: Rua Albano Schmidt, 4932 - Comasa, das 8h às 12h.\n• WhatsApp: (47) 99771-8115 | Call Center: 115", { lineGap: 2 });

    // --- ADICIONA NOVA PÁGINA PARA O AR (AVISO DE RECEBIMENTO) ---
    doc.addPage();

    doc.rect(40, 40, 515, 260).lineWidth(1).stroke();
    doc.font("Helvetica-Bold").fontSize(11).text("AVISO DE RECEBIMENTO - AR", 40, 55, { align: "center" });
    doc.moveTo(40, 75).lineTo(555, 75).lineWidth(0.5).stroke();

    doc.fontSize(9.5)
       .text("AUTO DE INFRAÇÃO: ", 50, 90).font("Helvetica").text(numAutoInfracao, 160, 90)
       .font("Helvetica-Bold").text("MATRÍCULA: ", 340, 90).font("Helvetica").text(mat, 410, 90);

    doc.font("Helvetica-Bold").text("NOME: ", 50, 115).font("Helvetica").text(cliente, 90, 115);
    doc.font("Helvetica-Bold").text("ENDEREÇO: ", 50, 140).font("Helvetica").text(`${endLogradouro} - ${loc}`, 110, 140);
    
    doc.font("Helvetica-Bold").text("TENTATIVAS: ", 50, 165).font("Helvetica").text("1ª ___/___/____   -   2ª ___/___/____   -   3ª ___/___/____");

    doc.moveTo(40, 195).lineTo(555, 195).stroke();
    doc.font("Helvetica-Bold").fontSize(8.5).text("NOME LEGÍVEL DO RECEBEDOR:", 50, 205);
    
    doc.moveTo(40, 250).lineTo(555, 250).stroke();
    doc.text("DOCUMENTO DE IDENTIDADE:", 50, 260);
    doc.text("DATA DE RECEBIMENTO: ____/____/_______", 320, 260);

    // Fecha o fluxo do documento
    doc.end();

  } catch (error) {
    console.error("ERRO FATAL AO GERAR PDF:", error);
    res.status(500).json({ detail: "Erro interno no servidor ao construir o arquivo PDF." });
  }
});

// ==============================================================================
// 4. ROTA: CALCULADORA DE MULTAS (MANTIDA INTACTA)
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
${numMonths} ${mesStr}, com consumption impactado pela violação: ${firstMonth} até ${lastMonth}.
Maior consumption mês cheio lido após a regularização: ${postM3} m³ REF. ${postRef}.
Valor total do consumption estimado no período: ${fmtBRL(grandCorrect)}.
Valor pago pelo cliente no período da irregularidade: ${fmtBRL(grandCharged)}.
Valor a ser lançado ${fmtBRL(grandDiff)}.
Volume faturado no mês impactado pela violação: ${billedVol} m³.
Volume total recuperado: ${totalM3} m³.`;

  let sewageReportText = "";
  if (validSewageRows.length > 0) {
    sewageReportText = `Cálculo do consumption estimado de esgoto ref. ${aiRef}.
Data da retirada da irregularidade: ${dateLine}.
${numMonths} ${mesStr}, anterior à retirada, com consumption irregular ${firstMonth} até ${lastMonth}.
Maior consumption mês cheio sem cortes de água da unidade antes da regularização: ${postM3} m³ REF. ${postRef}.
Valor total do consumption estimado no período: ${fmtBRL(grandSewageCorrect)}.
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