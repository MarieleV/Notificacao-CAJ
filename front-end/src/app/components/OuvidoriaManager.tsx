import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Copy, CheckCircle2,
  Scale, FileCheck, FileX, Clock, HelpCircle, FileText, File,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, ChevronDown, ChevronUp, MessageSquare, Calculator, X
} from "lucide-react";

type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
type TipoCasoType = "leitura" | "servico" | "corte_cavalete" | "hd" | "bypass" | "clandestina" | "la_padronizada" | "la_cadastral" | "prorrogacao";
type DefesaType = "com_defesa" | "sem_defesa";

// ─── Helpers de Data ──────────────────────────────────────────────────────────

// Lista oficial de Feriados e Fins de Semana extraída da planilha
const FERIADOS_E_FDS = [
  "2025-08-30", "2025-08-31", "2025-09-06", "2025-09-07", "2025-09-13", "2025-09-14", "2025-09-20", "2025-09-21",
  "2025-09-27", "2025-09-28", "2025-10-04", "2025-10-05", "2025-10-11", "2025-10-12", "2025-10-18", "2025-10-19",
  "2025-10-25", "2025-10-26", "2025-11-01", "2025-11-02", "2025-11-08", "2025-11-09", "2025-11-15", "2025-11-16",
  "2025-11-20", "2025-11-21", "2025-11-22", "2025-11-23", "2025-11-29", "2025-11-30", "2025-12-06", "2025-12-07",
  "2025-12-13", "2025-12-14", "2025-12-20", "2025-12-21", "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25",
  "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
  "2026-01-03", "2026-01-04", "2026-01-10", "2026-01-11", "2026-01-17", "2026-01-18", "2026-01-24", "2026-01-25",
  "2026-01-31", "2026-02-01", "2026-02-07", "2026-02-08", "2026-02-14", "2026-02-15", "2026-02-16", "2026-02-17",
  "2026-02-21", "2026-02-22", "2026-02-28", "2026-03-01", "2026-03-07", "2026-03-08", "2026-03-09", "2026-03-14",
  "2026-03-15", "2026-03-21", "2026-03-22", "2026-03-28", "2026-03-29", "2026-04-03", "2026-04-04", "2026-04-05",
  "2026-04-11", "2026-04-12", "2026-04-18", "2026-04-19", "2026-04-20", "2026-04-21", "2026-04-25", "2026-04-26",
  "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-09", "2026-05-10", "2026-05-16", "2026-05-17", "2026-05-23",
  "2026-05-24", "2026-05-30", "2026-05-31", "2026-06-04", "2026-06-05", "2026-06-06", "2026-06-07", "2026-06-13",
  "2026-06-14", "2026-06-20", "2026-06-21", "2026-06-27", "2026-06-28", "2026-07-04", "2026-07-05", "2026-07-11",
  "2026-07-12", "2026-07-18", "2026-07-19", "2026-07-25", "2026-07-26", "2026-08-01", "2026-08-02", "2026-08-08",
  "2026-08-09", "2026-08-15", "2026-08-16", "2026-08-22", "2026-08-23", "2026-08-29", "2026-08-30", "2026-09-05",
  "2026-09-06", "2026-09-07", "2026-09-12", "2026-09-13", "2026-09-19", "2026-09-20", "2026-09-26", "2026-09-27",
  "2026-10-03", "2026-10-04", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-17", "2026-10-18", "2026-10-24",
  "2026-10-25", "2026-10-31", "2026-11-01", "2026-11-02", "2026-11-07", "2026-11-08", "2026-11-14", "2026-11-15",
  "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-28", "2026-11-29", "2026-12-05", "2026-12-06", "2026-12-12",
  "2026-12-13", "2026-12-19", "2026-12-20", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-27", "2026-12-28",
  "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-09", "2027-01-10",
  "2027-01-16", "2027-01-17", "2027-01-23", "2027-01-24", "2027-01-30", "2027-01-31", "2027-02-06", "2027-02-07",
  "2027-02-08", "2027-02-09", "2027-02-13", "2027-02-14", "2027-02-20", "2027-02-21", "2027-02-27", "2027-02-28",
  "2027-03-06", "2027-03-07", "2027-03-08", "2027-03-09", "2027-03-13", "2027-03-14", "2027-03-20", "2027-03-21",
  "2027-03-26", "2027-03-27", "2027-03-28", "2027-04-03", "2027-04-04", "2027-04-10", "2027-04-11", "2027-04-17",
  "2027-04-18", "2027-04-21", "2027-04-24", "2027-04-25", "2027-05-01", "2027-05-02", "2027-05-08", "2027-05-09",
  "2027-05-15", "2027-05-16", "2027-05-22", "2027-05-23", "2027-05-27", "2027-05-28", "2027-05-29", "2027-05-30",
  "2027-06-05", "2027-06-06", "2027-06-12", "2027-06-13", "2027-06-19", "2027-06-20", "2027-06-26", "2027-06-27",
  "2027-07-03", "2027-07-04", "2027-07-10", "2027-07-11", "2027-07-17", "2027-07-18", "2027-07-24", "2027-07-25",
  "2027-07-31", "2027-08-01", "2027-08-07", "2027-08-08", "2027-08-14", "2027-08-15", "2027-08-21", "2027-08-22",
  "2027-08-28", "2027-08-29", "2027-09-04", "2027-09-05", "2027-09-06", "2027-09-07", "2027-09-11", "2027-09-12",
  "2027-09-18", "2027-09-19", "2027-09-25", "2027-09-26", "2027-10-02", "2027-10-03", "2027-10-09", "2027-10-10",
  "2027-10-11", "2027-10-12", "2027-10-16", "2027-10-17", "2027-10-23", "2027-10-24", "2027-10-30", "2027-10-31",
  "2027-11-01", "2027-11-02", "2027-11-06", "2027-11-07", "2027-11-13", "2027-11-14", "2027-11-15", "2027-11-20",
  "2027-11-21", "2027-11-27", "2027-11-28", "2027-12-04", "2027-12-05", "2027-12-11", "2027-12-12", "2027-12-18",
  "2027-12-19", "2027-12-24", "2027-12-25", "2027-12-26", "2027-12-27", "2027-12-28", "2027-12-29", "2027-12-30",
  "2027-12-31"
];

function getBusinessDaysDifference(date1: string, date2: string): number {
  const d1 = parseFullDate(date1);
  const d2 = parseFullDate(date2);
  if (!d1 || !d2) return 0;

  let count = 0;
  const start = new Date(Math.min(d1.getTime(), d2.getTime()));
  const end = new Date(Math.max(d1.getTime(), d2.getTime()));
  
  let current = new Date(start);
  while (current < end) {
    current.setDate(current.getDate() + 1);
    
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Ignora Sábados, Domingos E os dias listados no array (Feriados/Emendas)
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const isFeriado = FERIADOS_E_FDS.includes(dateString);

    if (!isWeekend && !isFeriado) {
      count++;
    }
  }
  return count;
}

function get60BusinessDaysFromToday(): string {
  const d = new Date();
  let added = 0;
  while (added < 60) {
    d.setDate(d.getDate() + 1);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Conta 60 dias para frente ignorando os feriados, sábados e domingos
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isFeriado = FERIADOS_E_FDS.includes(dateString);

    if (!isWeekend && !isFeriado) {
      added++;
    }
  }
  const dayStr = String(d.getDate()).padStart(2, '0');
  const monthStr = String(d.getMonth() + 1).padStart(2, '0');
  const yearStr = d.getFullYear();
  return `${dayStr}/${monthStr}/${yearStr}`;
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

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

function parseFullDate(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function labelFullDate(s: string): string {
  const d = parseFullDate(s);
  if (!d) return s;
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const isFeriado = FERIADOS_E_FDS.includes(dateString);

    if (!isWeekend && !isFeriado) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function formatName(name: string): string {
  if (!name) return "";
  
  const lowerCaseWords = ["da", "de", "do", "das", "dos", "e"];
  
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && lowerCaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Função Genérica para Calcular Prazos (Usada na Calculadora)
function calculateEndDate(startDateStr: string, duration: number): string {
  if (!startDateStr || !duration || isNaN(duration)) return "";
  const d = parseFullDate(startDateStr);
  if (!d) return "";

  let added = 0;
  while (added < duration) {
    d.setDate(d.getDate() + 1);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const isFeriado = FERIADOS_E_FDS.includes(dateString);

    if (!isWeekend && !isFeriado) {
      added++;
    }
  }
  const dayStr = String(d.getDate()).padStart(2, '0');
  const monthStr = String(d.getMonth() + 1).padStart(2, '0');
  const yearStr = d.getFullYear();
  return `${dayStr}/${monthStr}/${yearStr}`;
}

// ─── Componente: Seletor de Período de Meses/Ano (Range Picker) ───────────────

function MonthYearRangePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [startVal, setStartVal] = useState<number | null>(null);
  const [endVal, setEndVal] = useState<number | null>(null);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const parseValue = (valStr: string) => {
    const parts = valStr.split(" a ");
    const parsePart = (p: string) => {
      if (!p) return null;
      const [mStr, yStr] = p.split("/");
      if (!mStr || !yStr) return null;
      const mIdx = MONTHS_SHORT.findIndex((m) => m.toLowerCase() === mStr.toLowerCase());
      if (mIdx === -1) return null;
      return parseInt(yStr) * 100 + mIdx;
    };
    return { start: parsePart(parts[0]), end: parts.length > 1 ? parsePart(parts[1]) : null };
  };

  const handleToggle = () => {
    if (!isOpen) {
      const parsed = parseValue(value);
      setStartVal(parsed.start);
      setEndVal(parsed.end);
      setViewYear(parsed.start ? Math.floor(parsed.start / 100) : new Date().getFullYear());
    }
    setIsOpen(!isOpen);
  };

  const handleMonthClick = (monthIdx: number) => {
    const val = viewYear * 100 + monthIdx;
    if (!startVal || (startVal && endVal)) {
      setStartVal(val);
      setEndVal(null);
    } else {
      if (val < startVal) {
        setEndVal(startVal);
        setStartVal(val);
      } else {
        setEndVal(val);
      }
    }
  };

  const formatDisplay = (val: number) => {
    const y = Math.floor(val / 100);
    const m = val % 100;
    return `${MONTHS_SHORT[m]}/${y}`;
  };

  const handleConfirm = () => {
    if (startVal && endVal) {
      onChange(`${formatDisplay(startVal)} a ${formatDisplay(endVal)}`);
    } else if (startVal) {
      onChange(formatDisplay(startVal));
    } else {
      onChange("");
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartVal(null);
    setEndVal(null);
  };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 w-full px-3 py-2 border rounded-lg text-sm transition-all text-left ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20 bg-[#eef6ff]" : "border-[#c3ddf8] bg-[#eef6ff]"
        } ${value ? "text-[#0b1e35] font-medium" : "text-gray-500"}`}
      >
        <span className="truncate block flex-1">{value || placeholder}</span>
        <CalendarIcon size={14} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[260px] bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} className="p-1.5 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-sm text-[#0b1e35]">{viewYear}</span>
            <button type="button" onClick={() => setViewYear((y) => y + 1)} className="p-1.5 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-3" onMouseLeave={() => setHoverVal(null)}>
            {MONTHS_SHORT.map((m, idx) => {
              const val = viewYear * 100 + idx;
              const isStart = startVal === val;
              const isEnd = endVal === val;
              const isSelected = isStart || isEnd;
              const isBetween = startVal && endVal && val > startVal && val < endVal;
              const isHover = startVal && !endVal && hoverVal && ((val > startVal && val <= hoverVal) || (val >= hoverVal && val < startVal));

              let baseClass = "px-2 py-2 rounded-md text-xs font-medium transition-colors text-center cursor-pointer ";
              if (isSelected) baseClass += "bg-[#1a5fa8] text-white shadow-sm";
              else if (isBetween || isHover) baseClass += "bg-[#eef6ff] text-[#1a5fa8]";
              else baseClass += "text-gray-600 hover:bg-gray-100";

              return (
                <div key={m} onClick={() => handleMonthClick(idx)} onMouseEnter={() => setHoverVal(val)} className={baseClass}>
                  {m}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <button type="button" onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
              Limpar
            </button>
            <button type="button" onClick={handleConfirm} disabled={!startVal} className="text-xs font-bold text-white bg-[#1a5fa8] hover:bg-[#154d8a] px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Componente: Seletor de Mês/Ano (Calendário) ──────────────────────────────

function MonthYearPicker({
  value,
  onChange,
  placeholder,
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  size?: "sm" | "md";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => {
    const parsed = parseMonthYear(value);
    return parsed ? parsed.getFullYear() : new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = parseMonthYear(value);

  function handleToggle() {
    if (!isOpen) {
      setViewYear(selected ? selected.getFullYear() : new Date().getFullYear());
    }
    setIsOpen((v) => !v);
  }

  function selectMonth(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onChange(`${mm}/${viewYear}`);
    setIsOpen(false);
  }

  const buttonSizeClasses =
    size === "md"
      ? "w-full px-3 py-2.5 text-sm rounded-lg"
      : "w-[128px] px-2.5 py-1.5 text-xs rounded-md";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 border transition-all bg-white ${buttonSizeClasses} ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20" : "border-gray-200"
        } ${selected ? "text-gray-700" : "text-gray-400"}`}
      >
        <span className="truncate">{selected ? labelMonth(value) : placeholder}</span>
        <CalendarIcon size={size === "md" ? 14 : 12} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[210px] bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-[#0b1e35] tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, idx) => {
              const isSelected =
                !!selected && selected.getFullYear() === viewYear && selected.getMonth() === idx;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(idx)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1a5fa8] text-white"
                      : "text-gray-600 hover:bg-[#eef6ff] hover:text-[#1a5fa8]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente: Seletor de Data Completa (Dia/Mês/Ano) ───────────────────────

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    const parsed = parseFullDate(value);
    return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = parseFullDate(value);

  function handleToggle() {
    if (!isOpen) {
      const parsed = parseFullDate(value);
      setViewDate(parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date());
    }
    setIsOpen((v) => !v);
  }

  function changeMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  function selectDay(day: number) {
    const dd = String(day).padStart(2, "0");
    const mm = String(viewDate.getMonth() + 1).padStart(2, "0");
    const yyyy = viewDate.getFullYear();
    onChange(`${dd}/${mm}/${yyyy}`);
    setIsOpen(false);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 w-full px-3 py-2 border rounded-lg text-sm transition-all bg-white ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20" : "border-gray-200"
        } ${selected ? "text-gray-700" : "text-gray-400"}`}
      >
        <span className="truncate">{selected ? labelFullDate(value) : placeholder}</span>
        <CalendarIcon size={14} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[260px] bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-[#0b1e35]">{monthLabel}</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS_SHORT.map((w, i) => (
              <div key={i} className="text-[10px] text-center text-gray-400 font-semibold">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const isSelected =
                !!selected &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-7 w-7 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1a5fa8] text-white"
                      : "text-gray-600 hover:bg-[#eef6ff] hover:text-[#1a5fa8]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente: Bloco Editável e Copiável com Altura Dinâmica (Guia Sansys) ───
function EditableCopyBlock({ defaultText }: { defaultText: string }) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(defaultText);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    // Se o usuário ainda não editou manualmente, atualiza o texto se as variáveis mudarem
    if (!isDirty) {
      setText(defaultText);
    }
  }, [defaultText, isDirty]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsDirty(false);
    setText(defaultText);
  };

  // CALCULO DE ALTURA DINÂMICA:
  // Conta quantas quebras de linha existem no texto atual.
  // Garante que o mínimo seja 2 linhas (para textos curtinhos) e remove limites rígidos.
  const lineCount = text.split('\n').length;
  const dynamicRows = Math.max(lineCount, 2);

  return (
    <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono border border-gray-200 focus-within:border-[#1a5fa8] focus-within:ring-1 focus-within:ring-[#1a5fa8]/20 focus-within:bg-white transition-all shadow-sm">
      <div className="flex justify-end mb-1.5 gap-4">
        {isDirty && (
          <button 
            onClick={handleReset} 
            className="text-[10px] text-amber-600 hover:underline flex items-center font-bold"
          >
            Desfazer Edição
          </button>
        )}
        <button 
          onClick={handleCopy} 
          className="text-[10px] text-[#1a5fa8] hover:underline flex items-center gap-1 font-bold"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12}/>}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsDirty(true);
        }}
        rows={dynamicRows} // Aplica dinamicamente a quantidade exata de linhas do texto
        className="w-full bg-transparent border-none resize-none focus:outline-none text-gray-700 leading-relaxed overflow-hidden"
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function OuvidoriaManager() {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [generatedText, setGeneratedText] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- CONTROLE DE FLUXO ---
  const [isRecurso, setIsRecurso] = useState<boolean>(true);
  const [historicoDefesa, setHistoricoDefesa] = useState<DefesaType>("sem_defesa");

  // --- ESTADOS DOS CAMPOS DO PROCESSO ---
  const [matricula, setMatricula] = useState("");
  const [morador, setMorador] = useState("");
  const [tipoManifestacao, setTipoManifestacao] = useState("Recurso Administrativo");
  const [numProcesso, setNumProcesso] = useState("");
  const [numAutoInfracao, setNumAutoInfracao] = useState("");
  const [dataEmissaoFatura, setDataEmissaoFatura] = useState("");
  const [dataManifestacao, setDataManifestacao] = useState("");
  
  // Cálculo da diferença 
  const diasUteisDif = getBusinessDaysDifference(dataEmissaoFatura, dataManifestacao);
  const isForaDoPrazo = dataEmissaoFatura && dataManifestacao &&  diasUteisDif > 30;

  // --- CONFIGURAÇÃO DO CASO ---
  const [tipoCaso, setTipoCaso] = useState<TipoCasoType>("leitura");
  const [decisao, setDecisao] = useState<DecisaoType>(null);
  const [tipoServico, setTipoServico] = useState<"voluntario" | "involuntario">("involuntario");

  // --- VARIÁVEIS DOS TEMPLATES (Exibidas condicionalmente) ---
  const [dataGeracaoAI, setDataGeracaoAI] = useState("");
  const [mesesSemAcesso, setMesesSemAcesso] = useState("");
  const [dataConstatacaoInfracao, setDataConstatacaoInfracao] = useState("");
  const [protServico, setProtServico] = useState("");
  const [recebedorCorreios, setRecebedorCorreios] = useState("");
  const [dataRecebimentoAR, setDataRecebimentoAR] = useState("");
  const [dataAplicacaoSancao, setDataAplicacaoSancao] = useState("");
  const [dataDecisaoAnterior, setDataDecisaoAnterior] = useState("");
  const [faturaReferencia, setFaturaReferencia] = useState("");
  const [dataDefesa, setDataDefesa] = useState("");
  const [protDefesa, setProtDefesa] = useState("");
  const [dataIndeferimento, setDataIndeferimento] = useState("");
  const [protIndeferimento, setProtIndeferimento] = useState("");

  const [dataRecebimentoAI, setDataRecebimentoAI] = useState("");
  const [tipoRecebimentoAI, setTipoRecebimentoAI] = useState("Correios");

  // --- ESTADOS: TRATATIVAS SANSYS ---
  const [guiaSansysOpen, setGuiaSansysOpen] = useState(false);
  const [canalResposta, setCanalResposta] = useState("email");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [aplicaIN83, setAplicaIN83] = useState(true);
  const [temRestituicao, setTemRestituicao] = useState(false);
  const [statusMulta426, setStatusMulta426] = useState("aplicada");
  const [tipoIndeferido, setTipoIndeferido] = useState("padrao");
  const [protContatoAtivo, setProtContatoAtivo] = useState("");
  const [faturaAlterada, setFaturaAlterada] = useState(false);

  // --- ESTADOS DA CALCULADORA DE PRAZOS ---
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutsideCalculator(event: MouseEvent) {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node)) {
        setShowCalculator(false);
      }
    }
    if (showCalculator) {
      document.addEventListener("mousedown", handleClickOutsideCalculator);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCalculator);
    };
  }, [showCalculator]);
  const [calcPrazo, setCalcPrazo] = useState<string>("15");
  const [calcCustomPrazo, setCalcCustomPrazo] = useState<string>("");
  const [calcDataInicial, setCalcDataInicial] = useState<string>("");

  const durationNum = calcPrazo === "X" ? parseInt(calcCustomPrazo || "0", 10) : parseInt(calcPrazo, 10);
  const calcDataFinal = calculateEndDate(calcDataInicial, durationNum);

  // ─── LÓGICA DE CONDICIONAIS DE EXIBIÇÃO ───
  const isLeitura = tipoCaso === "leitura";
  const isServico = tipoCaso === "servico";
  const isCorte = tipoCaso === "corte_cavalete";
  const isHd = tipoCaso === "hd";
  const isBypass = tipoCaso === "bypass";
  const isClandestina = tipoCaso === "clandestina";
  const isPadronizada = tipoCaso === "la_padronizada";
  const isCadastral = tipoCaso === "la_cadastral";
  const isProrrogacao = tipoCaso === "prorrogacao";

  const isSimples = isPadronizada || isCadastral || isProrrogacao;
  const isRecursoEnxuto = isRecurso && (isLeitura || isServico) && (decisao === "deferir" || decisao === "parcial");

  // Controla se a Sessão 3 inteira aparece e se tem botões de decisão
  const hasDecisaoButtons = isLeitura || isServico;
  const hasDefesaToggle = true; // Agora aparece em todos os casos de texto
  const showSessao3 = hasDecisaoButtons || hasDefesaToggle;

  // Numeração Dinâmica baseada em SESSÃO 3
  const numSessao3 = showSessao3 ? "3" : null;
  const numSessao4 = showSessao3 ? "4" : "3";
  const numSessao5 = showSessao3 ? "5" : "4";

  // Regras de renderização das variáveis (Sessão 4)
  const showDataGeracaoAI = !isSimples && !isRecursoEnxuto;
  const showMesesSemAcesso = isLeitura && !isRecursoEnxuto;
  const showDataConstatacao = (isServico || isCorte || isHd || isBypass || isClandestina) && !isRecursoEnxuto;
  const showProtServico = (isServico || isBypass || isClandestina) && !isRecursoEnxuto;
  const showRecebedorAR = !isSimples && !isRecursoEnxuto;
  const showDataRecebimentoAR = isHd || isProrrogacao || isBypass || isClandestina;
  const showDataAplicacaoSancao = !isSimples && !isRecursoEnxuto && !isBypass && !isClandestina;
  const showDataDecisaoAnterior = !isRecurso && decisao === "indeferir" && !isSimples;
  const showFaturaReferencia = !isProrrogacao && !isBypass && !isClandestina;
  const showDefesaCampos = historicoDefesa === "com_defesa";

  // Componentes de cópia para clipboard (Sessão 5)
  const [copied10082, setCopied10082] = useState(false);
  const [copied3773, setCopied3773] = useState(false);
  const [copied426, setCopied426] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Lidar com a troca de opções do tipo de caso
  const handleTipoCasoChange = (val: TipoCasoType) => {
    setTipoCaso(val);
    if (val === "leitura" || val === "servico") {
      setDecisao(null); 
    } else {
      setDecisao("deferir"); // Auto-seta apenas para desativar a trava do botão de Gerar
    }
  };

  // ─── FUNÇÕES DE AUXÍLIO: TRATATIVAS SANSYS ───
  const getParte2Text = (withRestituicao = true) => {
    const prazoStr = get60BusinessDaysFromToday();
    const fat = faturaReferencia || "[FATURA]";
    
    if (decisao === "deferir") {
      let t = "Processo Deferido";
      if (aplicaIN83) t += ", em atendimento a IN 83/2025";
      if (withRestituicao && temRestituicao) t += ". Solicitar restituição das multas pagas pelo e-mail **atendimento@aguasdejoinville.com.br**";
      else t += `. FAT ${fat} corrigida.`;
      return t;
    }
    if (decisao === "parcial") {
      let t = "Processo Deferido parcialmente";
      if (aplicaIN83) t += " em atendimento a IN 83/2025,";
      else t += ",";
      t += ` prorrogado prazo da padronização até ${prazoStr}.`;
      if (withRestituicao && temRestituicao) t += " Solicitar restituição das multas pagas pelo e-mail **atendimento@aguasdejoinville.com.br**";
      else t += ` FAT ${fat} corrigida.`;
      return t;
    }
    if (decisao === "indeferir") {
      if (tipoIndeferido === "in83_aceite") return `Processo Indeferido. Caso cliente aceite padronizar a ligação de água, pode solicitar prazo para a execução e revisão da fatura em atendimento a IN 83/2025. Nova solicitação expira em ${prazoStr}. FAT ${fat} inalterada.`;
      if (tipoIndeferido === "in83_expirado") return `Processo Indeferido. Prazo para padronização conforme IN 83/2025 expirado. FAT ${fat} inalterada.`;
      return `Processo Indeferido. FAT ${fat} inalterada.`;
    }
    return "Decisão não definida";
  };

  const getParte1Text = () => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    if (canalResposta === "email") return `Informar cliente pelo e-mail ${clienteEmail || "[E-MAIL]"}, em ${hoje} sobre teor do docto anexado neste protocolo.`;
    if (canalResposta === "telefone") return `Informar cliente pelo Telefone: ${clienteTelefone || "[TELEFONE]"}, sobre teor do docto anexado neste protocolo.`;
    return `Informar cliente pelo e-mail ${clienteEmail || "[E-MAIL]"} em ${hoje} e Telefone: ${clienteTelefone || "[TELEFONE]"} sobre teor do docto anexado neste protocolo.`;
  };

  const copyToClipboardSansys = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ─── GERAÇÃO DA MINUTA JURÍDICA ───
  const handleGenerateParecer = () => {
    if (!matricula || !numProcesso || (hasDecisaoButtons && !decisao)) {
      alert("Por favor, preencha os dados e a decisão de mérito (se aplicável).");
      return;
    }

    const tplMorador = morador || "[NOME DO MORADOR]";
    const tplMatricula = matricula || "[MATRÍCULA]";
    const tplProc = numProcesso || "[Nº DO PROCESSO]";
    const tplAI = numAutoInfracao || "[AUTO INFRAÇÃO]";
    const tplFatura = faturaReferencia || "[FATURA]";
    const tplGeracao = dataGeracaoAI || "[DATA GERAÇÃO AI]";
    const tplAplicacao = dataAplicacaoSancao || "[DATA APLICAÇÃO SANÇÃO]";
    const tplConstatacao = dataConstatacaoInfracao || "[DATA CONSTATAÇÃO]";
    const tplRecebedor = recebedorCorreios || "[RECEBEDOR AR]";
    const tplRecebimentoAR = dataRecebimentoAR || "[DATA RECEBIMENTO AR]";
    const tplMeses = mesesSemAcesso || "[MESES SEM ACESSO]";
    const tplProtServico = protServico || "[PROTOCOLO SERVIÇO]";
    const tplDecisaoAnterior = dataDecisaoAnterior || "[DATA DECISÃO ANTERIOR]";
    const tplDataDefesa = dataDefesa || "[DATA DA DEFESA]";
    const tplProtDefesa = protDefesa || "[PROT. DEFESA]";
    const tplDataIndeferimento = dataIndeferimento || "[DATA INDEFERIMENTO]";
    const tplProtIndeferimento = protIndeferimento || "[PROT. INDEFERIMENTO]";
    const tplPrazo = get60BusinessDaysFromToday();

    // Parágrafo padrão inserido quando "Houve defesa prévia?" = Sim
    const paragrafoDefesaPrevia = `Foi apresentada Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}). A mesma foi indeferida em ${tplDataIndeferimento} (Prot. ${tplProtIndeferimento}), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\nInciso XII - Impedimento voluntário/involuntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.`;
    
    const txtImpCap = tipoServico === "voluntario" ? "Impedimento Voluntário" : "Impedimento Involuntário";
    const txtImpLow = tipoServico === "voluntario" ? "impedimento voluntário" : "impedimento involuntário";

    let tpl = "";

    // =======================================================
    // TEXTOS: É RECURSO? -> SIM
    // =======================================================
    if (isRecurso) {
      if (tipoCaso === "leitura") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        } else {
          tpl = `**Recurso protocolo ${tplProc}**\n**Morador: ${tplMorador}**\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS.\nFato Gerador: Impedimento involuntário para execução de leituras.\nMeses sem acesso: ${tplMeses}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\nRevisando os fatos, [MANTEMOS A APLICAÇÃO POIS NÃO HÁ COMPROVAÇÃO DE IMPOSSIBILIDADE TÉCNICA].\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        }
      } else if (tipoCaso === "servico") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à ${txtImpCap} de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}.\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara poder viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        } else {
          tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à ${txtImpCap} de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.\nFato gerador: Impedimento Involuntário para execução do serviço.\nData da constatação: ${tplConstatacao}\nProtocolo de serviço: ${tplProtServico}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\nComo não houve apresentação de defesa, nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.\nRevisando os fatos, [NÃO IDENTIFICAMOS EXCLUDENTE DE RESPONSABILIDADE QUE JUSTIFIQUE A RETIRADA].\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida Pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        }
      } else if (tipoCaso === "corte_cavalete") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Multa por Violação do corte cavalete\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso X da Resolução 019/2019 - ARIS.\nFato gerador: Violação do corte de cavalete\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}.\nAnalisando os fatos, há registro de que foi confirmado a violação do corte conforme imagens.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\n02.DECISÃO:\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão da multa aplicada por não padronização obrigatória da ligação de água, em estrita observância à **Instrução Normativa nº 83/2025**.\nQuanto à multa por violação do corte, não é possível, pois foi constatado a violação.\nA FAT ${tplFatura} foi corrigida e está anexa, com a exclusão da multa por não execução da padronização obrigatória da ligação de água.${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n03.PRORROGAÇÃO: Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação de padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de multa independentemente de nova notificação.\n\nPara padronizar, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)`;
      } else if (tipoCaso === "hd") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Multa por Danificação do hidrômetro.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso VI da Resolução 019/2019 - ARIS.\nFato gerador: Danificação do hidrômetro.\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor} em ${tplRecebimentoAR}.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\nAnalisando os fatos, [DESCREVER O DANO COM BASE NOS FATOS], conforme imagens abaixo.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\nDECIDIMOS\nMANTER a aplicação de penalidades referente ao Auto de Infração nº ${tplAI}:\n- Multa por Danificação, inversão e/ou supressão do hidrômetro, no valor correspondente;\n\n(Se houver Consumo estimado):\nVisto ter havido retenção de consumo pelo fato, conforme Resolução ARIS 19/2019, o prestador de serviço pode cobrar o consumo estimado de água e esgoto retido, ao primeiro consumo do ciclo completo após a regularização da ligação de água, tendo sido então cobrados a Revisão do faturamento.`;
      } else if (tipoCaso === "bypass") {
        let textDefesa = "";
        if (historicoDefesa === "com_defesa") {
          textDefesa = `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:`;
        } else {
          textDefesa = `Como não houve apresentação de defesa, a(s) multa(s) foi/foram aplicada(s), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:`;
        }
        
        tpl = `À Ouvidoria,\nObjeto: Multa por derivação do ramal predial antes do hidrômetro (by-pass) e Revisão do faturamento de água e esgoto.\n**Morador: ${tplMorador}**\nMatrícula: ${tplMatricula}\nO que ensejou a manifestação do cliente foi a aplicação de multa referente à derivação do ramal predial antes do hidrômetro (by-pass), conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso V, da Resolução 019/2019 - ARIS. Data da constatação: ${tplConstatacao}. Protocolo: ${tplProtServico}. Constatado pela Fiscalização. Penalidade prevista: Multa por derivação não autorizada antes do hidrômetro (by-pass).\nCaso após a retirada da irregularidade, a matrícula tenha variação positiva de consumo, poderá haver a Revisão do faturamento de água e esgoto: ARIS - Resolução 19/2019.\nO Auto de Infração foi entregue, no endereço do imóvel, pelos Correios/por fiscal da Companhia e recebido por ${tplRecebedor} em ${tplRecebimentoAR}. ${textDefesa}\n\nV - Derivação do ramal predial antes do hidrômetro (by-pass).\n§ 2º Em caso de reincidência, no prazo de até 12 (doze) meses, o prestador de serviços poderá cobrar as infrações com valor em dobro.\nVEREDICTO (ANALISAR CFE MANIFESTAÇÃO) A partir da manifestação do cliente verificamos [ANALISE OS FATOS E COMPLETE]\n\nDECIDIMOS:\n04. RATIFICAR, a decisão proferida em [DATA ANTERIOR], MANTENDO AS PENALIDADES. A fatura com a multa não será alterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**`;
      } else if (tipoCaso === "clandestina") {
        let textDefesa = "";
        if (historicoDefesa === "com_defesa") {
          textDefesa = `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}`;
        } else {
          textDefesa = `Como não houve apresentação de defesa, a(s) multa(s) foi/foram aplicada(s),`;
        }
        
        tpl = `À Ouvidoria,\nObjeto: Multa por Ligação clandestina de água e Revisão do faturamento de água.\n**Morador: ${tplMorador}**\n**Matrícula:** ${tplMatricula}\n\nO que ensejou a manifestação do cliente foi a aplicação de multas referente à Ligação clandestina de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso VII da Resolução 019/2019 - ARIS. Data da constatação: ${tplConstatacao}. Protocolo: ${tplProtServico}. Constatado pela Fiscalização. Penalidade prevista: Multa por ligação clandestina de água.\nCaso após a retirada da irregularidade, a matrícula tenha variação positiva de consumo, poderá haver a Revisão do faturamento de água e esgoto: ARIS - Resolução 19/2019.\nO Auto de Infração foi entregue, no endereço do imóvel, pelos Correios/por fiscal da Companhia e recebido por ${tplRecebedor} em ${tplRecebimentoAR}.\n${textDefesa}\npois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\nVII - Ligação clandestina de água e esgoto.\nVEREDICTO (ANALISAR CFE MANIFESTAÇÃO) A partir da manifestação do cliente, analisada a matrícula, constatamos que [ANALISE OS FATOS E COMPLETE]\n\nDECIDIMOS:\nRATIFICAR, a decisão proferida em [DATA ANTERIOR], MANTENDO as penalidades. A fatura com a multa não será alterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**`;
      }
    } 
    // =======================================================
    // TEXTOS: É RECURSO? -> NÃO
    // =======================================================
    else {
      if (tipoCaso === "leitura") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao **impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água**.\n\nII – DO PROCESSO ADMINISTRATIVO\nAuto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\n\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}\n\n` : ""}A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibilidade normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\n\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por **60 (sessenta) dias úteis**, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da **Resolução ARIS nº 019/2019**.\n\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao **impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água**, conforme disposto.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor}, conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora.\n\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\n\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, **ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}**, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.`;
        }
      } else if (tipoCaso === "servico") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\nMatrícula: ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao ${txtImpLow} de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, tendo como fato gerador o ${txtImpLow} para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nApós a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\n\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}\n\n` : ""}A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibility normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\n\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por **60 (sessenta) dias úteis**, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da **Resolução ARIS nº 019/2019**.\n\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao ${txtImpLow} de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, tendo como fato gerador o ${txtImpLow} para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\n\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, **ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}**, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.`;
        }
      } else if (tipoCaso === "la_padronizada") {
        tpl = `Recurso prot. ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente viabilizou a padronização da ligação de água e solicita cancelamento das multas.\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "la_cadastral") {
        tpl = `Recurso prot. ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente atualizou o cadastro e solicita o cancelamento da multa.\nTendo o cliente atendido as exigências contidas na notificação recebida,\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** RETIFICAR, a decisão proferida, retirando a multa aplicada. A FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "prorrogacao") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente solicita prazo para atender à padronização obrigatória referente notificação recebida em ${tplRecebimentoAR}.\nConsiderando que cliente nos comunicou antes da aplicação das sanções e que a necessidade de prorrogação foi justificada,\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02.DECISÃO:**\nPRORROGAR o prazo de padronização em mais **60 (sessenta) dias úteis**, a contar do prazo de vencimento constante no Auto de Infração lavrado. **Novo prazo expira em ${tplPrazo}.**\nA não padronização da ligação de água dentro do novo prazo poderá acarretar aplicação de sanções, independentemente de nova notificação.\nApós cliente solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal, deve adquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão. Após instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço. A caixa padrão CAJ deve estar aprovada dentro do novo prazo acordado. O serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nPadronize sua ligação de água.\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
      }
    }

    setGeneratedText(tpl);
    setStep("generated");
  };

  // Remove os marcadores de negrito (**) mantendo o texto,
  // usado sempre que o texto for exibido/copiado fora do modo de edição bruta.
  const stripBoldMarkers = (text: string) => text.replace(/\*\*/g, "");

  // Versão inline: troca **palavra** por <strong>palavra</strong>, sem quebrar
  // o texto em parágrafos (útil dentro de blocos que já usam whitespace-pre-wrap,
  // como o preview do e-mail de resposta).
  const renderBoldInline = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, idx) =>
      idx % 2 !== 0 ? <strong key={idx}>{part}</strong> : part
    );
  };

  // Converte "**palavra**" em <strong>, linha por linha, para exibição
  // no modo de pré-visualização (sem nunca mostrar os asteriscos ao usuário).
  const renderFormattedPreview = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={lineIdx} className="min-h-[1em]">
          {parts.map((part, partIdx) =>
            partIdx % 2 !== 0 ? (
              <strong key={partIdx}>{part}</strong>
            ) : (
              <span key={partIdx}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stripBoldMarkers(generatedText));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          texto_final: generatedText,
          numeroProcesso: numProcesso || matricula,
          tipoCaso: tipoCaso,
          decisao: decisao 
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF no servidor.");

      // Transforma a resposta binária em um Blob para download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Parecer_${tipoCaso}_${numProcesso || matricula}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF pelo servidor. Certifique-se de que o backend foi atualizado.");
    }
  };

  const handleDownloadWord = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          texto_final: generatedText,
          numeroProcesso: numProcesso || matricula,
          tipoCaso: tipoCaso,
          decisao: decisao 
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar Word no servidor.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Parecer_${tipoCaso}_${numProcesso || matricula}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor. Certifique-se de que o backend foi atualizado.");
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Análise de Processos e Ouvidoria</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Gestão de Pareceres Locais e Determinísticos</p>
        </div>

        {/* BOTÃO DA CALCULADORA */}
        <div ref={calculatorRef} className="relative">
          <button 
            onClick={() => setShowCalculator((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              showCalculator
                ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]"
                : "bg-white border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] shadow-sm"
            }`}
          >
            <Calculator size={16} />
            Calculadora de Dias Úteis
          </button>

          {/* ============================================================== */}
          {/* MODAL: CALCULADORA DE DIAS ÚTEIS (UI PADRONIZADA) */}
          {/* ============================================================== */}
          {showCalculator && (
            <div className="absolute top-full right-0 mt-3 w-full sm:min-w-[380px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right z-50 animate-slideUp">

              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-[#1a5fa8]" />
                  <h2 className="text-[#0b1e35] font-bold text-sm">Calculadora de Dias Úteis</h2>
                </div>
                <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Campo Data Inicial */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Data Inicial</label>
                  <DatePicker value={calcDataInicial} onChange={setCalcDataInicial} placeholder="DD/MM/AAAA" />
                </div>

                {/* Seleção do Prazo */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prazo de Resposta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={calcPrazo} 
                      onChange={(e) => setCalcPrazo(e.target.value)}
                      className="col-span-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] transition-all"
                    >
                      <option value="15">15 dias úteis</option>
                      <option value="30">30 dias úteis</option>
                      <option value="45">45 dias úteis</option>
                      <option value="60">60 dias úteis</option>
                      <option value="90">90 dias úteis</option>
                      <option value="X">X dias úteis (Personalizar)</option>
                    </select>

                    {calcPrazo === "X" && (
                      <input 
                        type="number" 
                        min="1"
                        value={calcCustomPrazo}
                        onChange={(e) => setCalcCustomPrazo(e.target.value)}
                        placeholder="Qtd. dias"
                        className="col-span-2 w-full px-3 py-2 border border-[#1a5fa8] rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a5fa8]"
                      />
                    )}
                  </div>
                </div>

                {/* Resultado */}
                <div className="bg-[#f8fafe] border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Data Final Calculada:</span>
                  <span className={`text-sm font-bold ${calcDataFinal ? "text-[#1a5fa8]" : "text-gray-400"}`}>
                    {calcDataFinal || "--/--/----"}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                 <button onClick={() => setShowCalculator(false)} className="px-5 py-2 bg-[#1a5fa8] text-white text-xs font-bold rounded-lg hover:bg-[#154d8a] transition-all">
                   Entendido
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8fafe]">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* SESSÃO 1: IDENTIFICAÇÃO DO PROCESSO */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Dados Globais da Manifestação</h2>
                <p className="text-gray-500 text-xs">Insira os dados cadastrais básicos obtidos na triagem do manifesto</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo do Morador</label>
                  <input 
                    value={morador} 
                    onChange={(e) => setMorador(formatName(e.target.value))} 
                    placeholder="Ex: Nome Completo do Usuário" 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Matrícula</label>
                  <input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Ex: 1298382-9" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Origem do Processo</label>
                  <select value={tipoManifestacao} onChange={(e) => setTipoManifestacao(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a5fa8]">
                    <option value="Recurso Administrativo">Recurso (Sansys)</option>
                    <option value="Ouvidoria Interna">Ouvidoria CAJ</option>
                    <option value="ARIS">ARIS</option>
                    <option value="PROCON">PROCON</option>
                    <option value="Reclame Aqui">Reclame Aqui</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nº do Processo / Manifesto</label>
                  <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} placeholder="Protocolo de recurso" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Auto de Infração (A.I.) Vinculado</label>
                  <input value={numAutoInfracao} onChange={(e) => setNumAutoInfracao(e.target.value)} placeholder="Ex: XXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data Emissão Fatura</label>
                  <DatePicker value={dataEmissaoFatura} onChange={setDataEmissaoFatura} placeholder="DD/MM/AAAA" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data da Manifestação</label>
                  <DatePicker value={dataManifestacao} onChange={setDataManifestacao} placeholder="DD/MM/AAAA" />
                </div>
              </div>

              {isForaDoPrazo && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <Info size={14} className="text-red-600" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                    O cliente está entrando com processo fora do prazo - <strong>30 dias úteis excedido</strong> ({diasUteisDif} dias úteis).
                  </span>
                </div>
              )}
              {/* Alerta de Dentro do Prazo */}
              {dataManifestacao && dataEmissaoFatura && !isForaDoPrazo && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    PROCESSO DENTRO DO PRAZO ({diasUteisDif} dias úteis).
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* SESSÃO 2: TIPO DE INFRAÇÃO */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Tipo de Infração (Objeto)</h2>
                <p className="text-gray-500 text-xs">Selecione o enquadramento do fato gerador do auto de infração</p>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-5">
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} className="text-[#1a5fa8]" />
                  <label className="text-[11px] font-bold text-[#1a5fa8] uppercase tracking-wider">É recurso?</label>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => { setIsRecurso(true); handleTipoCasoChange("leitura"); }}
                    className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${isRecurso ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsRecurso(false); handleTipoCasoChange("leitura"); }}
                    className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${!isRecurso ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Qual foi o Fato Gerador?</label>
              <select
                value={tipoCaso}
                onChange={(e) => handleTipoCasoChange(e.target.value as TipoCasoType)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] focus:bg-[#eef6ff] transition-all cursor-pointer"
              >
                {isRecurso ? (
                  <>
                    <option value="leitura">Leitura</option>
                    <option value="servico">Serviço</option>
                    <option value="corte_cavalete">Violação de corte de cavalete</option>
                    <option value="hd">Hidrômetro danificado</option>
                    <option value="bypass">By-pass/Derivação Clandestina</option>
                    <option value="clandestina">Ligação Clandestina</option>
                  </>
                ) : (
                  <>
                    <option value="leitura">Leitura</option>
                    <option value="servico">Serviços</option>
                    <option value="la_padronizada">LA Padronizada</option>
                    <option value="la_cadastral">Atualização Cadastral</option>
                    <option value="prorrogacao">Não multado/Prorrogação de Prazo</option>
                  </>
                )}
              </select>
              {/* === SERVIÇO VOLUNTÁRIO/INVOLUNTARIO === */}
              {tipoCaso === "servico" && (
                <div className="mt-4 p-4 bg-[#eef6ff] border border-[#c3ddf8] rounded-xl animate-fadeIn">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-[#1a5fa8]" />
                    <label className="text-[11px] font-bold text-[#1a5fa8] uppercase tracking-wider">O impedimento foi Voluntário ou Involuntário?</label>
                  </div>
                  <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm w-max">
                    <button
                      type="button"
                      onClick={() => setTipoServico("voluntario")}
                      className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${tipoServico === "voluntario" ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                    >
                      Voluntário
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoServico("involuntario")}
                      className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${tipoServico === "involuntario" ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                    >
                      Involuntário
                    </button>
                  </div>
                </div>
              )}
              {/* ================================ */}
            </div>
          </div>

          {/* SESSÃO 3: VEREDICTO DE MÉRITO / ANÁLISE DE DEFESA */}
          {showSessao3 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{numSessao3}</span>
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">
                    {hasDecisaoButtons ? "Veredicto Final e Conclusão" : "Análise de Defesa"}
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {hasDecisaoButtons ? "Defina o posicionamento formal de mérito da CAJ frente ao recurso" : "Informe se houve apresentação de defesa prévia pelo cliente"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {hasDecisaoButtons && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setDecisao("deferir")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "deferir" ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck className={decisao === "deferir" ? "text-emerald-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">1. Deferir (Retificar)</span>
                      </div>
                      <p className="text-xs text-gray-500">Cancela as penalidades. Padronização realizada cfe protocolo.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisao("parcial")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "parcial" ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={decisao === "parcial" ? "text-amber-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">2. Deferir Parcialmente</span>
                      </div>
                      <p className="text-xs text-gray-500">Retira as multas atuais mas concede prorrogação de 90 dias.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisao("indeferir")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "indeferir" ? "border-red-500 bg-red-50 text-red-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileX className={decisao === "indeferir" ? "text-red-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">3. Indeferir (Ratificar)</span>
                      </div>
                      <p className="text-xs text-gray-500">Mantém integralmente as penalidades e orienta o parcelamento.</p>
                    </button>
                  </div>
                )}
                
                {hasDefesaToggle && (
                  <div className={hasDecisaoButtons ? "mt-6 pt-6 border-t border-gray-100 animate-fadeIn space-y-6" : "space-y-6"}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <Info size={14} className="text-gray-400" />
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Houve defesa prévia?</label>
                      </div>

                      <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setHistoricoDefesa("com_defesa")}
                          className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${historicoDefesa === "com_defesa" ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoricoDefesa("sem_defesa")}
                          className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${historicoDefesa === "sem_defesa" ? "bg-[#1a5fa8] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SESSÃO 4: REQUISITOS VARIÁVEIS */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{numSessao4}</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Variáveis e Datas da Irregularidade</h2>
                <p className="text-gray-500 text-xs">Apenas os campos pertinentes a esta infração estão sendo exibidos abaixo</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {showDataGeracaoAI && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Geração A.I.</label>
                    <DatePicker 
                      value={dataGeracaoAI} 
                      onChange={setDataGeracaoAI} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showMesesSemAcesso && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-1">Meses sem acesso</label>
                    <MonthYearRangePicker 
                      value={mesesSemAcesso} 
                      onChange={setMesesSemAcesso} 
                      placeholder="Ex: Jan/2026 a Mar/2026" 
                    />
                  </div>
                )}

                {showDataConstatacao && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Data Constatação/Imped.</label>
                    <DatePicker 
                      value={dataConstatacaoInfracao} 
                      onChange={setDataConstatacaoInfracao} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}
                
                {showProtServico && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 tracking-wider uppercase mb-1">Nº Prot. Serviço/Fiscaliz.</label>
                    <input 
                      value={protServico} 
                      onChange={(e) => setProtServico(e.target.value)} 
                      placeholder="Ex: 1234567" 
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 bg-amber-50/30 transition-all" 
                    />
                  </div>
                )}

                {showRecebedorAR && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Recebedor do A.I. (AR)</label>
                    <input 
                      value={recebedorCorreios} 
                      onChange={(e) => setRecebedorCorreios(e.target.value)} 
                      placeholder="Nome de quem assinou" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] transition-all" 
                    />
                  </div>
                )}

                {showDataRecebimentoAR && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Recebimento AR</label>
                    <DatePicker 
                      value={dataRecebimentoAR} 
                      onChange={setDataRecebimentoAR} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showDataAplicacaoSancao && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Aplicação Sanções</label>
                    <DatePicker 
                      value={dataAplicacaoSancao} 
                      onChange={setDataAplicacaoSancao} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showDataDecisaoAnterior && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Decisão Anterior</label>
                    <DatePicker 
                      value={dataDecisaoAnterior} 
                      onChange={setDataDecisaoAnterior} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showFaturaReferencia && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fatura (Competência)</label>
                    <MonthYearPicker 
                      value={faturaReferencia} 
                      onChange={setFaturaReferencia} 
                      placeholder="MM/AAAA" 
                      size="md" 
                    />
                  </div>
                )}
                
                {showDefesaCampos && (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">Data Defesa Apresentada</label>
                      <DatePicker 
                        value={dataDefesa} 
                        onChange={setDataDefesa} 
                        placeholder="DD/MM/AAAA" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">Nº Protocolo Defesa</label>
                      <input 
                        value={protDefesa} 
                        onChange={(e) => setProtDefesa(e.target.value)} 
                        placeholder="Ex: 998877" 
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50/30 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">Data Indeferimento (Defesa)</label>
                      <DatePicker 
                        value={dataIndeferimento} 
                        onChange={setDataIndeferimento} 
                        placeholder="DD/MM/AAAA" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">Nº Protocolo Indeferimento</label>
                      <input 
                        value={protIndeferimento} 
                        onChange={(e) => setProtIndeferimento(e.target.value)} 
                        placeholder="Ex: 112233" 
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50/30 transition-all" 
                      />
                    </div>
                  </>
                )}

                {/* NOVOS CAMPOS - SEMPRE VISÍVEIS NA SESSÃO 4 */}
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Recebimento A.I.</label>
                  <DatePicker 
                    value={dataRecebimentoAI} 
                    onChange={setDataRecebimentoAI} 
                    placeholder="DD/MM/AAAA" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Tipo Recebimento A.I.</label>
                  <select 
                    value={tipoRecebimentoAI} 
                    onChange={(e) => setTipoRecebimentoAI(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] bg-white transition-all"
                  >
                    <option value="Correios">Correios</option>
                    <option value="Fiscais da CAJ">Fiscais da CAJ</option>
                  </select>
                </div>

              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateParecer}
            disabled={(hasDecisaoButtons && !decisao) || !matricula}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles size={18} />
            Emitir Minuta de Parecer Oficial
          </button>

          {/* ÁREA DE EXIBIÇÃO E EXPORTAÇÃO DA MINUTA */}
          {step === "generated" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={13} />
                  </span>
                  <div>
                    <h2 className="text-[#0b1e35] font-semibold text-sm">Revisão e Edição do Parecer</h2>
                    <p className="text-gray-500 text-xs">
                      {reviewMode === "preview"
                        ? "Assim ficará o texto final. Clique em \"Editar\" para ajustar algum detalhe."
                        : "Modo de edição: use **palavra** para marcar negrito."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewMode(reviewMode === "preview" ? "edit" : "preview")}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all bg-white"
                  >
                    {reviewMode === "preview" ? "Editar" : "Visualizar"}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-[#1a5fa8] text-[#1a5fa8] rounded-lg text-xs font-semibold hover:bg-[#eef6ff] transition-all bg-white"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-emerald-600">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar Texto
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {reviewMode === "preview" ? (
                  <div
                    onClick={() => setReviewMode("edit")}
                    className="w-full min-h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text hover:border-[#1a5fa8]/40 transition-all"
                  >
                    {renderFormattedPreview(generatedText)}
                  </div>
                ) : (
                  <textarea
                    ref={textAreaRef}
                    autoFocus
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    onBlur={() => setReviewMode("preview")}
                    className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                  />
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{numSessao5}</span>
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Exportação e Entrega</h2>
                  <p className="text-gray-500 text-xs">Baixe o arquivo formatado em Microsoft Word ou PDF</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                >
                  <File size={17} /> Baixar em PDF
                </button>

                <button
                  onClick={handleDownloadWord}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <FileText size={16} /> Baixar como Word (.doc)
                </button>
              </div>
            </div>
          )}

          {/* SESSÃO 0: GUIA DE TRATATIVAS SANSYS */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setGuiaSansysOpen(!guiaSansysOpen)}
              className="w-full px-6 py-4 flex items-center justify-between bg-[#eef6ff] hover:bg-[#dce9f7] transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-[#1a5fa8]" />
                <h2 className="text-[#0b1e35] font-semibold text-sm">Tratativas de Resposta - Guia Sansys</h2>
              </div>
              {guiaSansysOpen ? <ChevronUp size={18} className="text-[#1a5fa8]" /> : <ChevronDown size={18} className="text-[#1a5fa8]" />}
            </button>

            {guiaSansysOpen && (
              <div className="p-6 space-y-6 border-t border-blue-100">
                
                {/* Controles do Guia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Canal de Resposta</label>
                    <select 
                      value={canalResposta} 
                      onChange={(e) => setCanalResposta(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#1a5fa8]"
                    >
                      <option value="email">Apenas E-mail</option>
                      <option value="telefone">Apenas Telefone</option>
                      <option value="ambos">E-mail e Telefone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">E-mail do Cliente</label>
                    <input 
                      value={clienteEmail} 
                      onChange={(e) => setClienteEmail(e.target.value)} 
                      placeholder="email@exemplo.com" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#1a5fa8]"
                      disabled={canalResposta === "telefone"}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Telefone do Cliente</label>
                    <input 
                      value={clienteTelefone} 
                      onChange={(e) => setClienteTelefone(e.target.value)} 
                      placeholder="(47) 99999-9999" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#1a5fa8]"
                      disabled={canalResposta === "email"}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Aplica IN 83/2025?</label>
                    <select 
                      value={aplicaIN83 ? "sim" : "nao"} 
                      onChange={(e) => setAplicaIN83(e.target.value === "sim")} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#1a5fa8]"
                    >
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Fatura Alterada?</label>
                    <select 
                      value={faturaAlterada ? "sim" : "nao"} 
                      onChange={(e) => setFaturaAlterada(e.target.value === "sim")} 
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="nao">Não</option>
                      <option value="sim">Sim</option>
                    </select>
                  </div>
                  {(decisao === "deferir" || decisao === "parcial") && (
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Restituição de Multa?</label>
                      <select 
                        value={temRestituicao ? "sim" : "nao"} 
                        onChange={(e) => setTemRestituicao(e.target.value === "sim")} 
                        className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-xs bg-emerald-50 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim (Solicitar restituição)</option>
                      </select>
                    </div>
                  )}
                  {decisao === "indeferir" && (
                    <div>
                      <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">Motivo Indeferimento</label>
                      <select 
                        value={tipoIndeferido} 
                        onChange={(e) => setTipoIndeferido(e.target.value)} 
                        className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs bg-red-50 focus:outline-none focus:border-red-500"
                      >
                        <option value="padrao">Padrão (Fatura inalterada)</option>
                        <option value="in83_aceite">IN83 - Aceite padronizar</option>
                        <option value="in83_expirado">IN83 - Prazo expirado</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">Status (Para Cód 426)</label>
                    <select 
                      value={statusMulta426} 
                      onChange={(e) => setStatusMulta426(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:border-[#1a5fa8]"
                    >
                      <option value="aplicada">Multa Aplicada</option>
                      <option value="notificacao">Em processo de notificação</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  
                  {/* Passo 1 - Alteração de Fatura */}
                  {faturaAlterada && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-fadeIn">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Alteração de Fatura - Cód 10024 / 10082</span>
                      </div>
                      <div className="p-4 space-y-3">
                        
                        {(decisao === "deferir" || decisao === "parcial") && (
                          <p className="text-[10px] text-amber-600">
                            <strong>Atenção:</strong> Somar 20 dias úteis para o vencimento da nova fatura após a data da decisão.
                          </p>
                        )}

                        <div>
                          <span className="text-[10px] font-bold text-gray-500 mb-1 block">Para geração do cód 10082 (ou cancelamento 10024):</span>
                          <EditableCopyBlock 
                            defaultText={`Solicitante: Recurso Prot ${numProcesso || "[PROCESSO]"}\nDescrição: ${stripBoldMarkers(getParte2Text(false))}`} 
                          />
                        </div>

                        {/* MENSAGEM INFORMATIVA AZUL: Motivo do Cancelamento */}
                        <div className="p-2 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg flex items-center gap-2">
                          <Info size={14} className="text-[#1a5fa8] flex-shrink-0" />
                          <span className="text-[10px] font-medium text-[#1a5fa8]">
                            <strong>Motivo do Cancelamento:</strong> {decisao === "indeferir" ? "Reclamação Infundada/Improcedente" : "Alteração de código de serviço no Sansys"}
                          </span>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Passo 2 - Anexos (Estilo Post-it / Lembrete) */}
                  <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 shadow-sm relative">
                    <div className="flex items-start gap-3">
                      <FileText size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2">
                          Lembrete Importante: Anexos no Sansys - 3773
                        </span>
                        <ul className="list-disc pl-4 text-xs text-amber-900 space-y-2">
                          <li>
                            Anexar PDF da resposta do Recurso{' '}
                            <strong className="text-red-700 bg-red-100/80 border border-red-200 px-1.5 py-0.5 rounded ml-1">
                            Em todos os casos, mesmo que não haja alteração de fatura 
                            </strong>
                          </li>
                          <li>
                            Anexar PDF da fatura corrigida{' '}
                            <strong className="text-red-700 bg-red-100/80 border border-red-200 px-1.5 py-0.5 rounded ml-1">
                              Apenas casos de retorno por Telefone
                            </strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Passo 3 - Encerramento do 3773 */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-700">Encerramento no Sansys - 3773</span>
                    </div>
                    <div className="p-4 space-y-4">
                      
                      {/* Texto Padrão para Encerrar */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 mb-1 block">Texto para encerrar:</span>
                        <EditableCopyBlock defaultText={`${getParte1Text()}\n${stripBoldMarkers(getParte2Text(true))}`} />
                      </div>

                      {/* NOVO: Bloco condicional para Desdobrar Contato Ativo */}
                      {(canalResposta === "telefone" || canalResposta === "ambos") && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-[10px] font-bold text-[#1a5fa8] mb-1 flex items-center gap-1">
                            <Clock size={12} /> Desdobrar o Contato Ativo - 1170
                          </span>
                          <EditableCopyBlock 
                            defaultText={`Informar cliente Telefone: ${clienteTelefone || "[TELEFONE]"} sobre Retorno de Recurso ${numProcesso || "[PROCESSO]"}`} 
                          />
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Passo 4 - Geração Cód 426 */}
                  {tipoCaso !== "la_cadastral" && decisao !== "deferir" && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700">Geração cód. 426 – Prorrogação de prazo</span>
                      </div>
                      {/* Adicionado space-y-3 para criar um espaçamento uniforme entre os elementos */}
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] text-amber-600"><strong>Atenção:</strong> Para processos menores que 90 dias, atrasar a data e hora para ser próximo a data de reanálise do processo pelo fiscal interno.</p>

                        <EditableCopyBlock defaultText={`Solicitante: Recurso Prot ${numProcesso || "[PROCESSO]"}\nDescrição:\nCliente notificado${statusMulta426 === "aplicada" ? " e multado" : ""}, apresentou recurso ref. A.I. ${numAutoInfracao || "[A.I.]"}.\nNovo prazo para padronização vence em: ${get60BusinessDaysFromToday()}.`} />
                    
                        {/* NOVA MENSAGEM INFORMATIVA AZUL */}
                        <div className="p-2 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg flex items-center gap-2">
                          <Info size={14} className="text-[#1a5fa8] flex-shrink-0" />
                          <span className="text-[10px] font-medium text-[#1a5fa8]">
                            Não esquecer de notificar o analista do auto de infração.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passo 5 - E-mail */}
                  {(canalResposta === "email" || canalResposta === "ambos") && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Confecção de E-mail Resposta</span>
                      </div>
                      {/* Adicionado space-y-3 para criar um espaçamento uniforme entre os elementos */}
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] text-amber-600"><strong>Atenção: </strong>Lembre-se de anexar a fatura (se houver alteração).</p>

                        <EditableCopyBlock defaultText={`TÍTULO: Retorno de Recurso\n\nBom dia/Boa tarde Sr./Sra. ${morador || "[CLIENTE]"},\n\nEncaminhamos retorno referente recurso apresentado, conforme segue:\n\n${stripBoldMarkers(generatedText) || '[COLE AQUI A MINUTA OFICIAL GERADA ABAIXO]'}`} />
                                                      
                        {/* NOVA MENSAGEM INFORMATIVA AZUL */}
                        <div className="p-2 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg flex items-center gap-2">
                          <Info size={14} className="text-[#1a5fa8] flex-shrink-0" />
                          <span className="text-[10px] font-medium text-[#1a5fa8]">
                            Solicitar confirmação de entrega e leitura no e-mail - <strong>antes de enviar.</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passo 6 - Abertura Cód 1073 */}
                  {(canalResposta === "telefone" || canalResposta === "ambos") && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-700">Abertura cód. 1073</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="mb-3">
                          <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Nº Prot. Contato Ativo</label>
                          <input 
                            value={protContatoAtivo} 
                            onChange={(e) => setProtContatoAtivo(e.target.value)} 
                            placeholder="Ex: 112233" 
                            className="w-1/3 px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:border-[#1a5fa8]"
                          />
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2"><strong>Atenção:</strong> Serve para priorizar cód. 1170: para contato ativo do Retorno de Recurso (quando canal de retorno por Telefone/Whatsapp)</p>
                        <span className="text-[10px] font-bold text-gray-500 mb-1 block">Texto para abertura:</span>
                        <EditableCopyBlock defaultText={`Solicitante: Contato Ativo Prot ${protContatoAtivo || "[PROT CONTATO]"}\nDescrição: Por gentileza, efetuar o Contato Ativo, prot. ${protContatoAtivo || "[PROT CONTATO]"}, relativo Retorno de Recurso ${numProcesso || "[RECURSO]"}.`} />
                        
                        {/* NOVA MENSAGEM INFORMATIVA AZUL */}
                        <div className="p-2 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg flex items-center gap-2">
                          <Info size={14} className="text-[#1a5fa8] flex-shrink-0" />
                          <span className="text-[10px] font-medium text-[#1a5fa8]">
                            <strong>Para atenção ao setor de atendimento - </strong>não esquecer de anexar a fatura, se houver alteração.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}