import { useState, useEffect, useRef } from "react";
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
  chargedSewage: string;         
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
  // 1. Remove tudo que não for número (vírgulas, pontos, letras)
  const digits = raw.replace(/\D/g, "");
  
  // 2. Se o campo for apagado/vazio, retorna vazio para mostrar o placeholder
  if (!digits) return "";
  
  // 3. Transforma em número inteiro e divide por 100 (para criar os centavos)
  const val = parseInt(digits, 10) / 100;
  
  // 4. Formata nativamente para o padrão monetário brasileiro (ex: 1.234,56)
  return val.toLocaleString("pt-BR", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

// ─── Predefinições Tarifárias ────────────────────────────────────────────────

const TARIFF_STRUCTURES: Record<string, { serviceRate: string, tiers: any[] }> = {
  "Residencial": {
    serviceRate: "34,93",
    tiers: [
      { id: 1, min: 0, max: 10, label: "Até 10 m³", value: "1,49" },
      { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,89" },
      { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
      { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
      { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
    ]
  },
  "Pública": {
    serviceRate: "58,20",
    tiers: [
      { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
      { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
      { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
      { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
      { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
      { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
    ]
  },
  "Residencial Tarifa Social": {
    serviceRate: "10,48",
    tiers: [
      { id: 1, min: 0, max: 10, label: "Até 10 m³", value: "0,45" },
      { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "4,95" },
      { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
      { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
      { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
    ]
  },
  "Residencial Social Especial": {
    serviceRate: "10,48",
    tiers: [
      { id: 1, min: 0, max: 15, label: "Até 15 m³", value: "0,30" },
      { id: 2, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
      { id: 3, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
      { id: 4, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
    ]
  },
  "Comercial": {
    serviceRate: "58,20",
    tiers: [
      { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
      { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
      { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
      { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
      { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
      { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
    ]
  },
  "Comercial Entidade Beneficiente": {
    serviceRate: "29,11",
    tiers: [
      { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,00" },
      { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,03" },
      { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "6,23" },
      { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "6,36" },
      { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "6,44" },
      { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "6,50" }
    ]
  },
  "Industrial": {
    serviceRate: "58,20",
    tiers: [
      { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
      { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
      { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
      { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
      { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
      { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
    ]
  },
  "Industrial Especial": {
    serviceRate: "43,72",
    tiers: [
      { id: 1, min: 0, max: 5000, label: "Até 5.000 m³", value: "13,00" },
      { id: 2, min: 5001, max: 10000, label: "5.001 a 10.000 m³", value: "10,45" },
      { id: 3, min: 10001, max: 30000, label: "10.001 a 30.000 m³", value: "9,45" },
      { id: 4, min: 30001, max: 60000, label: "30.001 a 60.000 m³", value: "8,35" },
      { id: 5, min: 60001, max: 120000, label: "60.001 a 120.000 m³", value: "7,91" },
      { id: 6, min: 120001, max: "Infinity", label: "Acima de 120.000 m³", value: "7,10" }
    ]
  }
};

const K1_DATA = [
  // Residencial
  { category: "Residencial", activity: "Casa", k1: "1,00" },
  { category: "Residencial", activity: "Cond. Minha Casa Minha Vida", k1: "1,00" },
  { category: "Residencial", activity: "Condomínio Fechado", k1: "1,00" },
  { category: "Residencial", activity: "Consumo por Rateio", k1: "1,00" },
  { category: "Residencial", activity: "Prédio", k1: "1,00" },
  { category: "Residencial", activity: "Residencial - diversos, não especificados", k1: "1,00" },
  // Comercial
  { category: "Comercial", activity: "Comercial - diversos, não especificados", k1: "1,00" },
  { category: "Comercial", activity: "Esporte", k1: "1,00" },
  { category: "Comercial", activity: "Lojas, Mini-mercado e pequenos comércios", k1: "1,00" },
  { category: "Comercial", activity: "Salão de Beleza/Barbearia/Estética", k1: "1,00" },
  { category: "Comercial", activity: "Hotel/Motel", k1: "1,03" },
  { category: "Comercial", activity: "Petshop/Veterinária/Agropecuária", k1: "1,11" },
  { category: "Comercial", activity: "Lavandeira", k1: "1,24" },
  { category: "Comercial", activity: "Lavação/Posto de Gasolina", k1: "1,53" },
  { category: "Comercial", activity: "Shopping/Centro Comercial", k1: "1,53" },
  { category: "Comercial", activity: "Bar/Restaurante/Espaço de Eventos", k1: "1,55" },
  { category: "Comercial", activity: "Mercado e Similares (c/ açougue, padaria, etc)", k1: "1,65" },
  // Industrial
  { category: "Industrial", activity: "Industrias - contribui somente esgoto doméstico", k1: "1,00" },
  { category: "Industrial", activity: "Industrias - diversos, não especificados", k1: "1,02" },
  { category: "Industrial", activity: "Ind. Borracha", k1: "1,10" },
  { category: "Industrial", activity: "Ind. Metal/Mecânica", k1: "1,10" },
  { category: "Industrial", activity: "Ind. Elétrica", k1: "1,14" },
  { category: "Industrial", activity: "Ind. Mineradora", k1: "1,15" },
  { category: "Industrial", activity: "Ind. Têxtil", k1: "1,19" },
  { category: "Industrial", activity: "Ind. Plástico", k1: "1,25" },
  { category: "Industrial", activity: "Condomínio Industrial", k1: "1,30" },
  { category: "Industrial", activity: "Ind. Química", k1: "1,35" },
  { category: "Industrial", activity: "Ind. Papel", k1: "1,45" },
  { category: "Industrial", activity: "Ind. Alimentos", k1: "1,55" },
  { category: "Industrial", activity: "Ind. Construção", k1: "1,68" },
  { category: "Industrial", activity: "Aterro Sanitário", k1: "1,68" },
  // Público
  { category: "Público", activity: "Usos públicos (Hospitais, Escolas, Praças, etc)", k1: "1,00" },
  { category: "Público", activity: "Unidades prisionais com preparação de refeições", k1: "1,55" },
];

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
    <div className="flex-1 min-w-0">
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`${color}`}>{icon}</span>
        <h3 className="text-sm font-semibold text-[#0b1e35]">{title}</h3>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2 items-center">
            {/* Campo Início */}
            <div className="flex-1">
              <input
                type="month"
                // Converte MM/AAAA para YYYY-MM para o input entender
                value={row.startMonth.split('/').reverse().join('-')} 
                onChange={(e) => {
                  // Converte YYYY-MM de volta para MM/AAAA
                  const [y, m] = e.target.value.split('-');
                  onChange(row.id, "startMonth", `${m}/${y}`);
                }}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all cursor-pointer"
              />
            </div>
            
            {/* Campo Fim */}
            <div className="flex-1">
              <input
                type="month"
                value={row.endMonth.split('/').reverse().join('-')}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  onChange(row.id, "endMonth", `${m}/${y}`);
                }}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all cursor-pointer"
              />
            </div>
            
            {/* Campo Valor */}
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
  
  // 1. Click Outside Ref
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

  // Estados de Configuração (Água)
  const [selectedTariff, setSelectedTariff] = useState("Residencial");
  const [serviceRates, setServiceRates] = useState<RateEntry[]>([
    { id: newId(), startMonth: "01/2026", endMonth: "12/2026", value: TARIFF_STRUCTURES["Residencial"].serviceRate },
  ]);
  const [m3Tiers, setM3Tiers] = useState(TARIFF_STRUCTURES["Residencial"].tiers);

  // Estados de Configuração (Esgoto)
  const [selectedK1Category, setSelectedK1Category] = useState("Residencial");
  const [selectedK1Activity, setSelectedK1Activity] = useState("Casa");
  const [k1Factor, setK1Factor] = useState("1,00");

  // Estado das Linhas (Água + Esgoto integrados)
  const [rows, setRows] = useState<IrregularRow[]>([
    { 
      id: newId(), monthYear: "01/2026", consumption: "20", 
      chargedWater: "13,60", chargedService: "31,96", 
      chargedSewage: ""
    },
  ]);

  // Novos estados para o gerador de período em lote
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

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

  // ─── Handlers de Configuração ─────────────────────────────────────────────

  function handleTariffChange(tariffName: string) {
    setSelectedTariff(tariffName);
    const preset = TARIFF_STRUCTURES[tariffName];
    if (preset) {
      setServiceRates(prev => prev.map(r => ({ ...r, value: preset.serviceRate })));
      setM3Tiers(preset.tiers);
    }

    // === Sincronização Inteligente do Grupo K1 ===
    let k1Cat = "Residencial";
    if (tariffName.includes("Comercial")) k1Cat = "Comercial";
    else if (tariffName.includes("Industrial")) k1Cat = "Industrial";
    else if (tariffName.includes("Pública")) k1Cat = "Público";

    setSelectedK1Category(k1Cat);
    
    const firstActivity = K1_DATA.find(item => item.category === k1Cat);
    if (firstActivity) {
      setSelectedK1Activity(firstActivity.activity);
      setK1Factor(firstActivity.k1);
    }
  }

  function handleK1ActivityChange(activity: string) {
    setSelectedK1Activity(activity);
    const item = K1_DATA.find(i => i.activity === activity && i.category === selectedK1Category);
    if (item) {
      setK1Factor(item.k1);
    }
  }

  function addServiceRate() {
    setServiceRates((p) => [...p, { id: newId(), startMonth: "", endMonth: "", value: "" }]);
  }
  function removeServiceRate(id: number) {
    setServiceRates((p) => p.filter((r) => r.id !== id));
  }
  function changeServiceRate(id: number, field: keyof RateEntry, val: string) {
    setServiceRates((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }
  function changeM3Tier(id: number, val: string) {
    setM3Tiers((p) =>
      p.map((tier) => (tier.id === id ? { ...tier, value: maskBRL(val) } : tier))
    );
  }

  // ─── Handlers de Linhas Irregulares (Avulso e Em Lote) ────────────────────

  function addRow() {
    setRows((p) => [...p, { 
      id: newId(), monthYear: "", consumption: "", 
      chargedWater: "", chargedService: "",
      chargedSewage: ""
    }]);
  }

  function handleGeneratePeriod() {
    const start = parseMonthYear(periodStart);
    const end = parseMonthYear(periodEnd);

    if (!start || !end) {
      alert("Formato de data inválido. Use o padrão MM/AAAA.");
      return;
    }
    if (start > end) {
      alert("A data de início deve ser anterior ou igual à data de fim.");
      return;
    }

    const generatedRows: IrregularRow[] = [];
    let current = new Date(start);

    // Loop que adiciona 1 mês até chegar no fim do período
    while (current <= end) {
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const yyyy = current.getFullYear();
      const monthYearStr = `${mm}/${yyyy}`;

      generatedRows.push({
        id: newId(),
        monthYear: monthYearStr,
        consumption: "",
        chargedWater: "",
        chargedService: "",
        chargedSewage: ""
      });

      current.setMonth(current.getMonth() + 1);
    }

    setRows((prev) => {
      // Cria uma lista dos meses que já existem para não adicionar duplicado
      const existingMonths = prev.map(r => r.monthYear);
      const filteredRows = generatedRows.filter(r => !existingMonths.includes(r.monthYear));
      return [...prev, ...filteredRows];
    });

    // Limpa os campos após gerar
    setPeriodStart("");
    setPeriodEnd("");
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
        
        if (["chargedWater", "chargedService", "chargedSewage"].includes(field)) {
          return { ...r, [field]: maskBRL(val) };
        }
        return r;
      })
    );
  }

  // ─── Integração com Back-end (API Python/Node) ────────────────────────────
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const delay = setTimeout(() => fetchCalculations(), 600);
    return () => clearTimeout(delay);
  }, [serviceRates, m3Tiers, rows, k1Factor, aiNumber, removalDate, postRegM3, postRegRef, billedM3]);

  async function fetchCalculations() {
    try {
      const formattedSewageRows = rows.map(r => ({
        id: r.id,
        monthYear: r.monthYear,
        chargedSewage: r.chargedSewage,
        chargedService: "0" 
      }));

      const response = await fetch("https://notificacao-caj.vercel.app/api/calcular_multa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serviceRates, m3Tiers, rows, 
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

  // ─── Pontes Seguras (Mata o erro de 'undefined') ──────────────────────────
  
  const calcRows = rows.map((row) => {
    const apiCalc = apiData?.rows?.find((r: any) => r.id === row.id);
    if (apiCalc) return { ...apiCalc, row };
    
    return {
      row, hasError: false, consumption: 0, correctWater: null, correctService: null,
      totalCorrect: null, chargedWater: 0, chargedService: 0, totalCharged: 0, diff: null, m3Rate: null
    };
  });

  const calcSewageRows = rows.map((row) => {
    const apiCalc = apiData?.sewageRows?.find((r: any) => r.id === row.id);
    if (apiCalc) return { ...apiCalc, row };
    
    return {
      row, hasError: false, totalCorrect: null,
      chargedSewage: 0, chargedService: 0, totalCharged: 0, diff: null
    };
  });

  // ─── KPIs e Totais ────────────────────────────────────────────────────────
  const validRows = calcRows.filter((r: any) => !r.hasError && r.totalCorrect !== null);
  const totalM3 = apiData?.totals?.totalM3 || 0;
  const grandCorrect = apiData?.totals?.grandCorrect || 0;
  const grandCharged = apiData?.totals?.grandCharged || 0;
  const grandDiff = apiData?.totals?.grandDiff || 0;

  // ─── Geração de Texto ─────────────────────────────────────────────────────
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
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } catch {}
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
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
        
        {/* WRAPPER DO CLICK OUTSIDE */}
        <div ref={panelRef} className="relative">
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
            <div className="absolute top-full right-0 mt-3 w-full min-w-[700px] max-w-3xl bg-white border border-gray-200 rounded-xl shadow-2xl p-8 cursor-default origin-top-right z-50">
              
              <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-base">Parâmetros Ativos do Sistema</h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Edite os valores de referência. O sistema usará esses dados para calcular os meses irregulares.
                  </p>
                </div>
              </div>
              
              {/* === BLOCO 1: ESTRUTURA TARIFÁRIA DA ÁGUA === */}
              <div className="mb-6 bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-2">
                      Estrutura Tarifária (Fatura de Água)
                    </label>
                    <select
                      value={selectedTariff}
                      onChange={(e) => handleTariffChange(e.target.value)}
                      className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer shadow-sm transition-all"
                    >
                      {Object.keys(TARIFF_STRUCTURES).map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* === BLOCO 2: CÁLCULO DO FATOR K1 (ESGOTO) === */}
              <div className="mb-6 bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                <label className="block text-[11px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-4">
                  Categoria Tarifária do Esgoto (Fator K1)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4">
                  
                  {/* Seletor de Atividade (A lista continua sendo filtrada pelo grupo oculto) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ramo de Atividade</label>
                    <select
                      value={selectedK1Activity}
                      onChange={(e) => handleK1ActivityChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] bg-white cursor-pointer h-[38px]"
                    >
                      {K1_DATA.filter(item => item.category === selectedK1Category).map(item => (
                        <option key={item.activity} value={item.activity}>{item.activity}</option>
                      ))}
                    </select>
                  </div>

                  {/* Campo Final do K1 */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">K1 Aplicado</label>
                    <input
                      value={k1Factor}
                      onChange={(e) => setK1Factor(maskBRL(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-[#1a5fa8] bg-white focus:outline-none text-center h-[38px]"
                    />
                  </div>
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

                {/* Tabela B — m³ (Faixas de Consumo) */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={14} className="text-[#1a5fa8]" />
                    <h3 className="text-sm font-semibold text-[#0b1e35]">Valor do Metro Cúbico (R$/m³)</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {m3Tiers.map((tier) => (
                      <div key={tier.id} className="flex gap-2 items-center">
                        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 flex items-center">
                          {tier.label}
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">R$</span>
                          <input
                            value={tier.value}
                            onChange={(e) => changeM3Tier(tier.id, e.target.value)}
                            placeholder="0,00"
                            className="w-full pl-8 pr-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legenda colunas */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Início</span>
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Fim</span>
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Valor (R$)</span>
                  <span className="w-5" />
                </div>

                <div className="flex gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Faixa de Consumo</span>
                  <span className="flex-1 bg-gray-50 rounded px-2 py-1.5 text-center border border-gray-100">Valor (R$)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* A rolagem ocupa 100% da tela */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 w-full">

          {/* ── Bloco 2A: Lançamento Água ───────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Plus size={18} className="text-[#1a5fa8]" />
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Lançamento dos Meses Irregulares de Água</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Gere um período automático ou adicione mês a mês</p>
                </div>
              </div>

              {/* GERADOR DE PERÍODO (NOVO) */}
              <div className="flex items-center gap-2 bg-[#f8fafe] p-1.5 rounded-lg border border-[#dce9f7]">
                <input
                  value={periodStart}
                  onChange={(e) => setPeriodStart(maskMonthYear(e.target.value))}
                  placeholder="Início (MM/AAAA)"
                  maxLength={7}
                  className="w-[115px] px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#1a5fa8] transition-all text-center"
                />
                <span className="text-gray-400 text-xs font-medium">até</span>
                <input
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(maskMonthYear(e.target.value))}
                  placeholder="Fim (MM/AAAA)"
                  maxLength={7}
                  className="w-[115px] px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#1a5fa8] transition-all text-center"
                />
                <button
                  onClick={handleGeneratePeriod}
                  disabled={periodStart.length < 7 || periodEnd.length < 7}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-300 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
                >
                  <RefreshCw size={12} /> Gerar
                </button>
              </div>
            </div>

            <div className="p-4">
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
                        <input
                          value={row.monthYear}
                          onChange={(e) => changeRow(row.id, "monthYear", e.target.value)}
                          placeholder="MM/AAAA"
                          maxLength={7}
                          className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 transition-all ${
                            dateError ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-[#1a5fa8] focus:ring-[#1a5fa8]/20"
                          }`}
                        />
                        <input
                          value={row.consumption}
                          onChange={(e) => changeRow(row.id, "consumption", e.target.value)}
                          placeholder="Ex: 20"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                        <input
                          value={row.chargedWater}
                          onChange={(e) => changeRow(row.id, "chargedWater", e.target.value)}
                          placeholder="Ex: 13,60"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                        <input
                          value={row.chargedService}
                          onChange={(e) => changeRow(row.id, "chargedService", e.target.value)}
                          placeholder="Ex: 31,96"
                          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                        />
                        <button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-400 transition-colors justify-self-center">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {noRate && (
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 px-1">
                          <AlertCircle size={10} /> Nenhum preço cadastrado para este período.
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

              {/* Botão de adicionar mês avulso no final da tabela */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-xs text-[#1a5fa8] hover:text-[#154d8a] font-medium transition-colors"
                >
                  <Plus size={12} /> Adicionar mês avulso manualmente
                </button>
              </div>

            </div>
          </div>

          {/* ── Bloco 2B: Lançamento Esgoto ───────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Plus size={18} className="text-[#4a7fa5]" />
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Lançamento dos Meses Irregulares de Esgoto</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Sincronizado automaticamente com a tabela de Água</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-[140px_200px] gap-4 mb-2 px-1">
                {["Mês/Ano (Automático)", "Esgoto Cobrado Errado (R$)"].map((h, i) => (
                  <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
                ))}
              </div>

              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.id}>
                    <div className="grid grid-cols-[140px_200px] gap-4 items-center">
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 flex items-center h-[34px]">
                        {row.monthYear || "Mês não preenchido"}
                      </div>
                      
                      <input
                        value={row.chargedSewage}
                        onChange={(e) => changeRow(row.id, "chargedSewage", e.target.value)}
                        placeholder="Ex: 10,88"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:border-[#1a5fa8] focus:outline-none focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all h-[34px]"
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

              {/* Mensagem informativa do Esgoto */}
              <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
                <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4a7fa5]">
                  A tarifa referente ao esgotamento sanitário corresponde à <strong>80% do valor da fatura de água</strong> multiplicado pelo <strong>Fator K1</strong> (Fator de Carga Poluidora para lançamentos na rede pública de esgotos).
                </p>
              </div>
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
                      Mês de Ref. Pós-Reg. (MM/AAAA)
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

              {/* Textareas editáveis (Água e Esgoto Lado a Lado) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* === LAUDO DA ÁGUA === */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Água</label>
                    <button
                      onClick={() => handleCopy(waterReportText, setCopiedWater)}
                      disabled={!waterReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedWater ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span className="text-emerald-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copiar Água
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={waterReportText}
                    onChange={(e) => setWaterReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar / Atualizar Texto]..."
                        : "Texto da Água aparecerá aqui."
                    }
                    rows={10}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>

                {/* === LAUDO DO ESGOTO === */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Esgoto</label>
                    <button
                      onClick={() => handleCopy(sewageReportText, setCopiedSewage)}
                      disabled={!sewageReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedSewage ? (
                        <>
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          <span className="text-emerald-600">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copiar Esgoto
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={sewageReportText}
                    onChange={(e) => setSewageReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar / Atualizar Texto]..."
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
          </div>

        </div>
      </div>
    </div>
  );
}