// src/utils/formatters.js

const parseBRL = (value) => {
  if (!value) return 0.0;
  const parsed = parseFloat(value.replace(/\./g, "").replace(",", "."));
  return isNaN(parsed) ? 0.0 : parsed;
};

const parseMonthYear = (value) => {
  if (!value) return null;
  const parts = value.split("/");
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
  return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

module.exports = {
  parseBRL,
  parseMonthYear,
  isWithinRange,
  formatBRL
};