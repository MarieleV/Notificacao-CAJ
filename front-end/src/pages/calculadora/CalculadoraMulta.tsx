import { useState, ElementType } from "react";
import {
  Plus, Trash2, Calculator, ClipboardList, AlertCircle, 
  Droplets, Info, FileText, CheckCircle2, Copy, RefreshCw
} from "lucide-react";

import { parseMonthYear, labelMonth } from "../../utils/dates";
import { maskMonthYear, maskBRL, fmtBRL } from "../../utils/masks";
import { DatePicker } from "../../components/shared/DatePicker";
import { MonthYearPicker } from "../../components/shared/MonthYearPicker";
import { MonthYearRangePicker } from "../../components/shared/MonthYearRangePicker";
import { SectionBlock } from "../../components/shared/SectionBlock";

// ─── Tipagens (TypeScript) ───────────────────────────────────────────────────

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

// ─── Funções Auxiliares de Cálculo ───────────────────────────────────────────

const parseCurrency = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
};

// ─── Subcomponentes (DRY) ────────────────────────────────────────────────────

const GridInput = ({ hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input
    {...props}
    className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 transition-all h-[34px] placeholder-gray-400 ${
      hasError
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-[#1a5fa8] focus:ring-[#1a5fa8]/20 bg-white"
    } ${props.className || ""}`}
  />
);

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ElementType;
  theme: "default" | "blue" | "red" | "emerald";
}

function KpiCard({ title, value, subtitle, icon: Icon, theme }: KpiCardProps) {
  const themes = {
    default: {
      wrapper: "border-gray-100 bg-[#f8fafe]",
      icon: "text-[#1a5fa8]",
      title: "text-gray-500",
      value: "text-[#0b1e35]",
      subtitle: "text-gray-400"
    },
    blue: {
      wrapper: "border-[#c3ddf8] bg-[#eef6ff]",
      icon: "text-[#1a5fa8]",
      title: "text-[#1a5fa8]",
      value: "text-[#1a5fa8]",
      subtitle: "text-[#4a7fa5]"
    },
    red: {
      wrapper: "border-red-200 bg-red-50",
      icon: "text-red-500",
      title: "text-red-500",
      value: "text-red-600",
      subtitle: "text-red-400"
    },
    emerald: {
      wrapper: "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-600",
      title: "text-emerald-700",
      value: "text-emerald-700",
      subtitle: "text-emerald-600"
    }
  };
  
  const active = themes[theme];

  return (
    <div className={`rounded-xl border p-4 transition-colors ${active.wrapper}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={active.icon} />
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${active.title}`}>
          {title}
        </p>
      </div>
      <p className={`text-2xl font-bold tabular-nums ${active.value}`}>
        {value}
      </p>
      <p className={`text-[10px] mt-1 ${active.subtitle}`}>{subtitle}</p>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

let uid = 1;
const newId = () => uid++;

export function CalculadoraMulta() {
  // Estados de Linhas e Períodos
  const [waterRows, setWaterRows] = useState<ManualRow[]>([]);
  const [sewageRows, setSewageRows] = useState<ManualRow[]>([]);
  
  const [waterPeriod, setWaterPeriod] = useState("");
  const [sewagePeriod, setSewagePeriod] = useState("");

  // Estados do Texto de Apuração
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

  // ─── Lógica de Manuseio das Linhas ──────────────────────────────────────────

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

  // ─── Motor de Cálculo Local (Frontend) ──────────────────────────────────────

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

  // ─── Geração de Texto Local ─────────────────────────────────────────────────

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

  // ─── Renderização das Tabelas de Entrada ────────────────────────────────────

  const renderEntryTable = (stepNum: number, title: string, desc: string, type: "water" | "sewage") => {
    const rows = type === "water" ? waterRows : sewageRows;
    const period = type === "water" ? waterPeriod : sewagePeriod;
    const setPeriod = type === "water" ? setWaterPeriod : setSewagePeriod;
    
    return (
      <SectionBlock
        number={stepNum}
        title={title}
        description={desc}
        headerAction={
          <div className="w-full max-w-[240px]">
            <MonthYearRangePicker 
              value={period} 
              onChange={(val) => {
                setPeriod(val);
                if (val) handleGeneratePeriod(val, type); 
              }} 
              placeholder="Adicione um período..." 
            />
          </div>
        }
      >
        <div className="overflow-x-auto -mx-2 px-2 pb-2">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[90px_80px_80px_1fr_1fr_1fr_1fr_40px] gap-2 mb-2 px-1">
              {[
                "Mês/Ano", "Cons. Reg.", "Cons. Irreg.", 
                "Valor Correto", "Serviço Correto", 
                "Valor Cobrado Errado", "Serv. Cobrado Errado", ""
              ].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => {
                const dateError = row.monthYear.length === 7 && !parseMonthYear(row.monthYear);
                return (
                  <div key={row.id}>
                    <div className="grid grid-cols-[90px_80px_80px_1fr_1fr_1fr_1fr_40px] gap-2 items-center group">
                      <GridInput
                        value={row.monthYear}
                        onChange={(e) => changeRow(row.id, "monthYear", e.target.value, type)}
                        placeholder="MM/AAAA"
                        maxLength={7}
                        hasError={dateError}
                      />
                      <GridInput
                        value={row.consumption}
                        onChange={(e) => changeRow(row.id, "consumption", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("consumption", type)}
                        placeholder="Ex: 20"
                      />
                      <GridInput
                        value={row.irregularConsumption}
                        onChange={(e) => changeRow(row.id, "irregularConsumption", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("irregularConsumption", type)}
                        placeholder="Ex: 15"
                      />
                      <GridInput
                        value={row.correctValue}
                        onChange={(e) => changeRow(row.id, "correctValue", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("correctValue", type)}
                        placeholder="R$ Correto"
                        className="bg-[#eef6ff]/30 border-[#c3ddf8]"
                      />
                      <GridInput
                        value={row.correctService}
                        onChange={(e) => changeRow(row.id, "correctService", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("correctService", type)}
                        placeholder="R$ Serv. Cor."
                        className="bg-[#eef6ff]/30 border-[#c3ddf8]"
                      />
                      <GridInput
                        value={row.chargedValue}
                        onChange={(e) => changeRow(row.id, "chargedValue", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedValue", type)}
                        placeholder="R$ Cobrado"
                        className="bg-red-50/50 border-red-200"
                      />
                      <GridInput
                        value={row.chargedService}
                        onChange={(e) => changeRow(row.id, "chargedService", e.target.value, type)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedService", type)}
                        placeholder="R$ Serv. Cob."
                        className="bg-red-50/50 border-red-200"
                      />
                      <button
                        onClick={() => removeRow(row.id, type)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors justify-self-center opacity-50 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {dateError && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-500 px-1">
                        <AlertCircle size={10} /> Formato inválido. Use MM/AAAA.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {rows.length === 0 && (
              <div className="py-8 text-center text-gray-300 text-sm">
                Utilize o gerador de período acima ou clique abaixo para adicionar manualmente.
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => addRow(type)}
                className="text-xs text-[#1a5fa8] hover:text-[#154d8a] font-medium transition-colors"
              >
                Adicionar mês avulso manualmente
              </button>
            </div>

            <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4a7fa5]">
                Preencha a <strong>1ª linha</strong> e os valores se repetirão nas linhas vazias abaixo - <strong>você pode editar</strong> qualquer uma <strong>individualmente</strong>, se necessário.
              </p>
            </div>
          </div>
        </div>
      </SectionBlock>
    );
  };

  // ─── Renderização dos Resultados ─────────────────────────────────────────────

  const renderResultSection = (title: string, results: typeof waterResults, isSewage: boolean) => {
    const qtdMeses = results.calcRows.length;
    const textoMeses = qtdMeses === 1 ? "1 mês" : `${qtdMeses} meses`;

    if (qtdMeses === 0) return null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-[#f8fafe]">
          {isSewage ? <Droplets size={16} className="text-amber-700" /> : <Droplets size={16} className="text-[#1a5fa8]" />}
          <h3 className="text-sm font-bold text-[#0b1e35]">{title}</h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Mês</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cons. (m³)</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] border-l border-white rounded-tl-md">Valor Correto</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff]">Serviço Correto</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] border-r border-white rounded-tr-md">Total Correto</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 rounded-tl-md">Valor Errado</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50">Serviço Errado</th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-bold text-red-500 uppercase tracking-wider bg-red-50 rounded-tr-md">Total Errado</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Diferença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.calcRows.map((c) => {
                  const positive = c.diff >= 0;
                  return (
                    <tr key={c.row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-[#0b1e35] whitespace-nowrap">
                        {labelMonth(c.row.monthYear)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-700">
                        {c.row.irregularConsumption || "0"} m³
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[#1a5fa8] bg-[#eef6ff]/40">
                        {c.row.correctValue ? `R$ ${c.row.correctValue}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[#1a5fa8] bg-[#eef6ff]/40">
                        {c.row.correctService ? `R$ ${c.row.correctService}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-bold text-[#1a5fa8] bg-[#eef6ff]/40">
                        {fmtBRL(c.totalCorrect)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-red-600 bg-red-50/30">
                        {c.row.chargedValue ? `R$ ${c.row.chargedValue}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-red-600 bg-red-50/30">
                        {c.row.chargedService ? `R$ ${c.row.chargedService}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-bold text-red-600 bg-red-50/30">
                        {fmtBRL(c.totalCharged)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                        {fmtBRL(c.diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">TOTAIS</td>
                  <td className="px-3 py-3 text-right tabular-nums text-xs font-bold text-gray-700">{results.totalM3} m³</td>
                  <td colSpan={2} className="bg-[#eef6ff]/60"></td>
                  <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-[#1a5fa8] bg-[#eef6ff]/60 rounded-b-md">{fmtBRL(results.grandCorrect)}</td>
                  <td colSpan={2} className="bg-red-50/40"></td>
                  <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-red-600 bg-red-50/40 rounded-b-md">{fmtBRL(results.grandCharged)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums text-sm font-bold ${results.grandDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {fmtBRL(results.grandDiff)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total de m³" 
              value={results.totalM3} 
              subtitle="metros cúbicos irregulares" 
              icon={Droplets} 
              theme="default" 
            />
            <KpiCard 
              title="Valor Correto" 
              value={fmtBRL(results.grandCorrect)} 
              subtitle="soma dos valores corretos" 
              icon={Calculator} 
              theme="blue" 
            />
            <KpiCard 
              title="Cobrado" 
              value={fmtBRL(results.grandCharged)} 
              subtitle="soma dos valores errados" 
              icon={AlertCircle} 
              theme="red" 
            />
            <KpiCard 
              title="Diferença a Lançar" 
              value={fmtBRL(Math.abs(results.grandDiff))} 
              subtitle={results.grandDiff >= 0 ? "a cobrar do cliente" : "cobrado a mais do cliente"} 
              icon={ClipboardList} 
              theme={results.grandDiff >= 0 ? "emerald" : "red"} 
            />
          </div>

          <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
            <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#4a7fa5]">
              <strong>Resumo:</strong> Nos {textoMeses} de irregularidade apurados,
              o valor correto total seria de <strong>{fmtBRL(results.grandCorrect)}</strong>,
              porém foi cobrado apenas <strong>{fmtBRL(results.grandCharged)}</strong>.
              A diferença de <strong>{fmtBRL(Math.abs(results.grandDiff))}</strong> representa o ajuste financeiro a ser lançado referente ao consumo irregular de <strong>{results.totalM3} m³</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Cálculo de Diferenças de Faturamento</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Apuração do valor correto vs. cobrado
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-10">
          
          {/* =========================================
              BLOCO DA ÁGUA
          ========================================= */}
          <div className="space-y-6">
            {renderEntryTable(1, "Lançamento de Água", "Insira os valores corretos (calculados externamente) e os valores cobrados.", "water")}
            {renderResultSection("Apuração Detalhada - Água", waterResults, false)}
          </div>

          <hr className="border-gray-200" />

          {/* =========================================
              BLOCO DO ESGOTO
          ========================================= */}
          <div className="space-y-6">
            {renderEntryTable(2, "Lançamento de Esgoto", "Insira os valores corretos e cobrados especificamente para o esgoto.", "sewage")}
            {renderResultSection("Apuração Detalhada - Esgoto", sewageResults, true)}
          </div>

          <hr className="border-gray-200" />

          {/* =========================================
              BLOCO DE TEXTOS (LAUDO)
          ========================================= */}
          <SectionBlock
            number={3}
            title="Emissão de Laudos de Apuração"
            description="Insira os dados complementares para gerar o texto final copiável"
          >
            <div className="space-y-6">
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={14} className="text-[#1a5fa8]"/> Dados Complementares do Laudo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Número do AI
                    </label>
                    <input
                      value={aiNumber}
                      onChange={(e) => setAiNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 14036735"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Data de Retirada (Corte)
                    </label>
                    <DatePicker
                      value={removalDate}
                      onChange={setRemovalDate}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Consumo base (m³)
                    </label>
                    <input
                      value={baseConsumption}
                      onChange={(e) => setBaseConsumption(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 49"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Mês de Referência
                    </label>
                    <MonthYearPicker
                      value={postRegRef}
                      onChange={setPostRegRef}
                      placeholder="MM/AAAA"
                      size="md"
                    />
                  </div>
                </div>

                <div className="mt-4 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-3 py-2 flex items-start gap-2">
                  <Info size={12} className="text-[#1a5fa8] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-[#4a7fa5]">
                    Os valores de <strong>período</strong>, <strong>valor correto</strong>, <strong>valor cobrado</strong>,
                    <strong> diferença</strong> e <strong>volume total recuperado</strong> são preenchidos automaticamente a partir dos cálculos das tabelas acima.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Laudo da Água */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Laudo de Água</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateText("water")}
                        disabled={waterRows.length === 0}
                        className="flex items-center gap-1 px-3 py-1.5 border border-transparent bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-all shadow-sm"
                      >
                        <RefreshCw size={12} /> Gerar
                      </button>
                      <button
                        onClick={() => handleCopy(waterReportText, setCopiedWater)}
                        disabled={!waterReportText}
                        className="flex items-center gap-1 px-3 py-1.5 border border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-md text-xs font-bold transition-all"
                      >
                        {copiedWater ? (
                          <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                        ) : (
                          <><Copy size={12} /> Copiar</>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={waterReportText}
                    onChange={(e) => setWaterReportText(e.target.value)}
                    placeholder={
                      waterRows.length === 0
                        ? "Adicione meses na tabela de Água e clique em [Gerar]..."
                        : "O texto da Água aparecerá aqui."
                    }
                    rows={12}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono shadow-inner"
                    spellCheck={false}
                  />
                </div>

                {/* Laudo do Esgoto */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Laudo de Esgoto</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateText("sewage")}
                        disabled={sewageRows.length === 0}
                        className="flex items-center gap-1 px-3 py-1.5 border border-transparent bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-all shadow-sm"
                      >
                        <RefreshCw size={12} /> Gerar
                      </button>
                      <button
                        onClick={() => handleCopy(sewageReportText, setCopiedSewage)}
                        disabled={!sewageReportText}
                        className="flex items-center gap-1 px-3 py-1.5 border border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-md text-xs font-bold transition-all"
                      >
                        {copiedSewage ? (
                          <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                        ) : (
                          <><Copy size={12} /> Copiar</>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={sewageReportText}
                    onChange={(e) => setSewageReportText(e.target.value)}
                    placeholder={
                      sewageRows.length === 0
                        ? "Adicione meses na tabela de Esgoto e clique em [Gerar]..."
                        : "O texto do Esgoto aparecerá aqui."
                    }
                    rows={12}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1.5">
                <Info size={11} />
                Dica: Você pode clicar dentro de qualquer um dos textos gerados para ajustá-los manualmente antes de copiar.
              </p>
            </div>
          </SectionBlock>

        </div>
      </div>
    </div>
  );
}