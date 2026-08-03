// src/pages/ouvidoria/ProcessoOuvidoria.tsx
import {
  Sparkles, Copy, CheckCircle2, Scale, FileCheck, FileX, Clock, 
  HelpCircle, FileText, File, Info, ChevronDown, ChevronUp, 
  MessageSquare, Calculator, X
} from "lucide-react";

// Importes de utilitários mantidos para uso direto nos inputs/textos
import { get60BusinessDaysFromToday } from "../../utils/dates";
import { formatName } from "../../utils/masks";

// Importes de componentes UI
import { DatePicker } from "../../components/shared/DatePicker";
import { MonthYearPicker } from "../../components/shared/MonthYearPicker";
import { MonthYearRangePicker } from "../../components/shared/MonthYearRangePicker";
import { SectionBlock } from "../../components/shared/SectionBlock";

// 1. Nosso subcomponente isolado
import { EditableCopyBlock } from "../../components/ouvidoria/EditableCopyBlock";

// 2. Nosso super hook!
import { useProcessoOuvidoria } from "../../hooks/useProcessoOuvidoria";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function ProcessoOuvidoria() {
  // 3. Extraindo tudo do nosso cérebro centralizado
  const {
    step, setStep, copied, reviewMode, setReviewMode, generatedText, setGeneratedText,
    textAreaRef, calculatorRef, showCalculator, setShowCalculator, funcSearchOpen, setFuncSearchOpen,
    guiaSansysOpen, setGuiaSansysOpen, isRecurso, setIsRecurso, historicoDefesa, setHistoricoDefesa,
    matricula, setMatricula, morador, setMorador, tipoManifestacao, setTipoManifestacao,
    numProcesso, setNumProcesso, numAutoInfracao, setNumAutoInfracao, dataEmissaoFatura, setDataEmissaoFatura,
    dataManifestacao, setDataManifestacao, funcionario, setFuncionario, funcionarioBusca, setFuncionarioBusca,
    tipoCaso, setTipoCaso, decisao, setDecisao, tipoServico, setTipoServico, deferirMotivo, setDeferirMotivo,
    fatoNovoStatus, setFatoNovoStatus, faturaQuitada, setFaturaQuitada, dataGeracaoAI, setDataGeracaoAI,
    mesesSemAcesso, setMesesSemAcesso, dataConstatacaoInfracao, setDataConstatacaoInfracao,
    protServico, setProtServico, recebedorCorreios, setRecebedorCorreios, dataRecebimentoAR, setDataRecebimentoAR,
    dataAplicacaoSancao, setDataAplicacaoSancao, dataDecisaoAnterior, setDataDecisaoAnterior,
    faturaReferencia, setFaturaReferencia, dataDefesa, setDataDefesa, protDefesa, setProtDefesa,
    dataIndeferimento, setDataIndeferimento, protIndeferimento, setProtIndeferimento,
    dataRecebimentoAI, setDataRecebimentoAI, tipoRecebimentoAI, setTipoRecebimentoAI, canalResposta, setCanalResposta,
    clienteEmail, setClienteEmail, clienteTelefone, setClienteTelefone, aplicaIN83, setAplicaIN83,
    temRestituicao, setTemRestituicao, statusMulta426, setStatusMulta426, tipoIndeferido, setTipoIndeferido,
    protContatoAtivo, setProtContatoAtivo, faturaAlterada, setFaturaAlterada, calcPrazo, setCalcPrazo,
    calcCustomPrazo, setCalcCustomPrazo, calcDataInicial, setCalcDataInicial, calcDataFinal, diasUteisDif,
    isForaDoPrazo, filteredFuncionarios, funcionarioSelecionado, isLeitura, isServico, isCorte, isHd,
    isBypass, isClandestina, isPadronizada, isCadastral, isProrrogacao, showSessao3, hasDecisaoButtons,
    hasDefesaToggle, numSessao3, numSessao4, numSessao5, showDataGeracaoAI, showMesesSemAcesso, showDataConstatacao,
    showProtServico, showRecebedorAR, showDataRecebimentoAR, showDataAplicacaoSancao, showDataDecisaoAnterior,
    showFaturaReferencia, showDefesaCampos, showTipoRecebimentoAI, showDataRecebimentoAI, isDeferirIncomplete,
    isParcialIncomplete, handleTipoCasoChange, handleDecisaoChange, getParte1Text, getParte2Text,
    handleGenerateParecer, handleDownloadPDF, handleDownloadWord, handleCopy, renderFormattedPreview, stripBoldMarkers
  } = useProcessoOuvidoria();

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
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Data Inicial</label>
                  <DatePicker value={calcDataInicial} onChange={setCalcDataInicial} placeholder="DD/MM/AAAA" />
                </div>

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
          <SectionBlock
            number={1}
            title="Dados Globais da Manifestação"
            description="Insira os dados cadastrais básicos obtidos na triagem do manifesto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nº do Processo / Manifesto</label>
                <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} placeholder="Protocolo de recurso" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Auto de Infração (A.I.) Vinculado</label>
                <input value={numAutoInfracao} onChange={(e) => setNumAutoInfracao(e.target.value)} placeholder="Ex: XXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
              </div>
              {/* CAMPO FUNCIONÁRIO NO BLOCO 1 */}
              <div className="relative">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Analista Responsável</label>
                <input
                  value={funcionario ? `${funcionario}` : funcionarioBusca}
                  onChange={(e) => {
                    setFuncionario("");
                    setFuncionarioBusca(e.target.value);
                    setFuncSearchOpen(true);
                  }}
                  onFocus={() => {
                    if (funcionario) {
                      setFuncionarioBusca("");
                    }
                    setFuncSearchOpen(true);
                  }}
                  onBlur={() => setTimeout(() => setFuncSearchOpen(false), 200)}
                  placeholder="Pesquisar por nome..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]"
                />
                {funcionarioSelecionado && !funcSearchOpen && (
                  <p className="mt-1 text-[10px] text-gray-500 truncate">{funcionarioSelecionado.matricula}</p>
                )}
                {funcSearchOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {filteredFuncionarios.map((f) => (
                      <div
                        key={f.nome}
                        className="px-3 py-2 flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-[#f0f7ff] hover:text-[#1a5fa8] cursor-pointer transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFuncionario(String(f.nome));
                          setFuncionarioBusca("");
                          setFuncSearchOpen(false);
                        }}
                      >
                        <span className="truncate">{f.nome}</span>
                        <span className="text-[10px] font-mono font-bold text-[#1a5fa8] flex-shrink-0">Mat. {f.matricula}</span>
                      </div>
                    ))}
                    {filteredFuncionarios.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">Nenhum funcionário encontrado</div>
                    )}
                  </div>
                )}
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
            {dataManifestacao && dataEmissaoFatura && !isForaDoPrazo && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  PROCESSO DENTRO DO PRAZO ({diasUteisDif} dias úteis).
                </span>
              </div>
            )}
          </SectionBlock>

          {/* SESSÃO 2: TIPO DE INFRAÇÃO */}
          <SectionBlock
            number={2}
            title="Tipo de Infração (Objeto)"
            description="Selecione o enquadramento do fato gerador do auto de infração"
          >
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
              onChange={(e) => handleTipoCasoChange(e.target.value as any)}
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
          </SectionBlock>

          {/* SESSÃO 3: VEREDICTO DE MÉRITO / ANÁLISE DE DEFESA */}
          {showSessao3 && (
            <SectionBlock
              number={numSessao3}
              title={hasDecisaoButtons ? "Veredicto Final e Conclusão" : "Análise de Defesa"}
              description={hasDecisaoButtons ? "Defina o posicionamento formal de mérito da CAJ frente ao recurso" : "Informe se houve apresentação de defesa prévia pelo cliente"}
              className="animate-fadeIn"
            >
              {hasDecisaoButtons && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecisaoChange("deferir")}
                      className={`h-full p-4 rounded-xl border-2 text-left transition-all ${decisao === "deferir" ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck className={decisao === "deferir" ? "text-emerald-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">1. Deferir (Retificar)</span>
                      </div>
                      <p className="text-xs text-gray-500">Cancela as penalidades. Padronização realizada cfe protocolo.</p>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecisaoChange("parcial")}
                      className={`h-full p-4 rounded-xl border-2 text-left transition-all ${decisao === "parcial" ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={decisao === "parcial" ? "text-amber-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">2. Deferir Parcialmente</span>
                      </div>
                      <p className="text-xs text-gray-500">Retira as multas atuais mas concede prorrogação de 90 dias.</p>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecisaoChange("indeferir")}
                      className={`h-full p-4 rounded-xl border-2 text-left transition-all ${decisao === "indeferir" ? "border-red-500 bg-red-50 text-red-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileX className={decisao === "indeferir" ? "text-red-600" : "text-gray-400"} size={20} />
                        <span className="font-bold text-sm">3. Indeferir (Ratificar)</span>
                      </div>
                      <p className="text-xs text-gray-500">Mantém integralmente as penalidades e orienta o parcelamento.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* OPÇÕES EXTRAS PARA DEFERIR (Fato Novo / LA) */}
              {hasDecisaoButtons && decisao === "deferir" && (
                <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl animate-fadeIn">
                  <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 block">Motivo do Deferimento</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => { setDeferirMotivo("la_padronizada"); setFatoNovoStatus(null); }}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${deferirMotivo === "la_padronizada" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                    >
                      LA Padronizada
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeferirMotivo("fato_novo")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${deferirMotivo === "fato_novo" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                    >
                      Fato Novo ao Processo
                    </button>
                  </div>

                  {deferirMotivo === "fato_novo" && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/50 animate-fadeIn">
                      <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 block">Status do Cliente</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setFatoNovoStatus("notificado")}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${fatoNovoStatus === "notificado" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                        >
                          Notificado
                        </button>
                        <button
                          type="button"
                          onClick={() => setFatoNovoStatus("multado")}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${fatoNovoStatus === "multado" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
                        >
                          Multado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OPÇÕES EXTRAS PARA DEFERIR PARCIALMENTE (Fatura Quitada) */}
              {hasDecisaoButtons && decisao === "parcial" && (
                <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-xl animate-fadeIn">
                  <label className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2 block">A fatura foi quitada?</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFaturaQuitada("fatura_quitada")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${faturaQuitada === "fatura_quitada" ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-white text-amber-700 border-amber-200 hover:bg-amber-100"}`}
                    >
                      Fatura Quitada
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaturaQuitada("fatura_nao_quitada")}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${faturaQuitada === "fatura_nao_quitada" ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-white text-amber-700 border-amber-200 hover:bg-amber-100"}`}
                    >
                      Não Quitada
                    </button>
                  </div>
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
            </SectionBlock>
          )}

          {/* SESSÃO 4: REQUISITOS VARIÁVEIS */}
          <SectionBlock
            number={numSessao4}
            title="Variáveis e Datas da Irregularidade"
            description="Apenas os campos pertinentes a esta infração estão sendo exibidos abaixo"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {showDataGeracaoAI && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Geração A.I.</label>
                  <DatePicker value={dataGeracaoAI} onChange={setDataGeracaoAI} placeholder="DD/MM/AAAA" />
                </div>
              )}

              {showMesesSemAcesso && (
                <div>
                  <label className="block text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-1">Meses sem acesso</label>
                  <MonthYearRangePicker value={mesesSemAcesso} onChange={setMesesSemAcesso} placeholder="Ex: Jan/2026 a Mar/2026" />
                </div>
              )}

              {showDataConstatacao && (
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Data Constatação/Imped.</label>
                  <DatePicker value={dataConstatacaoInfracao} onChange={setDataConstatacaoInfracao} placeholder="DD/MM/AAAA" />
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
                  <DatePicker value={dataRecebimentoAR} onChange={setDataRecebimentoAR} placeholder="DD/MM/AAAA" />
                </div>
              )}

              {showDataAplicacaoSancao && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Aplicação Sanções</label>
                  <DatePicker value={dataAplicacaoSancao} onChange={setDataAplicacaoSancao} placeholder="DD/MM/AAAA" />
                </div>
              )}

              {showDataDecisaoAnterior && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Decisão Anterior</label>
                  <DatePicker value={dataDecisaoAnterior} onChange={setDataDecisaoAnterior} placeholder="DD/MM/AAAA" />
                </div>
              )}

              {showFaturaReferencia && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fatura (Competência)</label>
                  <MonthYearPicker value={faturaReferencia} onChange={setFaturaReferencia} placeholder="MM/AAAA" size="md" />
                </div>
              )}
              
              {showDefesaCampos && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 mb-1">
                    <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale size={14} /> Dados da Defesa Prévia
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-1">Data da Defesa</label>
                    <DatePicker value={dataDefesa} onChange={setDataDefesa} placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-1">Nº Prot. Defesa</label>
                    <input value={protDefesa} onChange={(e) => setProtDefesa(e.target.value)} placeholder="Ex: 998877" className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-1">Data Indeferimento</label>
                    <DatePicker value={dataIndeferimento} onChange={setDataIndeferimento} placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mb-1">Nº Prot. Indeferimento</label>
                    <input value={protIndeferimento} onChange={(e) => setProtIndeferimento(e.target.value)} placeholder="Ex: 112233" className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-white transition-all" />
                  </div>
                </div>
              )}

              {/* NOVOS CAMPOS - CONDICIONAIS NA SESSÃO 4 */}
              {showDataRecebimentoAI && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Recebimento A.I.</label>
                  <DatePicker value={dataRecebimentoAI} onChange={setDataRecebimentoAI} placeholder="DD/MM/AAAA" />
                </div>
              )}
              {showTipoRecebimentoAI && (
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
              )}

            </div>
          </SectionBlock>

          <button
            onClick={handleGenerateParecer}
            disabled={(hasDecisaoButtons && !decisao) || isDeferirIncomplete || isParcialIncomplete || !matricula}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles size={18} />
            Emitir Minuta de Parecer Oficial
          </button>

          {/* ÁREA DE EXIBIÇÃO E EXPORTAÇÃO DA MINUTA */}
          {step === "generated" && (
            <>
              {/* Bloco de Revisão e Edição */}
              <SectionBlock
                icon={CheckCircle2}
                title="Revisão e Edição do Parecer"
                description={reviewMode === "preview" ? "Assim ficará o texto final. Clique em \"Editar\" para ajustar algum detalhe." : "Modo de edição: use **palavra** para marcar negrito."}
                className={`animate-fadeIn ${
                  decisao === "deferir" ? "!border-emerald-200" :
                  decisao === "parcial" ? "!border-amber-200" :
                  decisao === "indeferir" ? "!border-red-200" :
                  "!border-gray-200"
                }`}
                headerAction={
                  <div className="flex items-center gap-2 mt-3 md:mt-0 w-full justify-between md:justify-end">
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
                }
              >
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
              </SectionBlock>

              {/* Bloco de Exportação */}
              <SectionBlock 
                number={numSessao5} 
                title="Exportação e Entrega" 
                description="Baixe o arquivo formatado em Microsoft Word ou PDF" 
                className="animate-fadeIn"
              >
                <div className="flex flex-col sm:flex-row gap-3">
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
              </SectionBlock>
            </>
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
                            Anexar PDF da resposta do Recurso <strong className="text-red-700">em todos os casos, mesmo que não haja alteração de fatura.</strong>
                          </li>
                          <li>
                            Anexar PDF da fatura corrigida,<strong className="text-red-700"> apenas casos de retorno por telefone.</strong>
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