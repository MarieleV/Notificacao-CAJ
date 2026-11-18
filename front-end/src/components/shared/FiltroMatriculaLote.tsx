// front-end/src/components/shared/FiltroMatriculaLote.tsx
// Bloco "Análises Vencidas" + campo de Matrícula com navegação por caso,
// reaproveitado nas telas de Multas e Resposta de Defesa.
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, FileText, RefreshCw, Search, UserCheck } from "lucide-react";
import { Button, buttonClass, FeedbackModal, inputClass, labelClass } from "./ui";
import type { FiltroMatriculaLote as FiltroMatriculaLoteState } from "../../hooks/useFiltroMatriculaLote";

interface Props {
  filtro: FiltroMatriculaLoteState;
  /** Prefixo para ids únicos dos campos na página. */
  idPrefix: string;
}

export function FiltroMatriculaLote({ filtro, idPrefix }: Props) {
  const temLote = Boolean(filtro.filtroResponsavel) && filtro.totalCasos > 0;
  const podeNavegar = Boolean(filtro.filtroResponsavel) && filtro.totalCasos > 1;
  const semBase = filtro.baseHydrated && filtro.baseCliente.length === 0;

  return (
    <div translate="no" className="notranslate">
      {filtro.modal && (
        <FeedbackModal
          type={filtro.modal.type}
          message={<span>{filtro.modal.message}</span>}
          onClose={() => filtro.setModal(null)}
        />
      )}

      {/* Painel: Análises Vencidas */}
      <div className={`mb-4 bg-brand-subtle border rounded-md flex flex-col transition-colors overflow-hidden ${filtro.origemCasos ? "border-success-line" : "border-brand-line"}`}>
        <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink text-sm flex items-center gap-2 mb-0.5">
              <FileText size={15} className="text-brand flex-shrink-0" /> <span>Análises Vencidas</span>
            </h3>
            <p className="text-xs text-ink-muted"><span>Puxe os dados filtrados da tela Controle de Análises.</span></p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <button type="button" onClick={filtro.importarDoControleAnalises} className={buttonClass("primary", "sm")}>
              <RefreshCw size={14} />
              Puxar filtrados
            </button>
            <div className="min-w-[120px] max-w-[260px] text-center sm:text-left mt-2 sm:mt-0">
              {filtro.origemCasos ? (
                <p className="text-xs text-success flex items-center justify-center sm:justify-start gap-1.5 font-medium truncate" title={filtro.origemCasos}>
                  <CheckCircle2 size={13} className="flex-shrink-0" /><span className="truncate"><span>{filtro.origemCasos}</span></span>
                </p>
              ) : (
                <p className="text-xs text-ink-muted truncate">Nenhum dado importado</p>
              )}
            </div>
          </div>
        </div>

        {filtro.casos.length > 0 && filtro.responsaveisList.length > 0 && (
          <div className="bg-white border-t border-brand-line p-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label htmlFor={`${idPrefix}-responsavel`} className={labelClass}>Trabalhar em lote por responsável</label>
                <div className="relative">
                  <select
                    id={`${idPrefix}-responsavel`}
                    translate="no"
                    value={filtro.filtroResponsavel}
                    onChange={(e) => filtro.handleSelectResponsavel(e.target.value)}
                    className={`notranslate ${inputClass} pr-9 appearance-none cursor-pointer ${!filtro.filtroResponsavel ? "text-ink-muted" : "text-ink font-medium"}`}
                  >
                    <option value="" className="text-gray-500">Selecione um responsável…</option>
                    {filtro.responsaveisList.map((resp) => (
                      <option key={`resp-${resp}`} value={resp} className="text-gray-800">{resp}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              {filtro.filtroResponsavel && (
                <div className="text-right sm:border-l sm:border-brand-line sm:pl-5 sm:ml-2 flex flex-col justify-center h-full">
                  <span className="text-[28px] font-semibold text-brand leading-none"><span>{filtro.totalCasos}</span></span>
                  <p className="text-xs font-medium text-ink-muted mt-1"><span>casos vinculados</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Campo Matrícula */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label htmlFor={`${idPrefix}-matricula`} className={`${labelClass} flex justify-between items-center`}>
            <span>Matrícula</span>
            {temLote && (
              <span className="text-brand font-semibold text-[11px] bg-brand-soft px-2 py-0.5 rounded-full border border-brand-line">
                <span>Caso </span><span>{filtro.currentCasoIndex >= 0 ? filtro.currentCasoIndex + 1 : "?"}</span><span> de </span><span>{filtro.totalCasos}</span>
              </span>
            )}
          </label>

          <div className="flex gap-2">
            {podeNavegar && (
              <button type="button" onClick={() => filtro.navegarCaso("prev")} title="Caso anterior" aria-label="Caso anterior" className={buttonClass("secondary", "md", "w-10 px-0 text-brand")}>
                <ChevronLeft size={16} />
              </button>
            )}

            <input
              id={`${idPrefix}-matricula`}
              value={filtro.matricula}
              onChange={(e) => filtro.setMatricula(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  filtro.handleSearchMatricula();
                }
              }}
              placeholder="Ex: 1298382-9"
              className={`${inputClass} flex-1`}
            />

            {podeNavegar && (
              <button type="button" onClick={() => filtro.navegarCaso("next")} title="Próximo caso" aria-label="Próximo caso" className={buttonClass("secondary", "md", "w-10 px-0 text-brand")}>
                <ChevronRight size={16} />
              </button>
            )}

            <Button
              variant="secondary"
              icon={Search}
              onClick={filtro.handleSearchMatricula}
              disabled={semBase || !filtro.matricula.trim()}
              title={semBase ? "Carregue a Base de Dados do Cliente na tela Redigir Notificação para buscar" : undefined}
            >
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {filtro.clienteData.nomeCliente && (
        <div className="mb-6 bg-success-soft border border-success-line rounded-md p-4 flex items-start gap-3 animate-slideUp">
          <div className="mt-0.5 text-success">
            <UserCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success">Cliente localizado. Dados importados da base.</p>
            <p className="text-xs text-ink-body mt-1 leading-relaxed">
              <span className="font-semibold">Nome:</span> <span>{filtro.clienteData.nomeCliente}</span>
              <span className="text-success-line mx-1.5">|</span>
              <span className="font-semibold">Endereço:</span> <span>{filtro.clienteData.logradouro}</span>
              {filtro.clienteData.numeroHidrometro && (
                <>
                  <span className="text-success-line mx-1.5">|</span>
                  <span className="font-semibold">Hidrômetro:</span> <span>{filtro.clienteData.numeroHidrometro}</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
