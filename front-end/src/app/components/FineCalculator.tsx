import { useState, useEffect } from "react";
import {
  Settings2, ChevronDown, ChevronUp, Plus, Trash2,
  Calculator, ClipboardList, Info, AlertCircle, Droplets, Wrench,
  FileText, Copy, CheckCircle2, RefreshCw
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RateEntry = { id: number; startMonth: string; endMonth: string; value: string };
type IrregularRow = {
  id: number;
  monthYear: string;
  consumption: string;
  chargedWater: string;
  chargedService: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let uid = 1;
const newId = () => uid++;

function parseBRL(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMonthYear(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

function monthInRange(target: Date, start: string, end: string): boolean {
  const s = parseMonthYear(start);
  const e = parseMonthYear(end);
  if (!s) return false;
  if (e) return target >= s && target <= e;
  return target >= s;
}

function labelMonth(mmyyyy: string): string {
  const d = parseMonthYear(mmyyyy);
  if (!d) return mmyyyy;
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
}

function maskMonthYear(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

function maskBRL(raw: string): string {
  return raw.replace(/[^0-9,]/g, "");
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

function sortedValidMonths(rows: IrregularRow[]): Date[] {
  return rows
    .map((r) => parseMonthYear(r.monthYear))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RateTable({
  title, icon, color, rows, onAdd, onRemove, onChange, placeholder,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  rows: RateEntry[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onChange: (id: number, field: keyof RateEntry, val: string) => void;
  placeholder: string;
}) {
  return (
    // corpo 
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`${color}`}>{icon}</span>
        <h3 className="text-sm font-semibold text-[#0b1e35]">{title}</h3>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                value={row.startMonth}
                onChange={(e) => onChange(row.id, "startMonth", maskMonthYear(e.target.value))}
                placeholder="Início MM/AAAA"
                maxLength={7}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <input
                value={row.endMonth}
                onChange={(e) => onChange(row.id, "endMonth", maskMonthYear(e.target.value))}
                placeholder="Fim MM/AAAA"
                maxLength={7}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <input
                value={row.value}
                onChange={(e) => onChange(row.id, "value", maskBRL(e.target.value))}
                placeholder={placeholder}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
              />
            </div>
            <button
              onClick={() => onRemove(row.id)}
              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs text-[#1a5fa8] hover:text-[#154d8a] font-medium transition-colors mt-1"
        >
          <Plus size={12} /> Adicionar período
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FineCalculator() {
  const [configOpen, setConfigOpen] = useState(false);
  const [serviceRates, setServiceRates] = useState<RateEntry[]>([
    { id: newId(), startMonth: "01/2025", endMonth: "12/2025", value: "31,96" },
  ]);
  const [m3Rates, setM3Rates] = useState<RateEntry[]>([
    { id: newId(), startMonth: "01/2025", endMonth: "12/2025", value: "5,22" },
  ]);
  const [rows, setRows] = useState<IrregularRow[]>([
    { id: newId(), monthYear: "01/2025", consumption: "20", chargedWater: "13,60", chargedService: "31,96" },
  ]);

  // Bloco 5 — campos complementares do texto
  const [aiNumber, setAiNumber] = useState("");
  const [removalDate, setRemovalDate] = useState("");
  const [postRegM3, setPostRegM3] = useState("");
  const [postRegRef, setPostRegRef] = useState("");
  const [billedM3, setBilledM3] = useState("");
  const [reportText, setReportText] = useState("");
  const [copied, setCopied] = useState(false);

  // ─── Rate table handlers ──────────────────────────────────────────────────

  function addServiceRate() {
    setServiceRates((p) => [...p, { id: newId(), startMonth: "", endMonth: "", value: "" }]);
  }
  function removeServiceRate(id: number) {
    setServiceRates((p) => p.filter((r) => r.id !== id));
  }
  function changeServiceRate(id: number, field: keyof RateEntry, val: string) {
    setServiceRates((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }

  function addM3Rate() {
    setM3Rates((p) => [...p, { id: newId(), startMonth: "", endMonth: "", value: "" }]);
  }
  function removeM3Rate(id: number) {
    setM3Rates((p) => p.filter((r) => r.id !== id));
  }
  function changeM3Rate(id: number, field: keyof RateEntry, val: string) {
    setM3Rates((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }

  // ─── Irregular rows handlers ──────────────────────────────────────────────

  function addRow() {
    setRows((p) => [...p, { id: newId(), monthYear: "", consumption: "", chargedWater: "", chargedService: "" }]);
  }
  function removeRow(id: number) {
    setRows((p) => p.filter((r) => r.id !== id));
  }
  function changeRow(id: number, field: keyof IrregularRow, val: string) {
    setRows((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        if (field === "monthYear") return { ...r, monthYear: maskMonthYear(val) };
        if (field === "consumption") return { ...r, consumption: val.replace(/[^0-9,]/g, "") };
        if (field === "chargedWater") return { ...r, chargedWater: maskBRL(val) };
        if (field === "chargedService") return { ...r, chargedService: maskBRL(val) };
        return r;
      })
    );
  }

// ─── Integração com Back-end (API Python) ─────────────────────────────────
  const [apiData, setApiData] = useState<any>(null);

  // Debounce: Chama a API silenciosamente 600ms após o usuário parar de digitar
  useEffect(() => {
    const delay = setTimeout(() => fetchCalculations(), 600);
    return () => clearTimeout(delay);
  }, [serviceRates, m3Rates, rows, aiNumber, removalDate, postRegM3, postRegRef, billedM3]);

  async function fetchCalculations() {
    try {
      const response = await fetch("http://localhost:8001/api/calcular_multa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceRates, m3Rates, rows, aiNumber, removalDate, postRegM3, postRegRef, billedM3 })
      });
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error("Erro na API:", error);
    }
  }

  // ─── Ponte Segura (Mata o erro de 'undefined' pela raiz) ──────────────────
  // Mapeamos a partir do "rows" local para garantir que calcRows[idx] SEMPRE exista
  const calcRows = rows.map((row) => {
    const apiCalc = apiData?.rows?.find((r: any) => r.id === row.id);
    
    if (apiCalc) {
      return { ...apiCalc, row: row }; // Junta os dados calculados com o identificador local
    }
    
    // Formato de segurança que mantém a tela em pé enquanto a API pensa
    return {
      row: row,
      hasError: false,
      consumption: 0,
      correctWater: null,
      correctService: null,
      totalCorrect: null,
      chargedWater: 0,
      chargedService: 0,
      totalCharged: 0,
      diff: null,
      m3Rate: null
    };
  });

  const validRows = calcRows.filter((r: any) => !r.hasError && r.totalCorrect !== null);

  const totalM3 = apiData?.totals?.totalM3 || 0;
  const grandCorrect = apiData?.totals?.grandCorrect || 0;
  const grandCharged = apiData?.totals?.grandCharged || 0;
  const grandDiff = apiData?.totals?.grandDiff || 0;

  // ─── Text generation ─────────────────────────────────────────────────────
  function handleGenerateText() {
    if (apiData?.reportText) {
      setReportText(apiData.reportText);
    }
  }


  function handleCopy() {
    if (!reportText) return;
    try {
      const el = document.createElement("textarea");
      el.value = reportText;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Top bar (COM MENU DE PARÂMETROS EMBUTIDO) */}
      <div className="relative bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-50">
        <div>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Cálculo de Consumo Irregular</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Apuração do valor correto vs. cobrado antes da regularização — base para notificação e lançamento
          </p>
        </div>

        {/* Botão que abre as Configurações */}
        <button
          onClick={() => setConfigOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
            configOpen 
              ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]" 
              : "bg-white border-gray-200 text-gray-600 hover:border-[#1a5fa8] hover:text-[#1a5fa8]"
          }`}
        >
          <Settings2 size={16} />
          Parametrização de Preços
          {configOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Painel Suspenso (Dropdown) de Configurações */}
        {configOpen && (
          <div className="absolute top-full right-8 mt-3 w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-2xl p-8 cursor-default origin-top-right">
            <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-base">Parâmetros Ativos do Sistema</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Edite os valores de referência. O sistema usará esses dados para calcular os meses irregulares.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Tabela A — Serviço */}
              <div>
                <RateTable
                  title="Valor do Serviço (R$/mês)"
                  icon={<Wrench size={14} />}
                  color="text-[#1a5fa8]"
                  rows={serviceRates}
                  onAdd={addServiceRate}
                  onRemove={removeServiceRate}
                  onChange={changeServiceRate}
                  placeholder="Ex: 31,96"
                />
              </div>

              {/* Tabela B — m³ */}
              <div>
                <RateTable
                  title="Valor do Metro Cúbico (R$/m³)"
                  icon={<Droplets size={14} />}
                  color="text-[#1a5fa8]"
                  rows={m3Rates}
                  onAdd={addM3Rate}
                  onRemove={removeM3Rate}
                  onChange={changeM3Rate}
                  placeholder="Ex: 5,22"
                />
              </div>
            </div>

            {/* Legenda colunas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Início</span>
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Fim</span>
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Valor (R$)</span>
                  <span className="w-5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* A rolagem ocupa 100% da tela e cola na direita */}
      <div className="flex-1 overflow-auto">
        {/* O conteúdo fica centralizado e mais largo (1400px) com mais espaço entre os blocos (space-y-8) */}
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 w-full">

        {/* ── Bloco 2: Lançamento ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plus size={18} className="text-[#1a5fa8]" />
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Lançamento dos Meses Irregulares</h2>
                <p className="text-gray-400 text-xs mt-0.5">Insira os dados de cada mês com consumo irregular</p>
              </div>
            </div>
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-lg text-xs font-medium transition-all shadow"
            >
              <Plus size={12} /> Adicionar mês
            </button>
          </div>

          <div className="p-4">
            {/* Header */}
            <div className="grid grid-cols-[140px_1fr_1fr_1fr_40px] gap-4 mb-2 px-1">
              {["Mês/Ano", "Consumo Regular (m³)", "Água Cobrada Errada (R$)", "Serviço Cobrado Errado (R$)", ""].map((h, i) => (
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
                    <div className="grid grid-cols-[140px_1fr_1fr_1fr_40px] gap-4 items-center">
                      <div>
                        <input
                          value={row.monthYear}
                          onChange={(e) => changeRow(row.id, "monthYear", e.target.value)}
                          placeholder="MM/AAAA"
                          maxLength={7}
                          className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 transition-all ${
                            dateError
                              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                              : "border-gray-200 focus:border-[#1a5fa8] focus:ring-[#1a5fa8]/20"
                          }`}
                        />
                      </div>
                      <div>
                        <input
                          value={row.consumption}
                          onChange={(e) => changeRow(row.id, "consumption", e.target.value)}
                          placeholder="Ex: 20"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                      </div>
                      <div>
                        <input
                          value={row.chargedWater}
                          onChange={(e) => changeRow(row.id, "chargedWater", e.target.value)}
                          placeholder="Ex: 13,60"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                      </div>
                      <div>
                        <input
                          value={row.chargedService}
                          onChange={(e) => changeRow(row.id, "chargedService", e.target.value)}
                          placeholder="Ex: 31,96"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors justify-self-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {noRate && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 px-1">
                        <AlertCircle size={10} />
                        Nenhum preço cadastrado para este período.
                      </div>
                    )}
                    {dateError && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-500 px-1">
                        <AlertCircle size={10} />
                        Formato inválido. Use MM/AAAA (ex: 01/2025).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {rows.length === 0 && (
              <div className="py-8 text-center text-gray-300 text-sm">
                Nenhum mês adicionado. Clique em "Adicionar mês" para começar.
              </div>
            )}
          </div>
        </div>

        {/* ── Bloco 3: Tabela de Resultados ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <Calculator size={18} className="text-[#1a5fa8]" />
            <div>
              <h2 className="text-[#0b1e35] font-semibold text-sm">Resultado Detalhado por Mês</h2>
              <p className="text-gray-400 text-xs mt-0.5">Gerado automaticamente pelo motor de cálculo</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                  <tr className="bg-[#f8fafe] border border-gray-100 rounded-t-lg">
                    <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Mês<br/>Irregular</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Consumo<br/>(m³)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight">Valor Água<br/>(Correto)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight">Serviço<br/>(Correto)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight">Total<br/>Correto</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Água Cobrada<br/>(Errado)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Serv. Cobrado<br/>(Errado)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Total<br/>Errado</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider leading-tight">Diferença</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-50">
                {calcRows.map((c) => {
                  if (c.hasError) {
                    return (
                      <tr key={c.row.id} className="bg-amber-50/40">
                        <td className="px-3 py-3 text-gray-500 text-xs italic">
                          {c.row.monthYear || "—"}
                        </td>
                        <td colSpan={8} className="px-3 py-3 text-xs text-amber-600 italic">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle size={11} />
                            Aguardando dados completos ou período não encontrado na Parametrização de Preços.
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  const positive = (c.diff ?? 0) >= 0;
                  return (
                    <tr key={c.row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-[#0b1e35] whitespace-nowrap">
                        {labelMonth(c.row.monthYear)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                        {c.consumption} m³
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-[#1a5fa8] font-medium bg-[#eef6ff]/40">
                        {c.correctWater !== null ? fmtBRL(c.correctWater) : "—"}
                        {c.m3Rate !== null && (
                          <div className="text-[10px] text-gray-400 font-normal">{c.consumption}m³ × {fmtBRL(c.m3Rate)}</div>
                        )}
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
                      <td className={`px-3 py-3 text-right tabular-nums font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                        {c.diff !== null ? fmtBRL(c.diff) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-gray-300 text-sm">
                      Nenhum dado para exibir.
                    </td>
                  </tr>
                )}
              </tbody>
              {validRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-[#f8fafe]">
                    <td className="px-3 py-3 text-xs font-bold text-gray-600 uppercase">TOTAIS</td>
                    <td className="px-3 py-3 text-right tabular-nums text-xs font-bold text-gray-700">{totalM3} m³</td>
                    <td colSpan={2} className="bg-[#eef6ff]/60"></td>
                    <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-[#1a5fa8] bg-[#eef6ff]/60">{fmtBRL(grandCorrect)}</td>
                    <td colSpan={2} className="bg-red-50/40"></td>
                    <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-red-600 bg-red-50/40">{fmtBRL(grandCharged)}</td>
                    <td className={`px-3 py-3 text-right tabular-nums text-sm font-bold ${grandDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {fmtBRL(grandDiff)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── Bloco 4: Painel de KPIs ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <ClipboardList size={18} className="text-[#1a5fa8]" />
            <div>
              <h2 className="text-[#0b1e35] font-semibold text-sm">Painel de Resumo (Correspondente aos Meses de Irregularidade)</h2>
              <p className="text-gray-400 text-xs mt-0.5">Base para lançamento financeiro ou notificação extrajudicial</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total m³ */}
              <div className="rounded-xl border border-gray-100 bg-[#f8fafe] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={14} className="text-[#1a5fa8]" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total de m³</p>
                </div>
                <p className="text-2xl font-bold text-[#0b1e35] tabular-nums">{totalM3}</p>
                <p className="text-[10px] text-gray-400 mt-1">metros cúbicos irregulares</p>
              </div>

              {/* Valor correto */}
              <div className="rounded-xl border border-[#c3ddf8] bg-[#eef6ff] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator size={14} className="text-[#1a5fa8]" />
                  <p className="text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider">Valor Correto</p>
                </div>
                <p className="text-2xl font-bold text-[#1a5fa8] tabular-nums">{fmtBRL(grandCorrect)}</p>
                <p className="text-[10px] text-[#4a7fa5] mt-1">o que deveria ser cobrado</p>
              </div>

              {/* Valor cobrado errado */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Cobrado (Errado)</p>
                </div>
                <p className="text-2xl font-bold text-red-600 tabular-nums">{fmtBRL(grandCharged)}</p>
                <p className="text-[10px] text-red-400 mt-1">antes da regularização</p>
              </div>

              {/* Diferença */}
              <div className={`rounded-xl border p-4 ${grandDiff >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={14} className={grandDiff >= 0 ? "text-emerald-600" : "text-red-500"} />
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${grandDiff >= 0 ? "text-emerald-700" : "text-red-500"}`}>
                    Diferença a Lançar
                  </p>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${grandDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {fmtBRL(Math.abs(grandDiff))}
                </p>
                <p className={`text-[10px] mt-1 ${grandDiff >= 0 ? "text-emerald-600" : "text-red-400"}`}>
                  {grandDiff >= 0 ? "a cobrar do cliente" : "cobrado a mais do cliente"}
                </p>
              </div>
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
          </div>
        </div>

        {/* ── Bloco 5: Texto de Apuração ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <FileText size={18} className="text-[#1a5fa8]" />
            <div>
              <h2 className="text-[#0b1e35] font-semibold text-sm">Texto de Apuração</h2>
              <p className="text-gray-400 text-xs mt-0.5">Gerado com base nos cálculos — editável e copiável</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Campos complementares */}
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
                  <input
                    value={removalDate}
                    onChange={(e) => setRemovalDate(maskDate(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Maior Consumo Pós-Regularização (m³)
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
                    Mês de Referência Pós-Reg. (MM/AAAA)
                  </label>
                  <input
                    value={postRegRef}
                    onChange={(e) => setPostRegRef(maskMonthYear(e.target.value))}
                    placeholder="Ex: 03/2026"
                    maxLength={7}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Volume Faturado no Mês Impactado (m³)
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

            {/* Botão gerar */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerateText}
                disabled={validRows.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow"
              >
                <RefreshCw size={14} />
                Gerar / Atualizar Texto
              </button>
            </div>

            {/* Textarea editável */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600">Revisão e Edição do Texto</label>
                <button
                  onClick={handleCopy}
                  disabled={!reportText}
                  className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copiar para Área de Transferência
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder={
                  validRows.length === 0
                    ? "Adicione os meses irregulares e clique em [Gerar / Atualizar Texto]..."
                    : "Preencha os dados complementares acima e clique em [Gerar / Atualizar Texto]."
                }
                rows={10}
                className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                spellCheck={false}
              />
              <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1.5">
                <Info size={11} />
                Clique dentro do texto para editar manualmente antes de copiar.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}