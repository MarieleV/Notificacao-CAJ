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
// 3. NOVA ROTA: EXPORTAR PARA PDF(Otimizado para 1 folha A4 com Tabela Unificada)
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

    const doc = new PDFDocument({ margin: 35, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Notificacao_Extrajudicial_${numAutoInfracao}.pdf`);
    doc.pipe(res);

    // --- 1. CABEÇALHO ---
    const logoPath = path.join(__dirname, "public", "logo-docx-vale.jpg");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 35, 30, { width: 65 });
    }

    doc.font("Helvetica-Bold").fontSize(9).text("COMPANHIA ÁGUAS DE JOINVILLE", 120, 35);
    doc.font("Helvetica").fontSize(8).text("Rua TIJUCAS, 213", 120, 47);
    doc.font("Helvetica-Bold").text("AUTO DE INFRAÇÃO - CFC", 120, 59);

    doc.font("Helvetica").text(`Data:   ${dataStr}`, 470, 35);
    doc.text(`Hora:   ${horaStr}`, 470, 47);

    // --- 2. TÍTULO (Centralização Matemática e Garantida) ---
    doc.moveDown(3);
    const titleStr = `Auto de Infração nº ${numAutoInfracao}`;
    doc.font("Helvetica-Bold").fontSize(11);
    const titleWidth = doc.widthOfString(titleStr);
    const titleX = 35 + (525 - titleWidth) / 2; // (Margem Esquerda) + (Largura Útil - Largura Texto) / 2
    doc.text(titleStr, titleX, doc.y, { underline: true });
    
    doc.moveDown(1.5);

    // --- 3. TABELA PRINCIPAL (UNIFICADA CONFORME IMAGEM) ---
    let b1Y = doc.y;
    let rowH = 16; // Altura padrão das linhas simples
    let pad = 4.5; // Padding interno padrão
    let dynamicPad = 8; // Padding maior para áreas de texto longo (IA, Defesa, Canais)
    
    let col2X = 200; // Início da coluna Categoria
    let col3X = 370; // Início da coluna Nº HD / Bairro

    // Linha 1: Matrícula | Categoria | Nº HD
    doc.font("Helvetica-Bold").fontSize(8.5).text("Matricula: ", 40, b1Y + pad, { continued: true }).font("Helvetica").text(mat);
    doc.font("Helvetica-Bold").text("Categoria: ", col2X + 5, b1Y + pad, { continued: true }).font("Helvetica").text(categoriaTarifa || "-");
    doc.font("Helvetica-Bold").text("Nº HD: ", col3X + 5, b1Y + pad, { continued: true }).font("Helvetica").text(numeroHidrometro || "-");
    doc.moveTo(35, b1Y + rowH).lineTo(560, b1Y + rowH).stroke(); 
    
    // Linha 2: Cliente
    doc.font("Helvetica-Bold").text("Cliente: ", 40, b1Y + rowH + pad, { continued: true }).font("Helvetica").text(cliente);
    doc.moveTo(35, b1Y + rowH * 2).lineTo(560, b1Y + rowH * 2).stroke();
    
    // Linha 3: Endereço | Bairro
    doc.font("Helvetica-Bold").text("Endereço: ", 40, b1Y + rowH * 2 + pad, { continued: true }).font("Helvetica").text(endLogradouro);
    doc.font("Helvetica-Bold").text("Bairro: ", col3X + 5, b1Y + rowH * 2 + pad, { continued: true }).font("Helvetica").text(bairro || "-");
    doc.moveTo(35, b1Y + rowH * 3).lineTo(560, b1Y + rowH * 3).stroke();
    
    // Linha 4: Localização
    doc.font("Helvetica-Bold").text("Localização: ", 40, b1Y + rowH * 3 + pad, { continued: true })
       .font("Helvetica").text(`${loc} - CEP: ${cep || "-"}`);
    doc.moveTo(35, b1Y + rowH * 4).lineTo(560, b1Y + rowH * 4).stroke();

    // Linha 5: Texto da IA (Altura Dinâmica)
    let yRowIA = b1Y + rowH * 4;
    doc.font("Helvetica").fontSize(9).text(texto_final, 40, yRowIA + dynamicPad, { align: "justify", width: 515, lineGap: 2 });
    let endRowIA = doc.y + dynamicPad;
    doc.moveTo(35, endRowIA).lineTo(560, endRowIA).stroke(); 

    // --- 6. DEFESA (Ajuste de Margem Direita para não grudar) ---
    // Alterado width de 515 para 505 para dar mais espaço à direita
    doc.font("Helvetica-Bold").fontSize(8.5).text("Defesa: ", 40, endRowIA + dynamicPad, { continued: true })
       .font("Helvetica").text("Fica assegurado ao notificado o direito ao contraditório e à ampla defesa, podendo apresentar defesa ou impugnação, pessoalmente ou por intermédio de procurador legalmente constituído, por meio de um dos canais de atendimento desta prestadora, no prazo de 15 (quinze) dias úteis, contados da data de recebimento desta notificação. Decorrido o prazo sem a apresentação de defesa, ou sendo esta indeferida após análise administrativa, serão adotadas as medidas cabíveis e aplicadas as penalidades previstas na legislação e regulamentação vigentes.", { align: "justify", width: 505, lineGap: 1.5 });
    
    let endRowDefesa = doc.y + dynamicPad;
    doc.moveTo(35, endRowDefesa).lineTo(560, endRowDefesa).stroke();

    // Linha 7: Canais de Atendimento (Altura Dinâmica)
    doc.font("Helvetica-Bold").text("Canais de atendimento: ", 40, endRowDefesa + dynamicPad, { continued: true })
       .font("Helvetica").text("Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira.");
    doc.text("Comasa: Rua Albano Schmidt, 4932 - Comasa (Subprefeitura Leste), das 8h às 12h, de segunda a sexta-feira.", 40, doc.y);
    doc.text("Pirabeiraba: Rua Joinville, 13.500 (Subprefeitura Pirabeiraba), das 7h30 às 12h e das 13h às 15h30, somente às segundas e terças-feiras.", 40, doc.y);
    doc.text("WhatsApp: (47) 99771-8115 - Call Center: 115 ou 0800 723 0300 - E-mail: atendimento@aguasdejoinville.com.br", 40, doc.y);
    let endRowCanais = doc.y + dynamicPad;

    // Moldura Externa da Tabela Principal
    doc.rect(35, b1Y, 525, endRowCanais - b1Y).stroke();

    // Divisórias Verticais (Linha 1 e Linha 3)
    doc.moveTo(col2X, b1Y).lineTo(col2X, b1Y + rowH).stroke(); // Linha 1 -> Categoria
    doc.moveTo(col3X, b1Y).lineTo(col3X, b1Y + rowH).stroke(); // Linha 1 -> Nº HD
    doc.moveTo(col3X, b1Y + rowH * 2).lineTo(col3X, b1Y + rowH * 3).stroke(); // Linha 3 -> Bairro

    // Avança para a próxima tabela
    doc.y = endRowCanais + 15;

    // --- 4. DESTINATÁRIO (Tabela Estruturada) ---
    let b6Y = doc.y;
    let meioX = 298; // Divisão exata do meio da folha (35 margem + 525/2)
    
    // Linha 1
    doc.font("Helvetica-Bold").text("Destinatário: ", 40, b6Y + 4, { continued: true }).font("Helvetica").text(`${cliente}.`);
    doc.moveTo(35, b6Y + rowH).lineTo(560, b6Y + rowH).stroke(); 
    
    // Linha 2
    doc.font("Helvetica-Bold").text("Endereço: ", 40, b6Y + rowH + 4, { continued: true }).font("Helvetica").text(`${endLogradouro}`);
    doc.font("Helvetica-Bold").text("Localização: ", meioX + 5, b6Y + rowH + 4, { continued: true }).font("Helvetica").text(`${loc}.`);
    doc.moveTo(35, b6Y + rowH * 2).lineTo(560, b6Y + rowH * 2).stroke();
    
    // Linha 3
    doc.font("Helvetica-Bold").text("Auto de infração: ", 40, b6Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(`${numAutoInfracao}`);
    doc.font("Helvetica-Bold").text("Matricula: ", meioX + 5, b6Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(mat);
    
    // Linhas Verticais e Borda
    doc.moveTo(meioX, b6Y + rowH).lineTo(meioX, b6Y + rowH * 3).stroke();
    doc.rect(35, b6Y, 525, rowH * 3).stroke();
    
    doc.y = b6Y + (rowH * 3) + 15;

    // --- 5. AVISO DE RECEBIMENTO (Tabela Estruturada) ---
    let b7Y = doc.y;
    
    // Linha 1 (Título)
    doc.font("Helvetica-Bold").fontSize(10).text("AVISO DE RECEBIMENTO - AR", 35, b7Y + 4, { align: "center", width: 525 });
    doc.moveTo(35, b7Y + rowH).lineTo(560, b7Y + rowH).stroke(); 
    
    // Linha 2
    doc.fontSize(8.5);
    doc.font("Helvetica-Bold").text("AUTO DE INFRAÇÃO: ", 40, b7Y + rowH + 4, { continued: true }).font("Helvetica").text(`${numAutoInfracao}.`);
    doc.font("Helvetica-Bold").text("MATRICULA: ", meioX + 5, b7Y + rowH + 4, { continued: true }).font("Helvetica").text(`${mat}.`);
    doc.moveTo(35, b7Y + rowH * 2).lineTo(560, b7Y + rowH * 2).stroke(); 
    
    // Linha 3
    doc.font("Helvetica-Bold").text("NOME: ", 40, b7Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(`${cliente}.`);
    doc.moveTo(35, b7Y + rowH * 3).lineTo(560, b7Y + rowH * 3).stroke(); 
    
    // Linha 4
    doc.font("Helvetica-Bold").text("ENDEREÇO: ", 40, b7Y + rowH * 3 + 4, { continued: true }).font("Helvetica").text(`${endLogradouro}.`);
    doc.font("Helvetica-Bold").text("LOCALIZAÇÃO: ", meioX + 5, b7Y + rowH * 3 + 4, { continued: true }).font("Helvetica").text(`${loc}.`);
    doc.moveTo(35, b7Y + rowH * 4).lineTo(560, b7Y + rowH * 4).stroke(); 
    
    // Linha 5
    doc.font("Helvetica-Bold").text("TENTATIVAS: ", 40, b7Y + rowH * 4 + 4, { continued: true })
       .font("Helvetica").text("1ª ___ / ___ / _______.   -   2ª ___ / ___ / _______.   -   3ª ___ / ___ / _______.");
    doc.moveTo(35, b7Y + rowH * 5).lineTo(560, b7Y + rowH * 5).stroke(); 
    
    // Linha 6 (Área de Assinatura)
    let tallH = 26;
    doc.font("Helvetica-Bold").text("NOME LEGÍVEL DO RECEBEDOR:", 40, b7Y + rowH * 5 + 4);
    doc.moveTo(35, b7Y + rowH * 5 + tallH).lineTo(560, b7Y + rowH * 5 + tallH).stroke(); 
    
    // Linha 7
    doc.text("DOCUMENTO:", 40, b7Y + rowH * 5 + tallH + 4);
    doc.text("DATA DE RECEBIMENTO:", meioX + 5, b7Y + rowH * 5 + tallH + 4);
    
    // Linhas Verticais e Borda
    let totalARHeight = (rowH * 5) + (tallH * 2);
    doc.moveTo(meioX, b7Y + rowH).lineTo(meioX, b7Y + rowH * 2).stroke(); // Linha 2
    doc.moveTo(meioX, b7Y + rowH * 3).lineTo(meioX, b7Y + rowH * 4).stroke(); // Linha 4
    doc.moveTo(meioX, b7Y + rowH * 5 + tallH).lineTo(meioX, b7Y + totalARHeight).stroke(); // Linha 7
    
    doc.rect(35, b7Y, 525, totalARHeight).stroke();

    // Fecha o PDF
    doc.end();

  } catch (error) {
    console.error("ERRO FATAL AO GERAR PDF:", error);
    res.status(500).json({ detail: "Erro interno no servidor." });
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