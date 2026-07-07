// src/services/calculatorService.js
const { parseMonthYear, isWithinRange, parseBRL, formatBRL } = require("../utils/formatters");

const calculatePenalty = (payload) => {
  const { 
    serviceRates = [], m3Tiers = [], rows = [], sewageRows = [], k1Factor = "1,00",
    aiNumber, removalDate, postRegM3, postRegRef, billedM3 
  } = payload;

  const k1 = parseBRL(k1Factor) || 1.0;
  const calcRows = [];
  const validDates = [];

  // 1. Processamento de Água
  for (const row of rows) {
    const targetDateNum = parseMonthYear(row.monthYear);
    
    // CORREÇÃO: Lendo a chave 'consumption' em inglês conforme o Front-end envia
    const consumption = parseBRL(row.consumption); 
    
    const chargedWater = parseBRL(row.chargedWater);
    const chargedService = parseBRL(row.chargedService);
    const totalCharged = chargedWater + chargedService;

    let serviceRateValue = null;
    let correctWater = null; 

    if (targetDateNum) {
      const rateMatch = serviceRates.find(rate => isWithinRange(row.monthYear, rate.startMonth, rate.endMonth) && parseBRL(rate.value) > 0);
      if (rateMatch) serviceRateValue = parseBRL(rateMatch.value);

      if (m3Tiers.length > 0 && consumption > 0) {
        correctWater = 0;
        let remainingConsumption = consumption;
        const sortedTiers = [...m3Tiers].sort((a, b) => a.min - b.min);

        for (const tier of sortedTiers) {
          if (remainingConsumption <= 0) break;
          
          const min = Number(tier.min);
          const max = (tier.max === "Infinity" || tier.max === Infinity) ? Infinity : Number(tier.max);
          
          const capacity = max === Infinity ? Infinity : (max - min + 1);
          const volumeInTier = Math.min(remainingConsumption, capacity);
          
          correctWater += volumeInTier * parseBRL(tier.value);
          remainingConsumption -= volumeInTier;
        }
      }
    }

    const totalCorrect = (correctWater !== null && serviceRateValue !== null) ? correctWater + serviceRateValue : null;
    const difference = totalCorrect !== null ? totalCorrect - totalCharged : null;
    const hasError = !targetDateNum || serviceRateValue === null || m3Tiers.length === 0;

    if (!hasError) validDates.push(row.monthYear);

    calcRows.push({
      id: row.id, monthYear: row.monthYear, hasError, 
      consumption, // CORREÇÃO: Devolvendo a chave 'consumption' para o Front-end exibir
      correctWater, correctService: serviceRateValue, totalCorrect, 
      chargedWater, chargedService, totalCharged, diff: difference
    });
  }

  // 2. Processamento de Esgoto
  const calcSewageRows = [];
  for (const sewageRow of sewageRows) {
    const waterMatch = calcRows.find(wr => wr.monthYear === sewageRow.monthYear && !wr.hasError);
    const chargedSewage = parseBRL(sewageRow.chargedSewage);
    const chargedService = parseBRL(sewageRow.chargedService);
    const totalCharged = chargedSewage + chargedService;
    
    let totalCorrect = null;
    let hasError = true;

    if (waterMatch && waterMatch.totalCorrect !== null) {
      totalCorrect = waterMatch.totalCorrect * 0.8 * k1;
      hasError = false;
    }

    calcSewageRows.push({
      id: sewageRow.id, monthYear: sewageRow.monthYear, hasError,
      chargedSewage, chargedService, totalCharged, totalCorrect, 
      diff: totalCorrect !== null ? totalCorrect - totalCharged : null
    });
  }

  // 3. Totais e Relatórios
  const validRows = calcRows.filter((cr) => !cr.hasError && cr.totalCorrect !== null);
  const validSewageRows = calcSewageRows.filter((sr) => !sr.hasError && sr.totalCorrect !== null);
  
  const totals = {
    totalM3: validRows.reduce((acc, cr) => acc + cr.consumption, 0), // CORREÇÃO: Somando a chave 'consumption'
    grandCorrect: validRows.reduce((acc, cr) => acc + cr.totalCorrect, 0),
    grandCharged: validRows.reduce((acc, cr) => acc + cr.totalCharged, 0),
    grandSewageCorrect: validSewageRows.reduce((acc, sr) => acc + sr.totalCorrect, 0),
    grandSewageCharged: validSewageRows.reduce((acc, sr) => acc + sr.totalCharged, 0),
    validCount: validRows.length
  };
  
  totals.grandDiff = totals.grandCorrect - totals.grandCharged;
  totals.grandSewageDiff = totals.grandSewageCorrect - totals.grandSewageCharged;
  totals.absoluteTotalDiff = totals.grandDiff + totals.grandSewageDiff;

  validDates.sort((a, b) => parseMonthYear(a) - parseMonthYear(b));
  const firstMonth = validDates[0] || "—";
  const lastMonth = validDates[validDates.length - 1] || "—";
  const aiRef = (aiNumber || "").trim() ? `AI ${aiNumber.trim()}` : "[Nº do AI]";
  
  const waterReportText = `Cálculo do consumo estimado de água ref. ${aiRef}.\n` +
    `Data da retirada da irregularidade: ${removalDate || "[data]"}.\n` +
    `${totals.validCount} ${totals.validCount === 1 ? "mês" : "meses"}, com consumo impactado pela violação: ${firstMonth} até ${lastMonth}.\n` +
    `Maior consumo mês cheio lido após a regularização: ${postRegM3 || "[m³]"} m³ REF. ${(postRegRef || "[MM/AAAA]").toUpperCase()}.\n` +
    `Valor total do consumo estimado no período: ${formatBRL(totals.grandCorrect)}.\n` +
    `Valor pago pelo cliente no período da irregularidade: ${formatBRL(totals.grandCharged)}.\n` +
    `Valor a ser lançado ${formatBRL(totals.grandDiff)}.\n` +
    `Volume faturado no mês impactado pela violação: ${billedM3 || "[m³]"} m³.\n` +
    `Volume total recuperado: ${totals.totalM3} m³.`;

  const sewageReportText = validSewageRows.length === 0 ? "" : 
    `Cálculo do consumo estimado de esgoto ref. ${aiRef}.\n` +
    `Data da retirada da irregularidade: ${removalDate || "[data]"}.\n` +
    `${totals.validCount} ${totals.validCount === 1 ? "mês" : "meses"}, anterior à retirada, com consumo irregular ${firstMonth} até ${lastMonth}.\n` +
    `Maior consumo mês cheio sem cortes de água da unidade antes da regularização: ${postRegM3 || "[m³]"} m³ REF. ${(postRegRef || "[MM/AAAA]").toUpperCase()}.\n` +
    `Valor total do consumo estimado no período: ${formatBRL(totals.grandSewageCorrect)}.\n` +
    `Valor pago pelo cliente no período da irregularidade: ${formatBRL(totals.grandSewageCharged)}.\n` +
    `Valor a ser lançado ${formatBRL(totals.grandSewageDiff)}.\n` +
    `Volume total recuperado: ${totals.totalM3} m³.`;

  return { rows: calcRows, sewageRows: calcSewageRows, totals, waterReportText, sewageReportText };
};

module.exports = { calculatePenalty };