// src/utils/formatters.js

const parseBRL = (value) => {
  if (value === null || value === undefined || value === "") return 0.0;
  
  // TRAVA DE SEGURANÇA: Se o front-end enviar um número direto, não faz o replace
  if (typeof value === "number") return value; 

  // Garante que é texto e remove "R$" e espaços se existirem
  const stringValue = String(value).replace(/R\$\s?/g, "").trim();
  
  const parsed = parseFloat(stringValue.replace(/\./g, "").replace(",", "."));
  return isNaN(parsed) ? 0.0 : parsed;
};

const parseMonthYear = (value) => {
  if (!value) return null;
  const parts = String(value).split("/"); // Garante que seja texto antes do split
  if (parts.length !== 2) return null;
  return parseInt(parts[1], 10) * 12 + parseInt(parts[0], 10); 
};

const isWithinRange = (targetStr, startStr, endStr) => {
  const target = parseMonthYear(targetStr);
  const start = parseMonthYear(startStr);
  const end = parseMonthYear(endStr);
  
  if (!target || !start) return false;
  if (end) return target >= start && target <= end;
  return target >= start;
};

const formatBRL = (value) => {
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  return "R$ " + num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

module.exports = {
  parseBRL,
  parseMonthYear,
  isWithinRange,
  formatBRL
};