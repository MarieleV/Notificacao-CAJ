import {
  Sparkles, Copy, CheckCircle2, Scale, FileCheck, FileX, Clock, 
  HelpCircle, FileText, File, Info, ChevronDown, ChevronUp, 
  MessageSquare, Eraser, AlertTriangle
} from "lucide-react";

import { get60BusinessDaysFromToday } from "../utils/dates";
import { formatName } from "../utils/masks";

import { DatePicker } from "../components/shared/DatePicker";
import { MonthYearPicker } from "../components/shared/MonthYearPicker";
import { MonthYearRangePicker } from "../components/shared/MonthYearRangePicker";
import { SectionBlock } from "../components/shared/SectionBlock";
import { CalculadoraDiasUteis } from "../components/shared/CalculadoraDiasUteis";
import { Button, hintClass, inputClass, labelClass, PageHeader, textareaClass } from "../components/shared/ui";
import { EditableCopyBlock } from "../components/ouvidoria/EditableCopyBlock";

import { useProcessoOuvidoria } from "../hooks/useProcessoOuvidoria";


type ProcessoState = ReturnType<typeof useProcessoOuvidoria>;

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export function ProcessoOuvidoria() {
  const state = useProcessoOuvidoria();

  return (
    <div className="h-full flex flex-col">
      <Header state={state} />

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-8 max-w-5xl mx-auto space-y-6">
          <Sessao1DadosGlobais state={state} />
          <Sessao2TipoInfracao state={state} />
          <Sessao3Veredicto state={state} />
          <Sessao4Variaveis state={state} />
          <SessaoExportacao state={state} />
          <GuiaSansys state={state} />
        </div>
      </div>
    </div>
  );
}

// ─── SUBCOMPONENTES ISOLADOS (JSX) ──────────────────────────────────────────

function Header({ state }: { state: ProcessoState }) {
  const {
    calculatorRef, showCalculator, setShowCalculator, calcDataInicial, setCalcDataInicial,
    calcPrazo, setCalcPrazo, calcCustomPrazo, setCalcCustomPrazo, calcDataFinal,
    limparTela
  } = state;

  return (
    <PageHeader
      icon={Scale}
      title="Análise de Processos e Ouvidoria"
      description="Pareceres de recursos e manifestações de ouvidoria"
      actions={
        <>
          <Button variant="ghost-danger" icon={Eraser} onClick={limparTela}>Limpar tela</Button>
          <CalculadoraDiasUteis
            containerRef={calculatorRef}
            open={showCalculator}
            setOpen={setShowCalculator}
            dataInicial={calcDataInicial}
            setDataInicial={setCalcDataInicial}
            prazo={calcPrazo}
            setPrazo={setCalcPrazo}
            customPrazo={calcCustomPrazo}
            setCustomPrazo={setCalcCustomPrazo}
            dataFinal={calcDataFinal}
          />
        </>
      }
    />
  );
}

function Sessao1DadosGlobais({ state }: { state: ProcessoState }) {
  const {
    morador, setMorador, matricula, setMatricula, tipoManifestacao, setTipoManifestacao,
    numProcesso, setNumProcesso, numAutoInfracao, setNumAutoInfracao, funcionario,
    setFuncionario, funcionarioBusca, setFuncionarioBusca, setFuncSearchOpen, funcSearchOpen,
    filteredFuncionarios, funcionarioSelecionado, erroFuncionarios, dataEmissaoFatura, setDataEmissaoFatura,
    dataManifestacao, setDataManifestacao, isForaDoPrazo, diasUteisDif
  } = state;

  return (
    <SectionBlock number={1} title="Dados Globais da Manifestação" description="Insira os dados cadastrais básicos obtidos na triagem do manifesto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className={labelClass}>Nome Completo do Morador</label>
          <input value={morador} onChange={(e) => setMorador(formatName(e.target.value))} placeholder="Digite seu nome completo..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Matrícula</label>
          <input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="0000000-0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Origem do Processo</label>
          <div className="relative w-full">
            <select value={tipoManifestacao} onChange={(e) => setTipoManifestacao(e.target.value)} className={`${inputClass} pr-9 appearance-none cursor-pointer`}>
              <option value="Recurso Administrativo">Recurso (Sansys)</option>
              <option value="Ouvidoria Interna">Ouvidoria CAJ</option>
              <option value="ARIS">ARIS</option>
              <option value="PROCON">PROCON</option>
              <option value="Reclame Aqui">Reclame Aqui</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label className={labelClass}>Nº do Processo / Manifesto</label>
          <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} placeholder="Digite o protocolo de recurso..." className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className={labelClass}>Auto de Infração (A.I.) Vinculado</label>
          <input value={numAutoInfracao} onChange={(e) => setNumAutoInfracao(e.target.value)} placeholder="0000.0000" className={inputClass} />
        </div>
        <div className="relative">
          <label className={labelClass}>Analista Responsável</label>
          <input
            value={funcionario ? `${funcionario}` : funcionarioBusca}
            onChange={(e) => { setFuncionario(""); setFuncionarioBusca(e.target.value); setFuncSearchOpen(true); }}
            onFocus={() => { if (funcionario) setFuncionarioBusca(""); setFuncSearchOpen(true); }}
            onBlur={() => setTimeout(() => setFuncSearchOpen(false), 200)}
            placeholder="Pesquisar por nome..."
            className={inputClass}
          />
          {funcionarioSelecionado && !funcSearchOpen && (
            <p className={`${hintClass} truncate`}>Mat. {funcionarioSelecionado.matricula}</p>
          )}
          {funcSearchOpen && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-md shadow-xl max-h-56 overflow-y-auto custom-scrollbar animate-slideUp">
              {filteredFuncionarios.map((f) => (
                <div
                  key={f.nome}
                  className="px-3 py-2 flex items-center justify-between gap-2 text-sm text-ink-body hover:bg-brand-soft hover:text-ink cursor-pointer transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); setFuncionario(String(f.nome)); setFuncionarioBusca(""); setFuncSearchOpen(false); }}
                >
                  <span className="truncate">{f.nome}</span>
                  <span className="text-[11px] font-mono font-semibold text-brand flex-shrink-0">Mat. {f.matricula}</span>
                </div>
              ))}
              {erroFuncionarios && <div className="px-3 py-2 text-sm text-danger">{erroFuncionarios}</div>}
              {!erroFuncionarios && filteredFuncionarios.length === 0 && <div className="px-3 py-2 text-sm text-ink-muted">Nenhum funcionário encontrado</div>}
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Data Emissão Fatura</label>
          <DatePicker value={dataEmissaoFatura} onChange={setDataEmissaoFatura} placeholder="DD/MM/AAAA" />
        </div>
        <div>
          <label className={labelClass}>Data da Manifestação</label>
          <DatePicker value={dataManifestacao} onChange={setDataManifestacao} placeholder="DD/MM/AAAA" />
        </div>
      </div>

      {isForaDoPrazo && (
        <div role="status" className="mt-2 flex items-center gap-3 border border-danger-line bg-danger-soft rounded-md pl-3 pr-4 py-2.5 animate-fadeIn">
          <span className="w-8 h-8 rounded-full bg-white text-danger flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-danger">Fora do prazo: limite de 30 dias úteis excedido</p>
            <p className="text-xs text-ink-body">O cliente entrou com o processo após o prazo.</p>
          </div>
          <span className="text-[28px] font-semibold text-danger leading-none">{diasUteisDif}<span className="text-xs font-medium ml-1">dias úteis</span></span>
        </div>
      )}
      {dataManifestacao && dataEmissaoFatura && !isForaDoPrazo && (
        <div role="status" className="mt-2 flex items-center gap-3 border border-success-line bg-success-soft rounded-md pl-3 pr-4 py-2.5 animate-fadeIn">
          <span className="w-8 h-8 rounded-full bg-white text-success flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-success">Dentro do prazo</p>
            <p className="text-xs text-ink-body">Manifestação dentro do limite de 30 dias úteis.</p>
          </div>
          <span className="text-[28px] font-semibold text-success leading-none">{diasUteisDif}<span className="text-xs font-medium ml-1">dias úteis</span></span>
        </div>
      )}
    </SectionBlock>
  );
}

function Sessao2TipoInfracao({ state }: { state: ProcessoState }) {
  const { 
    isRecurso, setIsRecurso, handleTipoCasoChange, tipoCaso, 
    tipoServico, setTipoServico, tipoCorte, setTipoCorte
  } = state;

  return (
    <SectionBlock number={2} title="Tipo de Infração (Objeto)" description="Selecione o enquadramento do fato gerador do auto de infração">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-brand" />
          <span className="text-sm font-semibold text-ink">É recurso?</span>
        </div>
        <div className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5">
          <button type="button" onClick={() => { setIsRecurso(true); handleTipoCasoChange("leitura"); }} aria-pressed={isRecurso} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${isRecurso ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Sim</button>
          <button type="button" onClick={() => { setIsRecurso(false); handleTipoCasoChange("leitura"); }} aria-pressed={!isRecurso} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${!isRecurso ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Não</button>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass}>Qual foi o fato gerador?</label>
        <div className="relative w-full">
          <select value={tipoCaso} onChange={(e) => handleTipoCasoChange(e.target.value as any)} className={`${inputClass.replace("h-10", "h-11")} pl-4 pr-12 font-medium cursor-pointer appearance-none`}>
            {isRecurso ? (
              <>
                <option value="leitura">Leitura</option>
                <option value="servico">Serviço</option>
                <option value="corte_cavalete">Violação de Corte</option>
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {tipoCaso === "servico" && (
        <div className="mt-4 p-4 bg-brand-subtle border border-brand-line rounded-md animate-slideUp">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-brand" />
            <span className="text-sm font-semibold text-ink">O impedimento foi voluntário ou involuntário?</span>
          </div>
          <div className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5 w-max">
            <button type="button" onClick={() => setTipoServico("voluntario")} aria-pressed={tipoServico === "voluntario"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${tipoServico === "voluntario" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Voluntário</button>
            <button type="button" onClick={() => setTipoServico("involuntario")} aria-pressed={tipoServico === "involuntario"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${tipoServico === "involuntario" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Involuntário</button>
          </div>
        </div>
      )}

      {/*APARECE QUANDO É VIOLAÇÃO DE CORTE */}
      {tipoCaso === "corte_cavalete" && (
        <div className="mt-4 p-4 bg-brand-subtle border border-brand-line rounded-md animate-slideUp">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-brand" />
            <span className="text-sm font-semibold text-ink">Qual o tipo de corte?</span>
          </div>
          <div className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5 w-max">
            <button type="button" onClick={() => setTipoCorte("cavalete")} aria-pressed={tipoCorte === "cavalete"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${tipoCorte === "cavalete" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Cavalete</button>
            <button type="button" onClick={() => setTipoCorte("ramal")} aria-pressed={tipoCorte === "ramal"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${tipoCorte === "ramal" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Ramal</button>
          </div>
        </div>
      )}
    </SectionBlock>
  );
}

function Sessao3Veredicto({ state }: { state: ProcessoState }) {
  const {
    showSessao3, numSessao3, hasDecisaoButtons, decisao, handleDecisaoChange, deferirMotivo,
    setDeferirMotivo, setFatoNovoStatus, fatoNovoStatus, faturaQuitada, setFaturaQuitada,
    hasDefesaToggle, historicoDefesa, setHistoricoDefesa,
    tipoCaso, foiMultado, setFoiMultado
  } = state;

  if (!showSessao3) return null;

  return (
    <SectionBlock number={numSessao3} title={hasDecisaoButtons ? "Veredicto Final e Conclusão" : "Análise de Defesa"} description={hasDecisaoButtons ? "Defina o posicionamento formal de mérito da CAJ frente ao recurso" : "Informe se houve apresentação de defesa prévia pelo cliente"} className="animate-fadeIn">
      {hasDecisaoButtons && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <button type="button" aria-pressed={decisao === "deferir"} onClick={() => handleDecisaoChange("deferir")} className={`h-full p-4 rounded-[10px] border-2 text-left transition-colors ${decisao === "deferir" ? "border-success bg-success-soft text-ink" : "border-gray-200 bg-white hover:border-gray-400"}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileCheck className={decisao === "deferir" ? "text-success" : "text-gray-400"} size={20} />
                <span className="font-semibold text-sm">1. Deferir</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">Cancela as penalidades. Padronização realizada cfe protocolo.</p>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" aria-pressed={decisao === "parcial"} onClick={() => handleDecisaoChange("parcial")} className={`h-full p-4 rounded-[10px] border-2 text-left transition-colors ${decisao === "parcial" ? "border-warning bg-warning-soft text-ink" : "border-gray-200 bg-white hover:border-gray-400"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={decisao === "parcial" ? "text-warning" : "text-gray-400"} size={20} />
                <span className="font-semibold text-sm">2. Deferir parcialmente</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">Retira as multas atuais mas concede prorrogação de 90 dias.</p>
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" aria-pressed={decisao === "indeferir"} onClick={() => handleDecisaoChange("indeferir")} className={`h-full p-4 rounded-[10px] border-2 text-left transition-colors ${decisao === "indeferir" ? "border-danger bg-danger-soft text-ink" : "border-gray-200 bg-white hover:border-gray-400"}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileX className={decisao === "indeferir" ? "text-danger" : "text-gray-400"} size={20} />
                <span className="font-semibold text-sm">3. Indeferir</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">Mantém integralmente as penalidades e orienta o parcelamento.</p>
            </button>
          </div>
        </div>
      )}

      {hasDecisaoButtons && decisao === "deferir" && tipoCaso !== "corte_cavalete" && (
        <div className="mt-4 p-4 border border-success-line bg-success-soft rounded-md animate-slideUp">
          <label className="text-sm font-semibold text-success mb-2 block">Motivo do Deferimento</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setDeferirMotivo("la_padronizada"); setFatoNovoStatus(null); }} aria-pressed={deferirMotivo === "la_padronizada"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${deferirMotivo === "la_padronizada" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}>LA Padronizada</button>
            <button type="button" onClick={() => setDeferirMotivo("fato_novo")} aria-pressed={deferirMotivo === "fato_novo"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${deferirMotivo === "fato_novo" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}>Fato Novo ao Processo</button>
          </div>

          {deferirMotivo === "fato_novo" && (
            <div className="mt-4 pt-4 border-t border-success-line animate-fadeIn">
              <label className="text-sm font-semibold text-success mb-2 block">Status do Cliente</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setFatoNovoStatus("notificado")} aria-pressed={fatoNovoStatus === "notificado"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${fatoNovoStatus === "notificado" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}>Notificado</button>
                <button type="button" onClick={() => setFatoNovoStatus("multado")} aria-pressed={fatoNovoStatus === "multado"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${fatoNovoStatus === "multado" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}>Multado</button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasDecisaoButtons && decisao === "deferir" && tipoCaso === "corte_cavalete" && (
         <div className="mt-4 p-4 border border-success-line bg-success-soft rounded-md animate-slideUp">
            <label className="text-sm font-semibold text-success mb-2 block">
              Houve Solicitação para Padronização?
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button" 
                onClick={() => setDeferirMotivo("la_padronizada")} 
                aria-pressed={deferirMotivo === "la_padronizada"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${deferirMotivo === "la_padronizada" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}
              >
                Com Padronização
              </button>
              <button 
                type="button" 
                onClick={() => setDeferirMotivo("sem_padronizacao")} 
                aria-pressed={deferirMotivo === "sem_padronizacao"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${deferirMotivo === "sem_padronizacao" ? "bg-success text-white border-success" : "bg-white text-success border-success-line hover:bg-white/60"}`}
              >
                Não
              </button>
            </div>
         </div>
      )}

      {hasDecisaoButtons && decisao === "parcial" && tipoCaso !== "corte_cavalete" && (
        <div className="mt-4 p-4 border border-warning-line bg-warning-soft rounded-md animate-slideUp">
          <label className="text-sm font-semibold text-warning mb-2 block">A fatura foi quitada?</label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setFaturaQuitada("fatura_quitada")} aria-pressed={faturaQuitada === "fatura_quitada"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${faturaQuitada === "fatura_quitada" ? "bg-warning text-white border-warning" : "bg-white text-warning border-warning-line hover:bg-white/60"}`}>Fatura Quitada</button>
            <button type="button" onClick={() => setFaturaQuitada("fatura_nao_quitada")} aria-pressed={faturaQuitada === "fatura_nao_quitada"} className={`h-9 px-4 text-xs font-semibold rounded-md transition-colors border ${faturaQuitada === "fatura_nao_quitada" ? "bg-warning text-white border-warning" : "bg-white text-warning border-warning-line hover:bg-white/60"}`}>Não Quitada</button>
          </div>
        </div>
      )}

      {hasDefesaToggle && (
        <div className={hasDecisaoButtons ? "mt-6 pt-6 border-t border-gray-100 animate-fadeIn space-y-4" : "space-y-4"}>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-md px-4 py-3">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-ink-body">Houve defesa prévia?</span>
            </div>
            <div className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5">
              <button type="button" onClick={() => setHistoricoDefesa("com_defesa")} aria-pressed={historicoDefesa === "com_defesa"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${historicoDefesa === "com_defesa" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Sim</button>
              <button type="button" onClick={() => setHistoricoDefesa("sem_defesa")} aria-pressed={historicoDefesa === "sem_defesa"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${historicoDefesa === "sem_defesa" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Não</button>
            </div>
          </div>

          {/*MULTA APLICADA */}
          {tipoCaso === "corte_cavalete" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <span className="text-sm font-medium text-ink-body">A multa já foi aplicada?</span>
              </div>
              <div className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5">
                <button type="button" onClick={() => setFoiMultado("sim")} aria-pressed={foiMultado === "sim"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${foiMultado === "sim" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Sim</button>
                <button type="button" onClick={() => setFoiMultado("nao")} aria-pressed={foiMultado === "nao"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${foiMultado === "nao" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Apenas Notificado</button>
              </div>
            </div>
          )}

        </div>
      )}
    </SectionBlock>
  );
}

function Sessao4Variaveis({ state }: { state: ProcessoState }) {
  const {
    numSessao4, showDataGeracaoAI, dataGeracaoAI, setDataGeracaoAI, showMesesSemAcesso,
    mesesSemAcesso, setMesesSemAcesso, showDataConstatacao, dataConstatacaoInfracao,
    setDataConstatacaoInfracao, showProtServico, protServico, setProtServico, showRecebedorAR,
    recebedorCorreios, setRecebedorCorreios, showDataRecebimentoAR, dataRecebimentoAR,
    setDataRecebimentoAR, showDataAplicacaoSancao, dataAplicacaoSancao, setDataAplicacaoSancao,
    showDataDecisaoAnterior, dataDecisaoAnterior, setDataDecisaoAnterior, showFaturaReferencia,
    faturaReferencia, setFaturaReferencia, showDefesaCampos, dataDefesa, setDataDefesa,
    protDefesa, setProtDefesa, dataIndeferimento, setDataIndeferimento, protIndeferimento,
    setProtIndeferimento, showDataRecebimentoAI, dataRecebimentoAI, setDataRecebimentoAI,
    showTipoRecebimentoAI, tipoRecebimentoAI, setTipoRecebimentoAI
  } = state;

  return (
    <SectionBlock number={numSessao4} title="Variáveis e Datas da Irregularidade" description="Apenas os campos pertinentes a esta infração estão sendo exibidos abaixo">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {showDataGeracaoAI && (
          <div>
            <label className={labelClass}>Data Geração A.I.</label>
            <DatePicker value={dataGeracaoAI} onChange={setDataGeracaoAI} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showMesesSemAcesso && (
          <div>
            <label className={`${labelClass} !text-brand`}>Meses sem acesso</label>
            <MonthYearRangePicker value={mesesSemAcesso} onChange={setMesesSemAcesso} placeholder="Ex: Jan/2026 a Mar/2026" />
          </div>
        )}
        {showDataConstatacao && (
          <div>
            <label className={`${labelClass} !text-warning`}>Data Constatação/Imped.</label>
            <DatePicker value={dataConstatacaoInfracao} onChange={setDataConstatacaoInfracao} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showProtServico && (
          <div>
            <label className={`${labelClass} !text-warning`}>Nº Prot. Serviço/Fiscaliz.</label>
            <input value={protServico} onChange={(e) => setProtServico(e.target.value)} placeholder="Ex: 1234567" className={`${inputClass} !bg-warning-soft/50 !border-warning-line focus:!border-warning focus:!ring-warning/15`} />
          </div>
        )}
        {showRecebedorAR && (
          <div>
            <label className={labelClass}>Recebedor do A.I. (AR)</label>
            <input value={recebedorCorreios} onChange={(e) => setRecebedorCorreios(e.target.value)} placeholder="Nome de quem assinou" className={inputClass} />
          </div>
        )}
        {showDataRecebimentoAR && (
          <div>
            <label className={labelClass}>Data Recebimento AR</label>
            <DatePicker value={dataRecebimentoAR} onChange={setDataRecebimentoAR} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showDataAplicacaoSancao && (
          <div>
            <label className={labelClass}>Data Aplicação Sanções</label>
            <DatePicker value={dataAplicacaoSancao} onChange={setDataAplicacaoSancao} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showDataDecisaoAnterior && (
          <div>
            <label className={labelClass}>Data Decisão Anterior</label>
            <DatePicker value={dataDecisaoAnterior} onChange={setDataDecisaoAnterior} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showFaturaReferencia && (
          <div>
            <label className={labelClass}>Fatura (Competência)</label>
            <MonthYearPicker value={faturaReferencia} onChange={setFaturaReferencia} placeholder="MM/AAAA" size="md" />
          </div>
        )}

        {showDefesaCampos && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <span className="text-sm font-semibold text-ink flex items-center gap-2">
                <Scale size={15} className="text-brand" /> Dados da defesa prévia
              </span>
            </div>
            <div>
              <label className={labelClass}>Data da Defesa</label>
              <DatePicker value={dataDefesa} onChange={setDataDefesa} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelClass}>Nº Prot. Defesa</label>
              <input value={protDefesa} onChange={(e) => setProtDefesa(e.target.value)} placeholder="0000.0000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data Indeferimento</label>
              <DatePicker value={dataIndeferimento} onChange={setDataIndeferimento} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label className={labelClass}>Nº Prot. Indeferimento</label>
              <input value={protIndeferimento} onChange={(e) => setProtIndeferimento(e.target.value)} placeholder="0000.0000" className={inputClass} />
            </div>
          </div>
        )}

        {showDataRecebimentoAI && (
          <div>
            <label className={labelClass}>Data Recebimento A.I.</label>
            <DatePicker value={dataRecebimentoAI} onChange={setDataRecebimentoAI} placeholder="DD/MM/AAAA" />
          </div>
        )}
        {showTipoRecebimentoAI && (
          <div>
            <label className={labelClass}>Tipo Recebimento A.I.</label>
            <select value={tipoRecebimentoAI} onChange={(e) => setTipoRecebimentoAI(e.target.value)} className={inputClass}>
              <option value="Correios">Correios</option>
              <option value="Fiscais da CAJ">Fiscais da CAJ</option>
            </select>
          </div>
        )}
      </div>
    </SectionBlock>
  );
}

function SessaoExportacao({ state }: { state: ProcessoState }) {
  const {
    handleGenerateParecer, hasDecisaoButtons, decisao, isDeferirIncomplete, isParcialIncomplete,
    matricula, step, reviewMode, setReviewMode, generatedText, setGeneratedText, textAreaRef,
    renderFormattedPreview, handleCopy, copied, handleDownloadPDF, handleDownloadWord, numSessao5
  } = state;

  return (
    <>
      <Button
        size="lg"
        icon={Sparkles}
        className="w-full"
        onClick={handleGenerateParecer}
        disabled={(hasDecisaoButtons && !decisao) || isDeferirIncomplete || isParcialIncomplete || !matricula}
      >
        Emitir minuta de parecer oficial
      </Button>

      {step === "generated" && (
        <>
          <SectionBlock
            icon={CheckCircle2}
            title="Revisão e Edição do Parecer"
            description={reviewMode === "preview" ? "Assim ficará o texto final. Clique em \"Editar\" para ajustar algum detalhe." : "Modo de edição: use **palavra** para marcar negrito."}
            className={`animate-slideUp ${decisao === "deferir" ? "!border-success-line" : decisao === "parcial" ? "!border-warning-line" : decisao === "indeferir" ? "!border-danger-line" : "!border-gray-200"}`}
            headerAction={
              <div className="flex items-center gap-2 mt-3 md:mt-0 w-full justify-between md:justify-end">
                <Button variant="secondary" size="sm" onClick={() => setReviewMode(reviewMode === "preview" ? "edit" : "preview")}>
                  {reviewMode === "preview" ? "Editar" : "Visualizar"}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleCopy} className={copied ? "!text-success !border-success-line" : "text-brand"}>
                  {copied ? <><CheckCircle2 size={14} /> Copiado</> : <><Copy size={14} /> Copiar texto</>}
                </Button>
              </div>
            }
          >
            {reviewMode === "preview" ? (
              <div onClick={() => setReviewMode("edit")} title="Clique para editar" className="w-full min-h-96 p-5 bg-gray-50 border border-gray-200 rounded-md text-[13px] text-ink leading-relaxed whitespace-pre-wrap cursor-text transition-colors hover:border-brand/40 hover:bg-white">
                {renderFormattedPreview(generatedText)}
              </div>
            ) : (
              <textarea
                ref={textAreaRef} autoFocus value={generatedText} onChange={(e) => setGeneratedText(e.target.value)} onBlur={() => setReviewMode("preview")}
                className={`${textareaClass} h-96 p-5 font-mono text-[13px] resize-none`}
              />
            )}
          </SectionBlock>

          <SectionBlock number={numSessao5} title="Exportação e Entrega" description="Baixe o arquivo formatado em Microsoft Word ou PDF" className="animate-slideUp">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" size="lg" icon={File} className="flex-1" onClick={handleDownloadPDF}>
                Baixar em PDF
              </Button>
              <Button size="lg" icon={FileText} className="flex-1" onClick={handleDownloadWord}>
                Baixar como Word (.doc)
              </Button>
            </div>
          </SectionBlock>
        </>
      )}
    </>
  );
}

function GuiaSansys({ state }: { state: ProcessoState }) {
  const {
    guiaSansysOpen, setGuiaSansysOpen, canalResposta, setCanalResposta, clienteEmail, setClienteEmail,
    clienteTelefone, setClienteTelefone, aplicaIN83, setAplicaIN83, faturaAlterada, setFaturaAlterada,
    temRestituicao, setTemRestituicao, tipoIndeferido, setTipoIndeferido, statusMulta426, setStatusMulta426,
    numProcesso, decisao, numAutoInfracao, protContatoAtivo, setProtContatoAtivo, morador, generatedText,
    tipoCaso, stripBoldMarkers, getParte2Text, getParte1Text
  } = state;

  return (
    <section className="bg-white rounded-[10px] border border-brand-line overflow-hidden">
      <button type="button" onClick={() => setGuiaSansysOpen(!guiaSansysOpen)} aria-expanded={guiaSansysOpen} className="w-full px-6 h-16 flex items-center justify-between bg-brand-subtle hover:bg-brand-soft transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-md bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
            <MessageSquare size={16} />
          </span>
          <h2 className="text-ink font-semibold text-base">Tratativas de resposta: guia Sansys</h2>
        </div>
        {guiaSansysOpen ? <ChevronUp size={18} className="text-brand" /> : <ChevronDown size={18} className="text-brand" />}
      </button>

      {guiaSansysOpen && (
        <div className="p-6 space-y-6 border-t border-brand-line animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <label className={labelClass}>Canal de Resposta</label>
              <div className="relative w-full">
                <select value={canalResposta} onChange={(e) => setCanalResposta(e.target.value)} className={`${inputClass} pr-9 appearance-none cursor-pointer`}>
                  <option value="email">Apenas E-mail</option>
                  <option value="telefone">Apenas Telefone</option>
                  <option value="ambos">E-mail e Telefone</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>E-mail do Cliente</label>
              <input value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} disabled={canalResposta === "telefone"} />
            </div>
            <div>
              <label className={labelClass}>Telefone do Cliente</label>
              <input value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} placeholder="(47) 99999-9999" className={inputClass} disabled={canalResposta === "email"} />
            </div>
            <div>
              <label className={labelClass}>Aplica IN 83/2025?</label>
              <div className="relative w-full">
                <select value={aplicaIN83 ? "sim" : "nao"} onChange={(e) => setAplicaIN83(e.target.value === "sim")} className={`${inputClass} pr-9 appearance-none cursor-pointer`}>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className={`${labelClass} !text-success`}>Fatura Alterada?</label>
              <div className="relative w-full">
                <select value={faturaAlterada ? "sim" : "nao"} onChange={(e) => setFaturaAlterada(e.target.value === "sim")} className={`${inputClass} pr-9 appearance-none cursor-pointer !bg-success-soft !border-success-line focus:!border-success focus:!ring-success/15`}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-success">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {(decisao === "deferir" || decisao === "parcial") && (
              <div>
                <label className={`${labelClass} !text-success`}>Restituição de Multa?</label>
                <div className="relative w-full">
                  <select value={temRestituicao ? "sim" : "nao"} onChange={(e) => setTemRestituicao(e.target.value === "sim")} className={`${inputClass} pr-9 appearance-none cursor-pointer !bg-success-soft !border-success-line focus:!border-success focus:!ring-success/15`}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim (Solicitar restituição)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-success">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {decisao === "indeferir" && (
              <div>
                <label className={`${labelClass} !text-danger`}>Motivo Indeferimento</label>
                <select value={tipoIndeferido} onChange={(e) => setTipoIndeferido(e.target.value)} className={`${inputClass} cursor-pointer !bg-danger-soft !border-danger-line focus:!border-danger focus:!ring-danger/15`}>
                  <option value="padrao">Padrão (Fatura inalterada)</option>
                  <option value="in83_aceite">IN83 - Aceite padronizar</option>
                  <option value="in83_expirado">IN83 - Prazo expirado</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelClass}>Status (Para Cód 426)</label>
              <div className="relative w-full">
                <select value={statusMulta426} onChange={(e) => setStatusMulta426(e.target.value)} className={`${inputClass} pr-9 appearance-none cursor-pointer`}>
                  <option value="aplicada">Multa Aplicada</option>
                  <option value="notificacao">Em processo de notificação</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {faturaAlterada && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden animate-fadeIn">
                <div className="bg-gray-50 px-4 h-10 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Alteração de Fatura - Cód 10024 / 10082</span>
                </div>
                <div className="p-4 space-y-3">
                  {(decisao === "deferir" || decisao === "parcial") && (
                    <p className="text-xs text-warning leading-relaxed"><strong>Atenção:</strong> Somar 20 dias úteis para o vencimento da nova fatura após a data da decisão.</p>
                  )}
                  <div>
                    <span className="text-xs font-medium text-ink-muted mb-1.5 block">Para geração do cód 10082 (ou cancelamento 10024):</span>
                    <EditableCopyBlock defaultText={`Solicitante: Recurso Prot ${numProcesso || "[PROCESSO]"}\nDescrição: ${stripBoldMarkers(getParte2Text(false))}`} />
                  </div>
                  <div className="px-3 py-2 bg-brand-soft border border-brand-line rounded-md flex items-center gap-2">
                    <Info size={14} className="text-brand flex-shrink-0" />
                    <span className="text-xs font-medium text-brand">
                      <strong>Motivo do Cancelamento:</strong> {decisao === "indeferir" ? "Reclamação Infundada/Improcedente" : "Alteração de código de serviço no Sansys"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-warning-soft border border-warning-line border-l-4 border-l-warning rounded-md p-4">
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-sm font-semibold text-warning mb-2">Lembrete: anexos no Sansys (3773)</span>
                  <ul className="list-disc pl-4 text-xs text-ink-body space-y-1.5 leading-relaxed">
                    <li>Anexar PDF da resposta do Recurso <strong>em todos os casos, mesmo que não haja alteração de fatura.</strong></li>
                    <li>Anexar PDF da fatura corrigida,<strong> apenas casos de retorno por telefone.</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 h-10 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Encerramento no Sansys - 3773</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className="text-xs font-medium text-ink-muted mb-1.5 block">Texto para encerrar:</span>
                  <EditableCopyBlock defaultText={`${getParte1Text()}\n${stripBoldMarkers(getParte2Text(true))}`} />
                </div>
                {(canalResposta === "telefone" || canalResposta === "ambos") && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-brand mb-1.5 flex items-center gap-1.5">
                      <Clock size={12} /> Desdobrar o Contato Ativo - 1170
                    </span>
                    <EditableCopyBlock defaultText={`Informar cliente Telefone: ${clienteTelefone || "[TELEFONE]"} sobre Retorno de Recurso ${numProcesso || "[PROCESSO]"}`} />
                  </div>
                )}
              </div>
            </div>

            {tipoCaso !== "la_cadastral" && decisao !== "deferir" && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 h-10 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Geração cód. 426 – Prorrogação de prazo</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-warning leading-relaxed"><strong>Atenção:</strong> Para processos menores que 90 dias, atrasar a data e hora para ser próximo a data de reanálise do processo pelo fiscal interno.</p>
                  <EditableCopyBlock defaultText={`Solicitante: Recurso Prot ${numProcesso || "[PROCESSO]"}\nDescrição:\nCliente notificado${statusMulta426 === "aplicada" ? " e multado" : ""}, apresentou recurso ref. A.I. ${numAutoInfracao || "[A.I.]"}.\nNovo prazo para padronização vence em: ${get60BusinessDaysFromToday()}.`} />
                  <div className="px-3 py-2 bg-brand-soft border border-brand-line rounded-md flex items-center gap-2">
                    <Info size={14} className="text-brand flex-shrink-0" />
                    <span className="text-xs font-medium text-brand">Não esquecer de notificar o analista do auto de infração.</span>
                  </div>
                </div>
              </div>
            )}

            {(canalResposta === "email" || canalResposta === "ambos") && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 h-10 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Confecção de E-mail Resposta</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-warning leading-relaxed"><strong>Atenção: </strong>Lembre-se de anexar a fatura (se houver alteração).</p>
                  <EditableCopyBlock defaultText={`TÍTULO: Retorno de Recurso\n\nBom dia/Boa tarde Sr./Sra. ${morador || "[CLIENTE]"},\n\nEncaminhamos retorno referente recurso apresentado, conforme segue:\n\n${stripBoldMarkers(generatedText) || '[COLE AQUI A MINUTA OFICIAL GERADA ABAIXO]'}`} />
                  <div className="px-3 py-2 bg-brand-soft border border-brand-line rounded-md flex items-center gap-2">
                    <Info size={14} className="text-brand flex-shrink-0" />
                    <span className="text-xs font-medium text-brand">Solicitar confirmação de entrega e leitura no e-mail - <strong>antes de enviar.</strong></span>
                  </div>
                </div>
              </div>
            )}

            {(canalResposta === "telefone" || canalResposta === "ambos") && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 h-10 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">Abertura cód. 1073</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="mb-3">
                    <label className={labelClass}>Nº Prot. Contato Ativo</label>
                    <input value={protContatoAtivo} onChange={(e) => setProtContatoAtivo(e.target.value)} placeholder="Ex: 112233" className={`${inputClass} sm:w-1/3`} />
                  </div>
                  <p className="text-xs text-warning leading-relaxed mt-2"><strong>Atenção:</strong> Serve para priorizar cód. 1170: para contato ativo do Retorno de Recurso (quando canal de retorno por Telefone/Whatsapp)</p>
                  <span className="text-xs font-medium text-ink-muted mb-1.5 block">Texto para abertura:</span>
                  <EditableCopyBlock defaultText={`Solicitante: Contato Ativo Prot ${protContatoAtivo || "[PROT CONTATO]"}\nDescrição: Por gentileza, efetuar o Contato Ativo, prot. ${protContatoAtivo || "[PROT CONTATO]"}, relativo Retorno de Recurso ${numProcesso || "[RECURSO]"}.`} />
                  <div className="px-3 py-2 bg-brand-soft border border-brand-line rounded-md flex items-center gap-2">
                    <Info size={14} className="text-brand flex-shrink-0" />
                    <span className="text-xs font-medium text-brand"><strong>Para atenção ao setor de atendimento - </strong>não esquecer de anexar a fatura, se houver alteração.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}