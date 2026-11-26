import { useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Calculator, Check, Copy, X } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { Alert, Button, buttonClass, inputClass, labelClass } from "./ui";
import { avisoForaDaFaixaDeFeriados, foraDaFaixaDeFeriados, parseFullDate } from "../../utils/dates";

interface CalculadoraDiasUteisProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  dataInicial: string;
  setDataInicial: (v: string) => void;
  prazo: string;
  setPrazo: (v: string) => void;
  customPrazo: string;
  setCustomPrazo: (v: string) => void;
  /** Data final já calculada pelo hook da tela (DD/MM/AAAA) ou vazio. */
  dataFinal: string;
  /** Ref opcional para o hook fechar o popover ao clicar fora. */
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * Botão + popover da calculadora de dias úteis.
 * Apenas apresentação: toda a regra de cálculo continua nos hooks de cada tela
 * (useRespostaDefesa e useProcessoOuvidoria). Antes, este JSX estava duplicado nas duas telas.
 */
export function CalculadoraDiasUteis({
  open, setOpen, dataInicial, setDataInicial, prazo, setPrazo,
  customPrazo, setCustomPrazo, dataFinal, containerRef,
}: CalculadoraDiasUteisProps) {
  const [copiado, setCopiado] = useState(false);

  // Avisa quando o período calculado sai da lista de feriados (PA-06).
  const foraDaLista = Boolean(dataFinal) &&
    foraDaFaixaDeFeriados(parseFullDate(dataInicial), parseFullDate(dataFinal));

  const handleCopiar = () => {
    if (!dataFinal) return;
    navigator.clipboard.writeText(dataFinal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={buttonClass("secondary", "md", open ? "!bg-brand-soft !border-brand text-brand" : "text-brand")}
      >
        <Calculator size={16} />
        Calculadora de dias úteis
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Calculadora de dias úteis"
          className="absolute top-full right-0 mt-2 w-[min(92vw,360px)] bg-white rounded-[14px] shadow-2xl border border-gray-200 overflow-hidden origin-top-right z-50 animate-slideUp"
        >
          <div className="pl-5 pr-3 h-14 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-brand" />
              <h2 className="text-ink font-semibold text-sm">Calculadora de dias úteis</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar calculadora"
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-ink hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className={labelClass}>Data inicial</label>
              <DatePicker value={dataInicial} onChange={setDataInicial} placeholder="DD/MM/AAAA" />
            </div>

            <div>
              <label htmlFor="calc-prazo" className={labelClass}>Prazo de resposta</label>
              <select id="calc-prazo" value={prazo} onChange={(e) => setPrazo(e.target.value)} className={inputClass}>
                <option value="15">15 dias úteis</option>
                <option value="30">30 dias úteis</option>
                <option value="45">45 dias úteis</option>
                <option value="60">60 dias úteis</option>
                <option value="90">90 dias úteis</option>
                <option value="X">Outro prazo (personalizar)</option>
              </select>
              {prazo === "X" && (
                <input
                  type="number"
                  min="1"
                  value={customPrazo}
                  onChange={(e) => setCustomPrazo(e.target.value)}
                  placeholder="Quantidade de dias úteis"
                  aria-label="Quantidade de dias úteis"
                  className={`${inputClass} mt-2 animate-fadeIn`}
                />
              )}
            </div>

            <div className="bg-brand-subtle border border-brand-line rounded-md px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-ink-muted">Data final</span>

              {dataFinal ? (
                <button
                  type="button"
                  onClick={handleCopiar}
                  title="Copiar data"
                  aria-label={copiado ? "Data copiada" : `Copiar data ${dataFinal}`}
                  className="flex items-center gap-2 h-9 px-3 bg-white border border-brand-line rounded-md hover:border-brand transition-colors group active:scale-[0.98]"
                >
                  <span className="text-base font-semibold text-brand">{dataFinal}</span>
                  {copiado ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Copy size={15} className="text-gray-400 group-hover:text-brand transition-colors" />
                  )}
                </button>
              ) : (
                <span className="text-base font-semibold text-gray-300">--/--/----</span>
              )}
            </div>

            {foraDaLista && (
              <Alert tone="warning" className="text-xs">{avisoForaDaFaixaDeFeriados()}</Alert>
            )}
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
            <Button size="sm" onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
