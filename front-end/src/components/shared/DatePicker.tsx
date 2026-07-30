import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { parseFullDate, labelFullDate, WEEKDAYS_SHORT } from "../../../utils/dates";

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

/**
 * Seletor de data completa (Dia/Mês/Ano).
 * Antes esta implementação estava duplicada, quase idêntica, em:
 * FineCalculator, OuvidoriaManager, RespostaDefesaManager, NotificationDrafter.
 */
export function DatePicker({ value, onChange, placeholder }: DatePickerProps) {
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