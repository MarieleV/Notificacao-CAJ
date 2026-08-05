import { useState } from "react";
import { parseMonthYear } from "../utils/dates";
import { maskMonthYear, maskBRL, fmtBRL } from "../utils/masks";

export interface ManualRow {
  id: number;
  monthYear: string;
  consumption: string;
  irregularConsumption: string;
  correctValue: string;
  correctService: string;
  chargedValue: string;
  chargedService: string;
}

let uid = 1;
const newId = () => uid++;

const parseCurrency = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
};

export function useCalculadoraMulta() {
  // ─── Estados de Linhas e Períodos ───
  const [waterRows, setWaterRows] = useState<ManualRow[]>([]);
  const [sewageRows, setSewageRows] = useState<ManualRow[]>([]);
  
  const [waterPeriod, setWaterPeriod] = useState("");
  const [sewagePeriod, setSewagePeriod] = useState("");

  // ─── Estados do Texto de Apuração ───
  const [aiNumber, setAiNumber] = useState("");
  const [removalDate, setRemovalDate] = useState("");
  const [baseConsumption, setBaseConsumption] = useState("");
  const [postRegRef, setPostRegRef] = useState("");
  
  const [waterReportText, setWaterReportText] = useState("");
  const [sewageReportText, setSewageReportText] = useState("");
  const [copiedWater, setCopiedWater] = useState(false);
  const [copiedSewage, setCopiedSewage] = useState(false);

  const AUTOFILL_FIELDS: (keyof ManualRow)[] = [
    "consumption", "irregularConsumption", "correctValue", "correctService", "chargedValue", "chargedService"
  ];

  // ─── Lógica de Manuseio das Linhas ───
  function handleGeneratePeriod(rangeVal: string, type: "water" | "sewage") {
    if (!rangeVal) return;
    const parts = rangeVal.split(" a ");
    const start = parseMonthYear(parts[0]);
    const end = parts.length > 1 ? parseMonthYear(parts[1]) : start;

    if (!start || !end || start > end) return;

    const generatedRows: ManualRow[] = [];
    let current = new Date(start);

    while (current <= end) {
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const yyyy = current.getFullYear();
      
      generatedRows.push({
        id: newId(),
        monthYear: `${mm}/${yyyy}`,
        consumption: "",
        irregularConsumption: "",
        correctValue: "",
        correctService: "",
        chargedValue: "",
        chargedService: ""
      });
      current.setMonth(current.getMonth() + 1);
    }

    const setFn = type === "water" ? setWaterRows : setSewageRows;
    
    setFn((prev) => {
      const existingMonths = prev.map(r => r.monthYear);
      const filteredRows = generatedRows.filter(r => !existingMonths.includes(r.monthYear));
      return [...prev, ...filteredRows];
    });
  }

  function addRow(type: "water" | "sewage") {
    const newRow: ManualRow = { 
      id: newId(), monthYear: "", consumption: "", irregularConsumption: "",
      correctValue: "", correctService: "", chargedValue: "", chargedService: ""
    };
    if (type === "water") setWaterRows(p => [...p, newRow]);
    else setSewageRows(p => [...p, newRow]);
  }

  function removeRow(id: number, type: "water" | "sewage") {
    if (type === "water") setWaterRows(p => p.filter(r => r.id !== id));
    else setSewageRows(p => p.filter(r => r.id !== id));
  }

  function changeRow(id: number, field: keyof ManualRow, val: string, type: "water" | "sewage") {
    const setFn = type === "water" ? setWaterRows : setSewageRows;
    
    setFn(p => p.map(r => {
      if (r.id !== id) return r;
      if (field === "monthYear") return { ...r, monthYear: maskMonthYear(val) };
      if (field === "consumption" || field === "irregularConsumption") {
        return { ...r, [field]: val.replace(/[^0-9,]/g, "") };
      }
      if (["correctValue", "correctService", "chargedValue", "chargedService"].includes(field)) {
        return { ...r, [field]: maskBRL(val) };
      }
      return r;
    }));
  }

  function cascadeFillFromFirstRow(field: keyof ManualRow, type: "water" | "sewage") {
    if (!AUTOFILL_FIELDS.includes(field)) return;
    const setFn = type === "water" ? setWaterRows : setSewageRows;
    
    setFn(p => {
      if (p.length === 0) return p;
      const value = p[0][field] as string;
      if (!value) return p;
      return p.map((r, i) => {
        if (i === 0) return r;
        if (r[field] === "") return { ...r, [field]: value };
        return r;
      });
    });
  }

  // ─── Motor de Cálculo ───
  function calculateResults(rows: ManualRow[]) {
    let totalM3 = 0;
    let grandCorrect = 0;
    let grandCharged = 0;

    const calcRows = rows.map(row => {
      const correctVal = parseCurrency(row.correctValue);
      const correctServ = parseCurrency(row.correctService);
      const chargedVal = parseCurrency(row.chargedValue);
      const chargedServ = parseCurrency(row.chargedService);
      const consIrreg = parseFloat(row.irregularConsumption.replace(",", ".")) || 0;

      const totalCorrect = correctVal + correctServ;
      const totalCharged = chargedVal + chargedServ;
      const diff = totalCorrect - totalCharged;

      totalM3 += consIrreg;
      grandCorrect += totalCorrect;
      grandCharged += totalCharged;

      return { row, totalCorrect, totalCharged, diff };
    });

    const grandDiff = grandCorrect - grandCharged;

    return { calcRows, totalM3, grandCorrect, grandCharged, grandDiff };
  }

  const waterResults = calculateResults(waterRows);
  const sewageResults = calculateResults(sewageRows);

  // ─── Geração de Texto ───
  function handleGenerateText(type: "water" | "sewage") {
    const isWater = type === "water";
    const rows = isWater ? waterRows : sewageRows;
    const results = isWater ? waterResults : sewageResults;
    const titleType = isWater ? "água" : "esgoto";

    if (rows.length === 0) return;
    
    const qtdMeses = rows.length;
    const startMonth = rows[0].monthYear;
    const endMonth = rows[qtdMeses - 1].monthYear;
    
    const textAi = aiNumber || "[Nº do AI]";
    const textData = removalDate || "[data]";
    const textConsumoBase = baseConsumption || "[m³]";
    const textRef = postRegRef || "[MM/AAAA]";
    const textMeses = qtdMeses === 1 ? "1 mês" : `${qtdMeses} meses`;

    const generatedString = `Cálculo do consumo estimado de ${titleType} ref. ${textAi}.
Data da retirada da irregularidade: ${textData}.
${textMeses}, com consumo impactado pela violação: ${startMonth} até ${endMonth}.
Maior consumo mês cheio lido após a regularização: ${textConsumoBase} m³ REF. ${textRef}.
Valor total do consumo estimado no período: ${fmtBRL(results.grandCorrect)}.
Valor pago pelo cliente no período da irregularidade: ${fmtBRL(results.grandCharged)}.
Valor a ser lançado: ${fmtBRL(results.grandDiff)}.
Volume faturado no mês impactado pela violação: ${textConsumoBase} m³.
Volume total recuperado: ${results.totalM3} m³.`;

    if (isWater) {
      setWaterReportText(generatedString);
    } else {
      setSewageReportText(generatedString);
    }
  }

  function handleCopy(text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  }

  // ─── Exportando os Recursos ───
  return {
    // Estados Water
    waterRows,
    waterPeriod, setWaterPeriod,
    waterReportText, setWaterReportText,
    copiedWater, setCopiedWater,
    waterResults,
    
    // Estados Sewage
    sewageRows,
    sewagePeriod, setSewagePeriod,
    sewageReportText, setSewageReportText,
    copiedSewage, setCopiedSewage,
    sewageResults,

    // Estados Auxiliares
    aiNumber, setAiNumber,
    removalDate, setRemovalDate,
    baseConsumption, setBaseConsumption,
    postRegRef, setPostRegRef,

    // Funções
    handleGeneratePeriod,
    addRow,
    removeRow,
    changeRow,
    cascadeFillFromFirstRow,
    handleGenerateText,
    handleCopy
  };
}