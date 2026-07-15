// src/services/documentService.js
const fs = require("fs");
const path = require("path");
const { 
  Document, Packer, Paragraph, AlignmentType, TextRun, 
  Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun 
} = require("docx");
const PDFDocument = require("pdfkit");

// Mesma regra de negrito de linha inteira reaproveitada para Word e PDF
const fullLineBoldRegex = /^(01\.|02\.|03\.|I\s–|II\s–|III\s–|IV\s–|V\s–|OBJETO:|DECISÃO:)/i;

// ==============================================================================
// FUNÇÕES UTILITÁRIAS INTERNAS
// ==============================================================================

const formatTextToDocx = (text) => {
  const lines = text.split('\n');
  return lines.map(line => {
    const isBoldLine = fullLineBoldRegex.test(line);
    
    // Suporte para **negrito** inline (ex: texto **forte** texto)
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const textRuns = parts.map((part, index) => {
      if (part === "") return null;
      // Índices ímpares são as palavras que estavam dentro dos **
      const isPartBold = isBoldLine || (index % 2 !== 0);
      
      // NOVA REGRA: Se a parte for a frase de alerta, pinta de vermelho!
      const isRed = part === "<adicionar fato novo ao processo>";

      return new TextRun({ 
        text: part, 
        bold: isPartBold, 
        color: isRed ? "FF0000" : undefined, 
        font: "Arial", 
        size: 22 
      });
    }).filter(Boolean);

    // Garante espaçamento caso a linha seja vazia
    if (textRuns.length === 0) {
      textRuns.push(new TextRun({ text: " ", font: "Arial", size: 22 }));
    }

    // O alinhamento JUSTIFY entra direto na raiz do parágrafo
    return new Paragraph({
      children: textRuns,
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED 
    });
  });
};

const getCurrentTimeStrings = () => {
  const now = new Date();
  const dataStr = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });
  const horaStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { dataStr, horaStr };
};

// Como o arquivo está em src/services, subimos dois níveis para achar a public/
const getLogoPath = () => path.join(__dirname, "../../public", "logo-docx-vale.jpg");

// ==============================================================================
// SERVIÇOS EXPORTADOS
// ==============================================================================

const buildParecerWord = async (textoFinal) => {
  const doc = new Document({
    sections: [{
      properties: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
      children: formatTextToDocx(textoFinal)
    }]
  });
  return await Packer.toBuffer(doc);
};

const buildParecerPdf = (textoFinal) => {
  return new Promise((resolve, reject) => {
    // Margem equivalente aos 1134 twips usados no Word (1134 / 20 = 56.7pt)
    const doc = new PDFDocument({ margin: 56.7, size: "A4" });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const lines = textoFinal.split('\n');

    lines.forEach(line => {
      const isBoldLine = fullLineBoldRegex.test(line);
      const safeLine = line.trim() === "" ? " " : line;

      if (safeLine === " ") {
        doc.font("Helvetica").fontSize(11).fillColor("black").text(" ", { lineGap: 2 });
      } else {
        // Separa partes normais de partes em **negrito**
        const parts = safeLine.split(/\*\*(.*?)\*\*/g);
        const validParts = parts.map((part, index) => ({
          text: part,
          bold: isBoldLine || (index % 2 !== 0),
          isRed: part === "<adicionar fato novo ao processo>" // Identifica se é a frase de alerta
        })).filter(p => p.text !== "");

        // Desenha os pedaços na mesma linha (continued: true)
        validParts.forEach((partObj, idx) => {
          const isLast = idx === validParts.length - 1;
          
          doc.font(partObj.bold ? "Helvetica-Bold" : "Helvetica")
             .fontSize(11)
             .fillColor(partObj.isRed ? "red" : "black"); // Aplica cor vermelha se for o alerta

          // O Segredo do PDFKit: O alinhamento só deve ser declarado no 1º fragmento de texto
          const options = {
            continued: !isLast,
            lineGap: isLast ? 2 : 0
          };

          if (idx === 0) {
            options.align = "justify";
          }

          doc.text(partObj.text, options);
        });
        
        // Retorna para a cor preta padrão após terminar a linha, por garantia
        doc.fillColor("black");
      }

      // Espaçamento equivalente ao spacing: { after: 120 } (twips) do Word
      doc.moveDown(0.4);
    });

    doc.end();
  });
};

const buildInfracaoWord = async (dados) => {
  const { 
    texto_final, protocolo, autoInfracao, matricula, nomeCliente, 
    logradouro, bairro, cep, localizacao, categoriaTarifa, numeroHidrometro 
  } = dados;

  const numAutoInfracao = autoInfracao || "{AUTO_INFRACAO}"; 
  const mat = matricula || "{MATRICULA}";
  const cliente = nomeCliente || "{NOME_CLIENTE_MORADOR}";
  const endLogradouro = logradouro || "{ENDERECO_LOGRADOURO}";
  const endBairro = bairro || "{ENDERECO_BAIRRO}";
  const endCep = cep || "{ENDERECO_CEP_PRINCIPAL}";
  const loc = localizacao || "{LOCALIZACAO}";
  const catTarifa = categoriaTarifa || "{CATEGORIA_TARIFA_PRINCIPAL}";
  const numHd = numeroHidrometro || "{NUMERO_HIDROMETRO}";

  const { dataStr, horaStr } = getCurrentTimeStrings();

  const noBorders = {
    top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL },
    left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL },
    insideHorizontal: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL },
  };

  const logoPath = getLogoPath();
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

  // Aplica o parse de **negrito** nas Infrações em DOCX também
  const processedTextParagraphs = texto_final.split('\n').map(line => {
    const safeLine = line.trim() === "" ? " " : line;
    const parts = safeLine.split(/\*\*(.*?)\*\*/g);
    const textRuns = parts.map((part, index) => {
      if (part === "") return null;
      return new TextRun({ text: part, bold: index % 2 !== 0 });
    }).filter(Boolean);

    return new Paragraph({ 
      children: textRuns.length > 0 ? textRuns : [new TextRun(" ")], 
      alignment: AlignmentType.JUSTIFIED, 
      spacing: { after: 60 } 
    });
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
                alignment: AlignmentType.JUSTIFIED
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
              new Paragraph({ children: [new TextRun({ text: "Canais de atendimento: ", bold: true }), new TextRun("Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira.")], alignment: AlignmentType.JUSTIFIED }),
              new Paragraph({ children: [new TextRun("Comasa: Rua Albano Schmidt, 4932 - Comasa (Subprefeitura Leste), das 8h às 12h, de segunda a sexta-feira.")], alignment: AlignmentType.JUSTIFIED }),
              new Paragraph({ children: [new TextRun("Pirabeiraba: Rua Joinville, 13.500 (Subprefeitura Pirabeiraba), das 7h30 às 12h e das 13h às 15h30, somente às segundas e terças-feiras. WhatsApp: (47) 99771-8115 - Call Center: 115 ou 0800 723 0300 - E-mail: atendimento@aguasdejoinville.com.br")], alignment: AlignmentType.JUSTIFIED })
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

  return await Packer.toBuffer(doc);
};

const buildInfracaoPdf = (dados) => {
  return new Promise((resolve, reject) => {
    const { 
      texto_final, autoInfracao, matricula, nomeCliente, logradouro, 
      localizacao, cep, bairro, categoriaTarifa, numeroHidrometro 
    } = dados;
    
    const numAutoInfracao = autoInfracao || "{AUTO_INFRACAO}";
    const mat = matricula || "{MATRICULA}";
    const cliente = nomeCliente || "{NOME_CLIENTE_MORADOR}";
    const endLogradouro = logradouro || "{ENDERECO_LOGRADOURO}";
    const loc = localizacao || "{LOCALIZACAO}";

    const { dataStr, horaStr } = getCurrentTimeStrings();

    const doc = new PDFDocument({ margin: 35, size: "A4" });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // --- 1. CABEÇALHO ---
    const logoPath = getLogoPath();
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 35, 30, { width: 65 });
    }

    doc.font("Helvetica-Bold").fontSize(9).text("COMPANHIA ÁGUAS DE JOINVILLE", 120, 35);
    doc.font("Helvetica").fontSize(8).text("Rua TIJUCAS, 213", 120, 47);
    doc.font("Helvetica-Bold").text("AUTO DE INFRAÇÃO - CFC", 120, 59);

    doc.font("Helvetica").text(`Data:   ${dataStr}`, 470, 35);
    doc.text(`Hora:   ${horaStr}`, 470, 47);

    // --- 2. TÍTULO ---
    doc.moveDown(3);
    const titleStr = `Auto de Infração nº ${numAutoInfracao}`;
    doc.font("Helvetica-Bold").fontSize(11);
    const titleWidth = doc.widthOfString(titleStr);
    const titleX = 35 + (525 - titleWidth) / 2;
    doc.text(titleStr, titleX, doc.y, { underline: true });
    
    doc.moveDown(1.5);

    // --- 3. TABELA PRINCIPAL ---
    let b1Y = doc.y;
    let rowH = 16;
    let pad = 4.5;
    let dynamicPad = 8;
    
    let col2X = 200;
    let col3X = 370;

    doc.font("Helvetica-Bold").fontSize(8.5).text("Matricula: ", 40, b1Y + pad, { continued: true }).font("Helvetica").text(mat);
    doc.font("Helvetica-Bold").text("Categoria: ", col2X + 5, b1Y + pad, { continued: true }).font("Helvetica").text(categoriaTarifa || "-");
    doc.font("Helvetica-Bold").text("Nº HD: ", col3X + 5, b1Y + pad, { continued: true }).font("Helvetica").text(numeroHidrometro || "-");
    doc.moveTo(35, b1Y + rowH).lineTo(560, b1Y + rowH).stroke(); 
    
    doc.font("Helvetica-Bold").text("Cliente: ", 40, b1Y + rowH + pad, { continued: true }).font("Helvetica").text(cliente);
    doc.moveTo(35, b1Y + rowH * 2).lineTo(560, b1Y + rowH * 2).stroke();
    
    doc.font("Helvetica-Bold").text("Endereço: ", 40, b1Y + rowH * 2 + pad, { continued: true }).font("Helvetica").text(endLogradouro);
    doc.font("Helvetica-Bold").text("Bairro: ", col3X + 5, b1Y + rowH * 2 + pad, { continued: true }).font("Helvetica").text(bairro || "-");
    doc.moveTo(35, b1Y + rowH * 3).lineTo(560, b1Y + rowH * 3).stroke();
    
    doc.font("Helvetica-Bold").text("Localização: ", 40, b1Y + rowH * 3 + pad, { continued: true }).font("Helvetica").text(`${loc} - CEP: ${cep || "-"}`);
    doc.moveTo(35, b1Y + rowH * 4).lineTo(560, b1Y + rowH * 4).stroke();

    let yRowIA = b1Y + rowH * 4;
    
    // Suporte para **negrito** inline na descrição da infração em PDF
    const textParts = texto_final.split(/\*\*(.*?)\*\*/g);
    const validTextParts = textParts.map((part, index) => ({
      text: part,
      bold: index % 2 !== 0
    })).filter(p => p.text !== "");

    if (validTextParts.length === 0) {
       doc.font("Helvetica").fontSize(9).text(" ", 40, yRowIA + dynamicPad, { align: "justify", width: 515, lineGap: 2 });
    } else {
       validTextParts.forEach((partObj, idx) => {
         doc.font(partObj.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9);
         const isLast = idx === validTextParts.length - 1;
         const options = { align: "justify", width: 515, lineGap: 2, continued: !isLast };
         
         // Apenas o primeiro item precisa das coordenadas iniciais absolutas X e Y.
         // Os próximos usam 'continued: true' e acompanham a fluidez do texto.
         if (idx === 0) {
           doc.text(partObj.text, 40, yRowIA + dynamicPad, options);
         } else {
           doc.text(partObj.text, options);
         }
       });
    }

    let endRowIA = doc.y + dynamicPad;
    doc.moveTo(35, endRowIA).lineTo(560, endRowIA).stroke(); 

    doc.font("Helvetica-Bold").fontSize(8.5).text("Defesa: ", 40, endRowIA + dynamicPad, { continued: true })
       .font("Helvetica").text("Fica assegurado ao notificado o direito ao contraditório e à ampla defesa, podendo apresentar defesa ou impugnação, pessoalmente ou por intermédio de procurador legalmente constituído, por meio de um dos canais de atendimento desta prestadora, no prazo de 15 (quinze) dias úteis, contados da data de recebimento desta notificação. Decorrido o prazo sem a apresentação de defesa, ou sendo esta indeferida após análise administrativa, serão adotadas as medidas cabíveis e aplicadas as penalidades previstas na legislação e regulamentação vigentes.", { align: "justify", width: 505, lineGap: 1.5 });
    
    let endRowDefesa = doc.y + dynamicPad;
    doc.moveTo(35, endRowDefesa).lineTo(560, endRowDefesa).stroke();

    doc.font("Helvetica-Bold").text("Canais de atendimento: ", 40, endRowDefesa + dynamicPad, { continued: true })
       .font("Helvetica").text("Centro: Rua Tijucas, 213 - Centro, das 8h às 16h, de segunda a sexta-feira.");
    doc.text("Comasa: Rua Albano Schmidt, 4932 - Comasa (Subprefeitura Leste), das 8h às 12h, de segunda a sexta-feira.", 40, doc.y);
    doc.text("Pirabeiraba: Rua Joinville, 13.500 (Subprefeitura Pirabeiraba), das 7h30 às 12h e das 13h às 15h30, somente às segundas e terças-feiras.", 40, doc.y);
    doc.text("WhatsApp: (47) 99771-8115 - Call Center: 115 ou 0800 723 0300 - E-mail: atendimento@aguasdejoinville.com.br", 40, doc.y);
    let endRowCanais = doc.y + dynamicPad;

    doc.rect(35, b1Y, 525, endRowCanais - b1Y).stroke();

    doc.moveTo(col2X, b1Y).lineTo(col2X, b1Y + rowH).stroke(); 
    doc.moveTo(col3X, b1Y).lineTo(col3X, b1Y + rowH).stroke(); 
    doc.moveTo(col3X, b1Y + rowH * 2).lineTo(col3X, b1Y + rowH * 3).stroke(); 

    doc.y = endRowCanais + 15;

    // --- 4. DESTINATÁRIO (Tabela Estruturada) ---
    let b6Y = doc.y;
    let meioX = 298; 
    
    doc.font("Helvetica-Bold").text("Destinatário: ", 40, b6Y + 4, { continued: true }).font("Helvetica").text(`${cliente}.`);
    doc.moveTo(35, b6Y + rowH).lineTo(560, b6Y + rowH).stroke(); 
    
    doc.font("Helvetica-Bold").text("Endereço: ", 40, b6Y + rowH + 4, { continued: true }).font("Helvetica").text(`${endLogradouro}`);
    doc.font("Helvetica-Bold").text("Localização: ", meioX + 5, b6Y + rowH + 4, { continued: true }).font("Helvetica").text(`${loc}.`);
    doc.moveTo(35, b6Y + rowH * 2).lineTo(560, b6Y + rowH * 2).stroke();
    
    doc.font("Helvetica-Bold").text("Auto de infração: ", 40, b6Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(`${numAutoInfracao}`);
    doc.font("Helvetica-Bold").text("Matricula: ", meioX + 5, b6Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(mat);
    
    doc.moveTo(meioX, b6Y + rowH).lineTo(meioX, b6Y + rowH * 3).stroke();
    doc.rect(35, b6Y, 525, rowH * 3).stroke();
    
    doc.y = b6Y + (rowH * 3) + 15;

    // --- 5. AVISO DE RECEBIMENTO (Tabela Estruturada) ---
    let b7Y = doc.y;
    
    doc.font("Helvetica-Bold").fontSize(10).text("AVISO DE RECEBIMENTO - AR", 35, b7Y + 4, { align: "center", width: 525 });
    doc.moveTo(35, b7Y + rowH).lineTo(560, b7Y + rowH).stroke(); 
    
    doc.fontSize(8.5);
    doc.font("Helvetica-Bold").text("AUTO DE INFRAÇÃO: ", 40, b7Y + rowH + 4, { continued: true }).font("Helvetica").text(`${numAutoInfracao}.`);
    doc.font("Helvetica-Bold").text("MATRICULA: ", meioX + 5, b7Y + rowH + 4, { continued: true }).font("Helvetica").text(`${mat}.`);
    doc.moveTo(35, b7Y + rowH * 2).lineTo(560, b7Y + rowH * 2).stroke(); 
    
    doc.font("Helvetica-Bold").text("NOME: ", 40, b7Y + rowH * 2 + 4, { continued: true }).font("Helvetica").text(`${cliente}.`);
    doc.moveTo(35, b7Y + rowH * 3).lineTo(560, b7Y + rowH * 3).stroke(); 
    
    doc.font("Helvetica-Bold").text("ENDEREÇO: ", 40, b7Y + rowH * 3 + 4, { continued: true }).font("Helvetica").text(`${endLogradouro}.`);
    doc.font("Helvetica-Bold").text("LOCALIZAÇÃO: ", meioX + 5, b7Y + rowH * 3 + 4, { continued: true }).font("Helvetica").text(`${loc}.`);
    doc.moveTo(35, b7Y + rowH * 4).lineTo(560, b7Y + rowH * 4).stroke(); 
    
    doc.font("Helvetica-Bold").text("TENTATIVAS: ", 40, b7Y + rowH * 4 + 4, { continued: true })
       .font("Helvetica").text("1ª ___ / ___ / _______.   -   2ª ___ / ___ / _______.   -   3ª ___ / ___ / _______.");
    doc.moveTo(35, b7Y + rowH * 5).lineTo(560, b7Y + rowH * 5).stroke(); 
    
    let tallH = 26;
    doc.font("Helvetica-Bold").text("NOME LEGÍVEL DO RECEBEDOR:", 40, b7Y + rowH * 5 + 4);
    doc.moveTo(35, b7Y + rowH * 5 + tallH).lineTo(560, b7Y + rowH * 5 + tallH).stroke(); 
    
    doc.text("DOCUMENTO:", 40, b7Y + rowH * 5 + tallH + 4);
    doc.text("DATA DE RECEBIMENTO:", meioX + 5, b7Y + rowH * 5 + tallH + 4);
    
    let totalARHeight = (rowH * 5) + (tallH * 2);
    doc.moveTo(meioX, b7Y + rowH).lineTo(meioX, b7Y + rowH * 2).stroke();
    doc.moveTo(meioX, b7Y + rowH * 3).lineTo(meioX, b7Y + rowH * 4).stroke();
    doc.moveTo(meioX, b7Y + rowH * 5 + tallH).lineTo(meioX, b7Y + totalARHeight).stroke();
    
    doc.rect(35, b7Y, 525, totalARHeight).stroke();

    doc.end();
  });
};

module.exports = {
  buildParecerWord,
  buildParecerPdf,
  buildInfracaoWord,
  buildInfracaoPdf
};