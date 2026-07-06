const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } = require("docx");
const PDFDocument = require("pdfkit");

// Utilitário para formatar texto do Word
const formatTextToDocx = (text) => {
  const lines = text.split('\n');
  return lines.map(line => {
    const isBoldLine = /^(01\.|02\.|03\.|I\s–|II\s–|III\s–|IV\s–|V\s–|OBJETO:|DECISÃO:)/i.test(line);
    return new Paragraph({
      children: [new TextRun({ text: line, bold: isBoldLine, font: "Arial", size: 22 })],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFY
    });
  });
};

const buildParecerWord = async (textoFinal) => {
  const doc = new Document({
    sections: [{
      properties: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } },
      children: formatTextToDocx(textoFinal)
    }]
  });
  return await Packer.toBuffer(doc);
};

const buildInfracaoWord = async (dados) => {
  // Pegue as variáveis do payload
  const { texto_final, protocolo, autoInfracao, matricula, nomeCliente, logradouro, bairro, cep, localizacao, categoriaTarifa, numeroHidrometro } = dados;
  
  // Aqui entra todo aquele seu bloco GIGANTE de configuração do DOCX (Tabelas, ImageRun, etc).
  // No final do bloco, você vai ter o `const doc = new Document({ ... })`
  
  // ... [COLE AQUI A LÓGICA DE MONTAGEM DO SEU `doc` DO WORD] ...

  // Exemplo de retorno no final da função:
  // return await Packer.toBuffer(doc);
};

const buildInfracaoPdf = (dados) => {
  return new Promise((resolve, reject) => {
    const { texto_final, autoInfracao, matricula, nomeCliente, logradouro, localizacao, cep, bairro, categoriaTarifa, numeroHidrometro } = dados;
    
    const doc = new PDFDocument({ margin: 35, size: "A4" });
    const buffers = [];
    
    // Captura os dados do PDFKit e transforma em Buffer para o Controller
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ... [COLE AQUI A LÓGICA GIGANTE DE DESENHO DO SEU PDF (`doc.text`, `doc.moveTo`, etc)] ...

    // Fecha o documento para finalizar o stream
    doc.end();
  });
};

module.exports = {
  buildParecerWord,
  buildInfracaoWord,
  buildInfracaoPdf
};