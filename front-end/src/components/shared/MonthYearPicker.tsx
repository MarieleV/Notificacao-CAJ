import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { parseMonthYear, labelMonth, MONTHS_SHORT } from "../../utils/dates";

interface MonthYearPickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  size?: "sm" | "md";
}

/**
 * Seletor de mês/ano único (ex: "Fatura de referência").
 * Antes duplicado em FineCalculator e OuvidoriaManager.
 */
export function MonthYearPicker({ value, onChange, placeholder, size = "sm" }: MonthYearPickerProps) {
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
    if (!isOpen) setViewYear(selected ? selected.getFullYear() : new Date().getFullYear());
    setIsOpen((v) => !v);
  }

  function selectMonth(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onChange(`${mm}/${viewYear}`);
    setIsOpen(false);
  }

  const buttonSizeClasses =
    size === "md" ? "w-full h-10 px-3 text-sm rounded-md" : "w-[128px] h-8 px-2.5 text-xs rounded-md";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 border transition-colors bg-white ${buttonSizeClasses} ${
          isOpen ? "border-brand ring-3 ring-brand/15" : "border-gray-300 hover:border-gray-400"
        } ${selected ? "text-gray-700" : "text-gray-400"}`}
      >
        <span className="truncate">{selected ? labelMonth(value) : placeholder}</span>
        <CalendarIcon size={size === "md" ? 14 : 12} className="text-brand flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[210px] bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-slideUp">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded hover:bg-brand-soft text-gray-500 hover:text-brand transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-semibold text-ink tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded hover:bg-brand-soft text-gray-500 hover:text-brand transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, idx) => {
              const isSelected = !!selected && selected.getFullYear() === viewYear && selected.getMonth() === idx;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(idx)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected ? "bg-brand text-white" : "text-gray-600 hover:bg-brand-soft hover:text-brand"
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