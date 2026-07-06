const documentService = require("../services/documentService");

const exportParecerWord = async (req, res) => {
  const { texto_final, tipoCaso } = req.body;
  if (!texto_final) return res.status(400).json({ detail: "Texto final obrigatório." });

  try {
    const buffer = await documentService.buildParecerWord(texto_final);
    res.setHeader("Content-Disposition", `attachment; filename=Parecer_${tipoCaso || 'Ouvidoria'}.docx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (error) {
    console.error("Erro Parecer DOCX:", error);
    res.status(500).json({ detail: "Erro ao gerar docx." });
  }
};

const exportInfracaoWord = async (req, res) => {
  if (!req.body.texto_final) return res.status(400).json({ detail: "O texto final não foi enviado." });

  try {
    const buffer = await documentService.buildInfracaoWord(req.body);
    res.setHeader("Content-Disposition", "attachment; filename=Notificacao.docx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.send(buffer);
  } catch (error) {
    console.error("Erro DOCX Infração:", error);
    res.status(500).json({ detail: "Erro interno ao gerar o documento." });
  }
};

const exportInfracaoPdf = async (req, res) => {
  if (!req.body.texto_final) return res.status(400).json({ detail: "O texto final não foi enviado." });

  try {
    const buffer = await documentService.buildInfracaoPdf(req.body);
    const numAutoInfracao = req.body.autoInfracao || "{AUTO_INFRACAO}";
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Notificacao_Extrajudicial_${numAutoInfracao}.pdf`);
    res.send(buffer);
  } catch (error) {
    console.error("Erro PDF Infração:", error);
    res.status(500).json({ detail: "Erro interno no servidor ao gerar PDF." });
  }
};

module.exports = {
  exportParecerWord,
  exportInfracaoWord,
  exportInfracaoPdf
};