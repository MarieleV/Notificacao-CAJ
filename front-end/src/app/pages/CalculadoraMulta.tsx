import { useState, useEffect, useRef, ElementType } from "react";
import {
  ChevronDown, ChevronUp, Plus, Trash2,
  Calculator, ClipboardList, Info, AlertCircle, Droplets,
  FileText, Copy, CheckCircle2, RefreshCw, Lock, Search
} from "lucide-react";

import { parseMonthYear, labelMonth } from "../lib/dates";
import { maskMonthYear, maskBRL, fmtBRL } from "../lib/masks";
import { DatePicker } from "../components/shared/DatePicker";
import { MonthYearPicker } from "../components/shared/MonthYearPicker";
import { MonthYearRangePicker } from "../components/shared/MonthYearRangePicker";
import { SectionBlock } from "../components/shared/SectionBlock";

// Importando os dados estáticos separados
import { 
  VIGENCIAS_AGUA, 
  VIGENCIAS_K1, 
  TARIFF_DATA, 
  K1_DATA 
} from "../lib/tarifas";

// ─── Tipagens (TypeScript) ───────────────────────────────────────────────────

export interface IrregularRow {
  id: number;
  monthYear: string;
  consumption: string;
  irregularConsumption: string;
  chargedWater: string;
  chargedService: string;
  chargedSewage: string;         
}

interface ApiDataResponse {
  totals: {
    totalM3: number;
    grandCorrect: number;
    grandCharged: number;
    grandDiff: number;
  };
  rows: Array<{
    id: number;
    hasError: boolean;
    correctWater: number | null;
    correctService: number | null;
    totalCorrect: number | null;
    chargedWater: number;
    chargedService: number;
    totalCharged: number;
    diff: number | null;
  }>;
  waterReportText: string;
  sewageReportText: string;
}

// ─── Subcomponentes (DRY - Don't Repeat Yourself) ────────────────────────────

const GridInput = ({ hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input
    {...props}
    className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 transition-all h-[34px] ${
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
  // Agora usamos as strings completas, mantendo as exatas cores originais do seu design
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
  const [configOpen, setConfigOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setConfigOpen(false);
      }
    }
    if (configOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [configOpen]);

  // Estados de Configuração
  const [selectedVigenciaAgua, setSelectedVigenciaAgua] = useState(VIGENCIAS_AGUA[0]);
  const [selectedTariff, setSelectedTariff] = useState("Residencial");
  const [selectedVigenciaK1, setSelectedVigenciaK1] = useState(VIGENCIAS_K1[0]);
  const [selectedK1Category, setSelectedK1Category] = useState("Residencial");
  const [selectedK1Activity, setSelectedK1Activity] = useState("Casa");

  // Estado das Linhas e Período
  const [rows, setRows] = useState<IrregularRow[]>([]);
  const [periodRange, setPeriodRange] = useState("");

  // Campos complementares do texto
  const [aiNumber, setAiNumber] = useState("");
  const [removalDate, setRemovalDate] = useState("");
  const [postRegM3, setPostRegM3] = useState("");
  const [postRegRef, setPostRegRef] = useState("");
  const [billedM3, setBilledM3] = useState("");
  
  const [waterReportText, setWaterReportText] = useState("");
  const [sewageReportText, setSewageReportText] = useState("");
  const [copiedWater, setCopiedWater] = useState(false);
  const [copiedSewage, setCopiedSewage] = useState(false);

  const [apiData, setApiData] = useState<ApiDataResponse | null>(null);

  // Derivando os parâmetros
  const currentTariffData = TARIFF_DATA[selectedVigenciaAgua]?.[selectedTariff] || { serviceRate: "0,00", tiers: [] };
  const currentK1Data = K1_DATA.find(i => i.activity === selectedK1Activity && i.category === selectedK1Category);
  const k1Factor = currentK1Data ? currentK1Data.k1 : "1,00";

  function handleTariffChange(tariffName: string) {
    setSelectedTariff(tariffName);
    
    let k1Cat = "Residencial";
    if (tariffName.includes("Comercial")) k1Cat = "Comercial";
    else if (tariffName.includes("Industrial")) k1Cat = "Industrial";
    else if (tariffName.includes("Pública")) k1Cat = "Público";

    setSelectedK1Category(k1Cat);
    const firstActivity = K1_DATA.find(item => item.category === k1Cat);
    if (firstActivity) {
      setSelectedK1Activity(firstActivity.activity);
    }
  }

  function handleK1ActivityChange(activity: string) {
    setSelectedK1Activity(activity);
  }

  function addRow() {
    setRows((p) => [...p, { 
      id: newId(), monthYear: "", consumption: "",
      irregularConsumption: "",
      chargedWater: "", chargedService: "",
      chargedSewage: ""
    }]);
  }

  function handleGeneratePeriod(rangeVal: string) {
    if (!rangeVal) return;
    const parts = rangeVal.split(" a ");
    const start = parseMonthYear(parts[0]);
    const end = parts.length > 1 ? parseMonthYear(parts[1]) : start;

    if (!start || !end || start > end) return;

    const generatedRows: IrregularRow[] = [];
    let current = new Date(start);

    while (current <= end) {
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const yyyy = current.getFullYear();
      
      generatedRows.push({
        id: newId(),
        monthYear: `${mm}/${yyyy}`,
        consumption: "",
        irregularConsumption: "",
        chargedWater: "",
        chargedService: "",
        chargedSewage: ""
      });
      current.setMonth(current.getMonth() + 1);
    }

    setRows((prev) => {
      const existingMonths = prev.map(r => r.monthYear);
      const filteredRows = generatedRows.filter(r => !existingMonths.includes(r.monthYear));
      return [...prev, ...filteredRows];
    });
  }

  function removeRow(id: number) {
    setRows((p) => p.filter((r) => r.id !== id));
  }

  const AUTOFILL_FIELDS: (keyof IrregularRow)[] = [
    "consumption", "irregularConsumption", "chargedWater", "chargedService", "chargedSewage"
  ];

  function changeRow(id: number, field: keyof IrregularRow, val: string) {
    setRows((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        if (field === "monthYear") return { ...r, monthYear: maskMonthYear(val) };
        if (field === "consumption") return { ...r, consumption: val.replace(/[^0-9,]/g, "") };
        if (field === "irregularConsumption") return { ...r, irregularConsumption: val.replace(/[^0-9,]/g, "") };
        if (["chargedWater", "chargedService", "chargedSewage"].includes(field)) {
          return { ...r, [field]: maskBRL(val) };
        }
        return r;
      })
    );
  }

  function cascadeFillFromFirstRow(field: keyof IrregularRow) {
    if (!AUTOFILL_FIELDS.includes(field)) return;
    setRows((p) => {
      if (p.length === 0) return p;
      const value = (p[0] as any)[field] as string;
      if (!value) return p;
      return p.map((r, i) => {
        if (i === 0) return r;
        if ((r as any)[field] === "") {
          return { ...r, [field]: value };
        }
        return r;
      });
    });
  }

  useEffect(() => {
    const delay = setTimeout(() => fetchCalculations(), 600);
    return () => clearTimeout(delay);
  }, [selectedVigenciaAgua, selectedTariff, rows, k1Factor, aiNumber, removalDate, postRegM3, postRegRef, billedM3]);

  async function fetchCalculations() {
    try {
      const formattedSewageRows = rows.map(r => ({
        id: r.id,
        monthYear: r.monthYear,
        chargedSewage: r.chargedSewage,
        chargedService: "0" 
      }));

      const payloadServiceRates = [
        { id: 1, startMonth: "01/1900", endMonth: "12/2099", value: currentTariffData.serviceRate }
      ];

      const response = await fetch("https://notificacao-caj.vercel.app/api/calcular_multa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serviceRates: payloadServiceRates, 
          m3Tiers: currentTariffData.tiers, 
          rows, 
          sewageRows: formattedSewageRows, 
          k1Factor, aiNumber, removalDate, postRegM3, postRegRef, billedM3 
        })
      });
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error("Erro na API:", error);
    }
  }

  const calcRows = rows.map((row) => {
    const apiCalc = apiData?.rows?.find((r: any) => r.id === row.id);
    if (apiCalc) return { ...apiCalc, row, consumption: row.consumption || "0" };
    
    return {
      row, hasError: false, consumption: row.consumption || "0", correctWater: null, correctService: null,
      totalCorrect: null, chargedWater: 0, chargedService: 0, totalCharged: 0, diff: null
    };
  });

  const validRows = calcRows.filter((r: any) => !r.hasError && r.totalCorrect !== null);
  const totalM3 = apiData?.totals?.totalM3 || 0;
  const grandCorrect = apiData?.totals?.grandCorrect || 0;
  const grandCharged = apiData?.totals?.grandCharged || 0;
  const grandDiff = apiData?.totals?.grandDiff || 0;

  function handleGenerateText() {
    if (apiData?.waterReportText) setWaterReportText(apiData.waterReportText);
    if (apiData?.sewageReportText) {
      setSewageReportText(apiData.sewageReportText);
    } else {
      setSewageReportText(""); 
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

  return (
    <div className="h-full flex flex-col">
      {/* ── BARRA SUPERIOR RESTAURADA ── */}
      <div className="relative bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-50">
        <div>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Cálculo de Consumo Irregular</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Apuração do valor correto vs. cobrado antes da regularização
          </p>
        </div>
        
        <div ref={panelRef} className="relative">
          <button
            onClick={() => setConfigOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              configOpen 
                ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]"
                : "bg-white border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] shadow-sm"
            }`}
          >
            <Search size={15} className="mr-1" />
            Parâmetros de Cálculo
            {configOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {configOpen && (
            <div className="absolute top-full right-0 mt-3 w-full sm:min-w-[550px] max-w-xl bg-white border border-gray-200 rounded-xl shadow-2xl cursor-default origin-top-right z-50 flex flex-col max-h-[80vh]">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-[#0b1e35] font-bold text-base flex items-center gap-2">
                    <Lock size={16} className="text-[#1a5fa8]" /> Parâmetros Oficiais de Cálculo
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Selecione a vigência e a categoria aplicável.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">
                <div className="bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                  <div className="flex items-center gap-2 border-b border-[#c3ddf8] pb-2 mb-3">
                    <Droplets size={15} className="text-[#1a5fa8]" />
                    <h3 className="text-xs font-bold text-[#1a5fa8] uppercase tracking-wider">1. Tarifas de Água</h3>
                  </div>
                  
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vigência (ARIS)</label>
                      <select
                        value={selectedVigenciaAgua}
                        onChange={(e) => setSelectedVigenciaAgua(e.target.value)}
                        className="w-36 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {VIGENCIAS_AGUA.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria da Matrícula</label>
                      <select
                        value={selectedTariff}
                        onChange={(e) => handleTariffChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {Object.keys(TARIFF_DATA[VIGENCIAS_AGUA[0]]).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center bg-[#eef6ff] px-4 py-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-[#0b1e35] uppercase tracking-wider">Tarifa Fixa Mensal</span>
                      <span className="text-sm font-bold text-[#1a5fa8]">R$ {currentTariffData.serviceRate}</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {currentTariffData.tiers.map((tier) => (
                        <li key={tier.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                          <span className="text-xs font-medium text-gray-600">{tier.label}</span>
                          <span className="text-xs font-bold text-[#1a5fa8]">R$ {tier.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                  <div className="flex items-center gap-2 border-b border-[#c3ddf8] pb-2 mb-3">
                    <Info size={15} className="text-[#1a5fa8]" />
                    <h3 className="text-xs font-bold text-[#1a5fa8] uppercase tracking-wider">2. Fator de Esgoto - K1</h3>
                  </div>

                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vigência (ARIS)</label>
                      <select
                        value={selectedVigenciaK1}
                        onChange={(e) => setSelectedVigenciaK1(e.target.value)}
                        className="w-36 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {VIGENCIAS_K1.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ramo de Atividade (K1)</label>
                      <select
                        value={selectedK1Activity}
                        onChange={(e) => handleK1ActivityChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {K1_DATA.filter(item => item.category === selectedK1Category).map(item => (
                          <option key={item.activity} value={item.activity}>{item.activity}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-[#0b1e35] uppercase tracking-wider">Fator Multiplicador (K1)</span>
                    <span className="text-sm font-bold text-[#1a5fa8]">{k1Factor}</span>
                  </div>
                    <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
                    <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#4a7fa5]">
                        <strong>Fator K1</strong> - Fator de Carga Poluidora para lançamentos na rede pública de esgotos.
                      </p>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8fafe]">
        <div className="p-8 max-w-5xl mx-auto space-y-8 w-full">

          {/* ── Bloco 1: Lançamento Água ───────────────────────────────────── */}
          <SectionBlock
            icon={Plus}
            title="Lançamento dos Meses Irregulares de Água"
            description="Gere um período automático ou adicione mês a mês"
            headerAction={
              <div className="w-full max-w-[240px]">
                <MonthYearRangePicker 
                  value={periodRange} 
                  onChange={(val) => {
                    setPeriodRange(val);
                    if (val) handleGeneratePeriod(val); 
                  }} 
                  placeholder="Adicione um período..." 
                />
              </div>
            }
          >
            <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr_40px] gap-3 mb-2 px-1">
              {[
                "Mês/Ano",
                "Consumo Regular (m³)",
                "Consumo Irregular (m³)",
                "Água Cobrada Errada (R$)",
                "Serviço Cobrado Errado (R$)",
                ""
              ].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => {
                const calc = calcRows[idx];
                const dateError = row.monthYear.length === 7 && !parseMonthYear(row.monthYear);
                const noRate = row.monthYear.length === 7 && parseMonthYear(row.monthYear) && calc.hasError;

                return (
                  <div key={row.id}>
                    <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr_40px] gap-3 items-center">
                      <GridInput
                        value={row.monthYear}
                        onChange={(e) => changeRow(row.id, "monthYear", e.target.value)}
                        placeholder="MM/AAAA"
                        maxLength={7}
                        hasError={dateError}
                      />
                      <GridInput
                        value={row.consumption}
                        onChange={(e) => changeRow(row.id, "consumption", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("consumption")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 20"
                      />
                      <GridInput
                        value={row.irregularConsumption}
                        onChange={(e) => changeRow(row.id, "irregularConsumption", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("irregularConsumption")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 15"
                      />
                      <GridInput
                        value={row.chargedWater}
                        onChange={(e) => changeRow(row.id, "chargedWater", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedWater")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 13,60"
                      />
                      <GridInput
                        value={row.chargedService}
                        onChange={(e) => changeRow(row.id, "chargedService", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedService")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 31,96"
                      />
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors justify-self-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {noRate && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 px-1">
                        <AlertCircle size={10} /> Verifique a vigência selecionada nos Parâmetros.
                      </div>
                    )}
                    {dateError && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-500 px-1">
                        <AlertCircle size={10} /> Formato inválido. Use MM/AAAA (ex: 01/2026).
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

            {/* ── BOTÕES RESTAURADOS ── */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 text-xs text-[#1a5fa8] hover:text-[#154d8a] font-medium transition-colors"
              >
                <Plus size={12} /> Adicionar mês avulso manualmente
              </button>
            </div>
            <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4a7fa5]">
                Preencha a <strong>1ª linha</strong> e os valores se repetirão nas linhas vazias abaixo - <strong>você pode editar</strong> qualquer uma <strong>individualmente</strong>, se necessário.
              </p>
            </div>
          </SectionBlock>

          {/* ── Bloco 2: Lançamento Esgoto ───────────────────────────────────── */}
          <SectionBlock
            icon={Plus}
            title="Lançamento dos Meses Irregulares de Esgoto"
            description="Sincronizado automaticamente com a tabela de Água"
          >
            <div className="grid grid-cols-[140px_200px] gap-4 mb-2 px-1">
              {["Mês/Ano (Automático)", "Esgoto Cobrado Errado (R$)"].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={row.id}>
                  <div className="grid grid-cols-[140px_200px] gap-4 items-center">
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 flex items-center h-[34px]">
                      {row.monthYear || "Mês não preenchido"}
                    </div>
                    <GridInput
                      value={row.chargedSewage}
                      onChange={(e) => changeRow(row.id, "chargedSewage", e.target.value)}
                      onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedSewage")}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      placeholder="Ex: 10,88"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {rows.length === 0 && (
              <div className="py-6 text-center text-gray-300 text-sm">
                Adicione meses na tabela de Água primeiro.
              </div>
            )}

            <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4a7fa5]">
                A tarifa referente ao esgotamento sanitário corresponde à <strong>80% do valor da fatura de água</strong> multiplicado pelo <strong>Fator K1</strong>.
              </p>
            </div>
          </SectionBlock>

          {/* ── Bloco 3: Tabela de Resultados RESTAURADA ─────────────────────────────────── */}
          <SectionBlock
            icon={Calculator}
            title="Resultado Detalhado por Mês"
            description="Gerado automaticamente pelo motor de cálculo"
          >
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafe] border-y border-gray-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Mês<br/>Irregular</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Consumo<br/>(m³)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight border-l border-white">Valor Água<br/>Correto</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight">Serviço<br/>Correto</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight border-r border-white">Total<br/>Correto</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Água Cobrada<br/>Errado</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Serv. Cobrado<br/>Errado</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight border-r border-white">Total<br/>Errado</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider leading-tight">Diferença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calcRows.map((c) => {
                    if (c.hasError) {
                      return (
                        <tr key={c.row.id} className="bg-amber-50/40">
                          <td className="px-6 py-3 text-gray-500 text-xs italic">
                            {c.row.monthYear || "—"}
                          </td>
                          <td colSpan={8} className="px-6 py-3 text-xs text-amber-600 italic">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle size={11} />
                              Aguardando dados completos.
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    const positive = (c.diff ?? 0) >= 0;
                    return (
                      <tr key={c.row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-[#0b1e35] whitespace-nowrap">
                          {labelMonth(c.row.monthYear)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                          {c.consumption} m³
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[#1a5fa8] font-medium bg-[#eef6ff]/40">
                          {c.correctWater !== null ? fmtBRL(c.correctWater) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[#1a5fa8] font-medium bg-[#eef6ff]/40">
                          {c.correctService !== null ? fmtBRL(c.correctService) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-[#1a5fa8] bg-[#eef6ff]/40">
                          {c.totalCorrect !== null ? fmtBRL(c.totalCorrect) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-red-600 bg-red-50/30">
                          {fmtBRL(c.chargedWater)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-red-600 bg-red-50/30">
                          {fmtBRL(c.chargedService)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-red-600 bg-red-50/30">
                          {fmtBRL(c.totalCharged)}
                        </td>
                        <td className={`px-6 py-3 text-right tabular-nums font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                          {c.diff !== null ? fmtBRL(c.diff) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-gray-300 text-sm">
                        Nenhum dado para exibir.
                      </td>
                    </tr>
                  )}
                </tbody>
                {validRows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-[#f8fafe]">
                      <td className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">TOTAIS</td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs font-bold text-gray-700">{totalM3} m³</td>
                      <td colSpan={2} className="bg-[#eef6ff]/60"></td>
                      <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-[#1a5fa8] bg-[#eef6ff]/60">{fmtBRL(grandCorrect)}</td>
                      <td colSpan={2} className="bg-red-50/40"></td>
                      <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-red-600 bg-red-50/40">{fmtBRL(grandCharged)}</td>
                      <td className={`px-6 py-3 text-right tabular-nums text-sm font-bold ${grandDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {fmtBRL(grandDiff)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </SectionBlock>

          {/* ── Bloco 4: Painel de KPIs REFATORADO ───────────────────────────────────────── */}
          <SectionBlock
            icon={ClipboardList}
            title="Painel de Resumo"
            description="Base para lançamento financeiro ou notificação extrajudicial"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard 
                title="Total de m³" 
                value={totalM3} 
                subtitle="metros cúbicos irregulares" 
                icon={Droplets} 
                theme="default" 
              />
              <KpiCard 
                title="Valor Correto" 
                value={fmtBRL(grandCorrect)} 
                subtitle="o que deveria ser cobrado" 
                icon={Calculator} 
                theme="blue" 
              />
              <KpiCard 
                title="Cobrado" 
                value={fmtBRL(grandCharged)} 
                subtitle="antes da regularização" 
                icon={AlertCircle} 
                theme="red" 
              />
              <KpiCard 
                title="Diferença a Lançar" 
                value={fmtBRL(Math.abs(grandDiff))} 
                subtitle={grandDiff >= 0 ? "a cobrar do cliente" : "cobrado a mais do cliente"} 
                icon={ClipboardList} 
                theme={grandDiff >= 0 ? "emerald" : "red"} 
              />
            </div>

            {validRows.length > 0 && (
              <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
                <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4a7fa5]">
                  <strong>Resumo:</strong> Nos {validRows.length} meses de irregularidade apurados,
                  o valor correto total seria de <strong>{fmtBRL(grandCorrect)}</strong>,
                  porém foi cobrado apenas <strong>{fmtBRL(grandCharged)}</strong>.
                  A diferença de <strong>{fmtBRL(Math.abs(grandDiff))}</strong> representa o ajuste financeiro a ser lançado
                  referente ao consumo irregular de <strong>{totalM3} m³</strong>.
                </p>
              </div>
            )}
          </SectionBlock>

          {/* ── Bloco 5: Texto de Apuração RESTAURADO ───────────────────────────────────── */}
          <SectionBlock
            icon={FileText}
            title="Texto de Apuração"
            description="Gerado com base nos cálculos - editável e copiável"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-3">Dados complementares para o texto</p>
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
                      Data de Retirada da Irregularidade
                    </label>
                    <DatePicker
                      value={removalDate}
                      onChange={setRemovalDate}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Maior Consumo Pós-Reg. (m³)
                    </label>
                    <input
                      value={postRegM3}
                      onChange={(e) => setPostRegM3(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 49"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Mês de Ref. Pós-Reg.
                    </label>
                    <MonthYearPicker
                      value={postRegRef}
                      onChange={setPostRegRef}
                      placeholder="MM/AAAA"
                      size="md"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Vol. Faturado no Mês do Corte (m³)
                    </label>
                    <input
                      value={billedM3}
                      onChange={(e) => setBilledM3(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 20"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col justify-end">
                    <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-3 py-2 flex items-start gap-2">
                      <Info size={12} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-[#4a7fa5]">
                        Os valores de <strong>período</strong>, <strong>valor correto</strong>, <strong>valor cobrado</strong>,
                        <strong> diferença</strong> e <strong>volume total recuperado</strong> são preenchidos automaticamente
                        a partir dos cálculos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateText}
                  disabled={validRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow"
                >
                  <RefreshCw size={14} />
                  Gerar Texto
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Laudo da Água */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Água</label>
                    <button
                      onClick={() => handleCopy(waterReportText, setCopiedWater)}
                      disabled={!waterReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedWater ? (
                        <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                      ) : (
                        <><Copy size={13} /> Copiar Água</>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={waterReportText}
                    onChange={(e) => setWaterReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar Texto]..."
                        : "Texto da Água aparecerá aqui."
                    }
                    rows={10}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>

                {/* Laudo do Esgoto */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Esgoto</label>
                    <button
                      onClick={() => handleCopy(sewageReportText, setCopiedSewage)}
                      disabled={!sewageReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedSewage ? (
                        <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                      ) : (
                        <><Copy size={13} /> Copiar Esgoto</>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={sewageReportText}
                    onChange={(e) => setSewageReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar Texto]..."
                        : "Texto do Esgoto aparecerá aqui caso existam valores informados."
                    }
                    rows={10}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1.5">
                <Info size={11} />
                Clique dentro de qualquer um dos textos para editar manualmente antes de copiar.
              </p>
            </div>
          </SectionBlock>

        </div>
      </div>
    </div>
  );
}