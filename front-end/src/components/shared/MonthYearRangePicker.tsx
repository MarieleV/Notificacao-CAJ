import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { parseMonthYear, labelMonth, MONTHS_SHORT } from "../../utils/dates";

interface MonthYearRangePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

/**
 * Seletor de período mês/ano (ex: "01/2026 a 03/2026").
 *
 * Antes existiam DUAS implementações divergentes deste componente:
 * a de FineCalculator.tsx armazenava o valor em formato numérico "MM/AAAA a MM/AAAA",
 * enquanto a de OuvidoriaManager.tsx armazenava em formato textual "Jan/2026 a Mar/2026".
 * Isso foi unificado aqui em um único formato de valor ("MM/AAAA"), compatível com
 * `parseMonthYear`/`labelMonth` usados no resto do app — a exibição visual (rótulo)
 * continua amigável ("Jan/2026 até Mar/2026"), só o valor armazenado mudou.
 */
export function MonthYearRangePicker({ value, onChange, placeholder }: MonthYearRangePickerProps) {
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

  // Codifica ano/mês em um único inteiro (ano*100 + mês) pra comparação/ordenação fácil.
  const toCode = (d: Date) => d.getFullYear() * 100 + d.getMonth();
  const fromCode = (code: number) => ({ year: Math.floor(code / 100), month: code % 100 });

  const parseValue = (valStr: string) => {
    if (!valStr) return { start: null, end: null };
    const parts = valStr.split(" a ");
    const parsePart = (p: string) => {
      const d = parseMonthYear(p);
      return d ? toCode(d) : null;
    };
    return { start: parsePart(parts[0]), end: parts.length > 1 ? parsePart(parts[1]) : null };
  };

  const handleToggle = () => {
    if (!isOpen) {
      const parsed = parseValue(value);
      setStartVal(parsed.start);
      setEndVal(parsed.end);
      setViewYear(parsed.start ? fromCode(parsed.start).year : new Date().getFullYear());
    }
    setIsOpen(!isOpen);
  };

  const handleMonthClick = (monthIdx: number) => {
    const val = viewYear * 100 + monthIdx;
    if (!startVal || (startVal && endVal)) {
      setStartVal(val);
      setEndVal(null);
    } else if (val < startVal) {
      setEndVal(startVal);
      setStartVal(val);
    } else {
      setEndVal(val);
    }
  };

  const formatValue = (code: number) => {
    const { year, month } = fromCode(code);
    return `${String(month + 1).padStart(2, "0")}/${year}`;
  };

  const handleConfirm = () => {
    if (startVal && endVal) onChange(`${formatValue(startVal)} a ${formatValue(endVal)}`);
    else if (startVal) onChange(formatValue(startVal));
    else onChange("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartVal(null);
    setEndVal(null);
  };

  const displayLabel = value ? value.split(" a ").map((v) => labelMonth(v)).join(" até ") : "";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 w-full px-3 py-2 border rounded-lg text-sm transition-all text-left ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20 bg-[#eef6ff]" : "border-gray-200 bg-white hover:border-[#1a5fa8]"
        } ${value ? "text-[#0b1e35] font-medium" : "text-gray-500"}`}
      >
        <span className="truncate block flex-1">{value ? displayLabel : placeholder}</span>
        <CalendarIcon size={14} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full right-0 lg:left-0 lg:right-auto mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-bold text-sm text-[#0b1e35]">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2" onMouseLeave={() => setHoverVal(null)}>
            {MONTHS_SHORT.map((m, idx) => {
              const val = viewYear * 100 + idx;
              const isStart = startVal === val;
              const isEnd = endVal === val;
              const isSelected = isStart || isEnd;
              const isBetween = !!startVal && !!endVal && val > startVal && val < endVal;
              const isHover =
                !!startVal && !endVal && hoverVal != null &&
                ((val > startVal && val <= hoverVal) || (val >= hoverVal && val < startVal));

              let baseClass = "py-1.5 rounded-md text-[11px] font-medium transition-colors text-center cursor-pointer ";
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

          <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-1">
            <button type="button" onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
              Limpar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!startVal}
              className="text-xs font-bold text-white bg-[#1a5fa8] hover:bg-[#154d8a] px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}