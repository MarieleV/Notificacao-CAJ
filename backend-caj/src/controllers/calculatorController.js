const calculatorService = require("../services/calculatorService");

const calculate = (req, res) => {
  try {
    const result = calculatorService.calculatePenalty(req.body);
    res.json(result);
  } catch (error) {
    console.error("Erro ao processar cálculo:", error);
    res.status(500).json({ detail: "Erro ao processar cálculo interno." });
  }
};

module.exports = { calculate };