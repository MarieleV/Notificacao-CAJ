import React, { Component, ErrorInfo, ReactNode, useRef } from "react";
import {
  Sparkles, Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Loader2, Info, Key, Search, UserCheck, Eraser,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";

import { DatePicker } from "../components/shared/DatePicker";
import { SectionBlock } from "../components/shared/SectionBlock";
import { CATEGORY_COLORS } from "../services/notificacoes";
import { useRedatorNotificacao, FileModalState } from "../hooks/useRedatorNotificacao";

// Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 4: Error Boundary interno
class ComponenteProtegido extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado no React DOM:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 text-center animate-fadeIn">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-[#0b1e35]">A interface foi interrompida</h2>
          <p className="text-gray-500 mt-2 mb-6">Uma extensão do seu navegador alterou a estrutura da página.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#1a5fa8] text-white rounded-xl font-bold shadow-md">
            Recarregar Redator
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── COMPONENTE PRINCIPAL (Envelopado) ────────────────────────────────────────────────────
export function RedatorNotificacao() {
  return (
    <ComponenteProtegido>
      <RedatorNotificacaoConteudo />
    </ComponenteProtegido>
  );
}

function RedatorNotificacaoConteudo() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const hook = useRedatorNotificacao();

  return (
    <div className="h-full flex flex-col">
      <LoadingOverlay visible={hook.fileLoading} />
      <FeedbackModal modal={hook.fileModal} onClose={() => hook.setFileModal(null)} />
      
      <Cabecalho apiKey={hook.apiKey} setApiKey={hook.setApiKey} limparTela={hook.limparTela} />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* ================= BLOCO 1: CÓDIGOS ================= */}
          <SectionBlock number={1} title="Seleção de Códigos de Infração" description="Selecione um ou mais códigos referentes ao caso do cliente">
            <MenuDropdownCodigos hook={hook} />

            {hook.selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {hook.selectedItems.map((item) => (
                  // Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 3 (Keys seguras)
                  <div key={`badge-${item.code}`} className="flex items-center gap-1.5 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-mono font-bold text-[#1a5fa8]"><span>{item.code}</span></span>
                    <span className="text-xs text-[#0b1e35]"><span>{item.title}</span></span>
                    <button onClick={() => hook.toggleCode(item.code)} className="text-[#4a7fa5] hover:text-red-500 transition-colors ml-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <SeletorPenalidade variante={hook.penaltyVariant} setVariante={hook.setPenaltyVariant} />

            {hook.selectedItems.length > 0 && (
              <PreviaClausulas itens={hook.selectedItems} variante={hook.penaltyVariant} />
            )}
          </SectionBlock>


          {/* ================= BLOCO 2: DADOS ================= */}
          <SectionBlock number={2} title="Dados da Notificação" description="Insira a Matrícula para buscar o cliente automaticamente">
            
            <PainelUploadPlanilha 
              fileLoading={hook.fileLoading} 
              fileName={hook.fileName} 
              onUpload={hook.handleFileUpload}
              title="1. Base de Dados do Cliente"
              subtitle="Planilha para busca automática de dados cadastrais por matrícula."
              inputId="upload-base-cliente"
            />

            <PainelUploadPlanilha 
              fileLoading={hook.fileLoading} 
              fileName={hook.fileNameResp} 
              onImport={hook.importarDoControleAnalises}
              title="2. Análises Vencidas"
              subtitle="Puxe os dados filtrados da tela Controle de Análises."
              inputId="upload-base-resp"
              compact={true}
              onlyImport={true}
            >
              {hook.excelDataResp.length > 0 && hook.responsaveisList.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-2">
                      Trabalhar em Lote por Responsável
                    </label>
                    <div className="relative">
                      {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 1 */}
                      <select
                        translate="no"
                        value={hook.filtroResponsavel}
                        onChange={(e) => hook.handleSelectResponsavel(e.target.value)}
                        className={`notranslate w-full pl-3 pr-8 py-2 border border-[#c3ddf8] bg-white rounded-lg text-sm font-medium focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/20 transition-all shadow-sm appearance-none cursor-pointer ${
                          !hook.filtroResponsavel ? "text-gray-500" : "text-[#0b1e35]"
                        }`}
                      >
                        <option value="" className="text-gray-500">Selecione um Responsável...</option>
                        {hook.responsaveisList.map(resp => (
                          <option key={`resp-${resp}`} value={resp} className="text-gray-800">{resp}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a5fa8]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                  {hook.filtroResponsavel && (
                    <div className="text-right sm:border-l sm:border-[#dce9f7] sm:pl-5 sm:ml-2 flex flex-col justify-center h-full">
                      <span className="text-2xl font-black text-[#1a5fa8] leading-none"><span>{hook.totalCasos}</span></span>
                      <p className="text-[10px] uppercase font-bold text-gray-500 mt-1"><span>Casos Vinculados</span></p>
                    </div>
                  )}
                </div>
              )}
            </PainelUploadPlanilha>

            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="flex justify-between items-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    <span>Matrícula</span>
                    
                    {hook.filtroResponsavel && hook.totalCasos > 0 && (
                      <span className="text-[#1a5fa8] font-bold bg-[#eef6ff] px-2 py-0.5 rounded-full border border-[#dce9f7]">
                        <span>Caso </span><span>{hook.currentCasoIndex >= 0 ? hook.currentCasoIndex + 1 : "?"}</span><span> de </span><span>{hook.totalCasos}</span>
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-2">
                    {hook.filtroResponsavel && hook.totalCasos > 1 && (
                      <button onClick={() => hook.navegarCaso('prev')} title="Caso Anterior" className="px-3 py-2 bg-[#f8fafe] border border-gray-200 text-[#1a5fa8] rounded-lg hover:bg-[#eef6ff] transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                    )}

                    <input
                      value={hook.matricula}
                      onChange={(e) => hook.setMatricula(e.target.value)}
                      placeholder="Ex: 1298382-9"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] transition-all"
                    />

                    {hook.filtroResponsavel && hook.totalCasos > 1 && (
                      <button onClick={() => hook.navegarCaso('next')} title="Próximo Caso" className="px-3 py-2 bg-[#f8fafe] border border-gray-200 text-[#1a5fa8] rounded-lg hover:bg-[#eef6ff] transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    )}

                    <button
                      onClick={hook.handleSearchMatricula}
                      disabled={hook.excelData.length === 0}
                      className="px-4 py-2 bg-[#eef6ff] text-[#1a5fa8] border border-[#c3ddf8] rounded-lg text-xs font-semibold hover:bg-[#dce9f7] disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              <CardClienteLocalizado cliente={hook.clienteData} isProcessed={hook.isCurrentProcessed} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data Constatação</label>
                  <input
                    type="text"
                    value={hook.dataConstatacao}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[\d/]*$/.test(val)) {
                        const digits = val.replace(/\D/g, "").slice(0, 8);
                        let masked = digits;
                        if (digits.length > 2) masked = digits.slice(0, 2) + "/" + digits.slice(2);
                        if (digits.length > 4) masked = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
                        hook.setDataConstatacao(masked);
                      } else {
                        hook.setDataConstatacao(val);
                      }
                    }}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Protocolo</label>
                  <input value={hook.protocolo} onChange={(e) => hook.setProtocolo(e.target.value)} placeholder="Ex: 12345678" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                
                <BuscaFuncionarioInput hook={hook} />

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Equipe</label>
                  <input value={hook.equipe} onChange={(e) => hook.setEquipe(e.target.value)} placeholder="Ex: Leiturista" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>

                {/* NOVO CAMPO CONDICIONAL PARA O CÓDIGO 20012 */}
                {hook.selectedCodes.includes("20012") && (
                  <div className="animate-fadeIn">
                    <label className="block text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1.5">
                      Qtd. Meses Sem Acesso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hook.mesesSemAcesso}
                      onChange={(e) => hook.setMesesSemAcesso(e.target.value)}
                      placeholder="Ex: 3"
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-amber-900 placeholder-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={hook.handleGenerate}
              disabled={hook.selectedCodes.length === 0 || hook.loading || hook.camposObrigatoriosVazios}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              {hook.loading ? (
                <><Loader2 size={18} className="animate-spin" /> IA processando — redigindo notificação…</>
              ) : (
                <><Sparkles size={18} /> Consolidar e Redigir Texto</>
              )}
            </button>

            {/* ATUALIZADO: Passando a nova prop para o alerta de pendências */}
            <AlertaPendencias 
              semCodigos={hook.selectedCodes.length === 0} 
              esqueceuBusca={hook.esqueceuDeBuscar} 
              camposVazios={hook.camposObrigatoriosVazios} 
              faltaMeses={hook.selectedCodes.includes("20012") && !hook.mesesSemAcesso.trim()}
            />
          </SectionBlock>


          {/* ================= BLOCO 3: REVISÃO ================= */}
          {hook.step === "generated" && (
            <SectionBlock
              icon={CheckCircle2} title="Revisão e Edição do Texto" description="Clique no texto para personalizar qualquer detalhe necessário"
              className="animate-fadeIn !border-emerald-200"
              headerAction={<AcoesRevisao hook={hook} />}
            >
              {hook.reviewMode === "preview" ? (
                <div onClick={() => hook.setReviewMode("edit")} className="w-full min-h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text hover:border-[#1a5fa8]/40">
                  {hook.generatedText}
                </div>
              ) : (
                // Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 1: translate="no" na área de texto livre que interage com React
                <textarea
                  translate="no"
                  ref={textAreaRef} autoFocus value={hook.generatedText}
                  onChange={(e) => hook.setGeneratedText(e.target.value)}
                  onBlur={() => hook.setReviewMode("preview")}
                  className="notranslate w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8]"
                  spellCheck={false}
                />
              )}
            </SectionBlock>
          )}


          {/* ================= BLOCO 4: EXPORTAÇÃO ================= */}
          {hook.step === "generated" && (
            <SectionBlock number={4} title="Exportação e Entrega" description="Informe o Nº do Auto e baixe o arquivo formatado" className="animate-fadeIn">
              <div className="mb-6 bg-gray-50 p-4 border border-gray-100 rounded-xl">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Nº Auto Infração </span><span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    value={hook.autoInfracao} onChange={(e) => hook.setAutoInfracao(e.target.value)} placeholder="Ex: 98765"
                    className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]"
                  />
                  {!hook.autoInfracao.trim() && (
                    <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle size={12} className="flex-shrink-0" /> <span>Obrigatório para download</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button onClick={hook.handleDownloadPDF} disabled={!hook.autoInfracao.trim()} className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 disabled:opacity-50">
                  <FileText size={17} /> Baixar em PDF
                </button>
                <button onClick={hook.handleDownload} disabled={!hook.autoInfracao.trim()} className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm shadow-md disabled:opacity-50">
                  <Download size={17} /> Baixar .docx
                </button>
              </div>
            </SectionBlock>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES VISUAIS (Dumb Components)
// ============================================================================

const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-[220px]">
        <Loader2 size={32} className="animate-spin text-[#1a5fa8]" />
        <p className="text-sm font-medium text-gray-700 text-center">Carregando planilha…</p>
      </div>
    </div>
  );
};

const FeedbackModal = ({ modal, onClose }: { modal: FileModalState | null, onClose: () => void }) => {
  if (!modal) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center text-center gap-3">
        {modal.type === "success" && <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={26} className="text-emerald-500" /></div>}
        {modal.type === "warning" && <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center"><AlertCircle size={26} className="text-amber-500" /></div>}
        {modal.type === "error" && <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center"><AlertCircle size={26} className="text-red-500" /></div>}
        <p className="text-sm text-gray-700 leading-relaxed"><span>{modal.message}</span></p>
        <button onClick={onClose} className="mt-1 w-full py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-lg text-xs font-semibold">OK</button>
      </div>
    </div>
  );
};

const Cabecalho = ({ apiKey, setApiKey, limparTela }: any) => (
  <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
    <div>
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-[#1a5fa8]" />
        {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 (Naked texts resolvidos) */}
        <h1 className="text-[#0b1e35] font-semibold text-lg"><span>Redigir Notificação Extrajudicial</span></h1>
      </div>
      <p className="text-gray-500 text-sm mt-0.5"><span>Assistente de redação jurídica com Inteligência Artificial</span></p>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={limparTela} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg">
        <Eraser size={16} /> Limpar Tela
      </button>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-[#1a5fa8]">
        <Key size={14} className="text-gray-400 mr-2" />
        <input type="password" placeholder="Gemini API Key..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm text-gray-700 w-48" />
      </div>
    </div>
  </div>
);

// Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 1 e 2 no contêiner principal dos botões de Upload de Arquivos
const PainelUploadPlanilha = ({ fileLoading, fileName, onUpload, onImport, title, subtitle, inputId, compact, onlyImport, children }: any) => (
  <div translate="no" className={`notranslate mb-4 bg-[#f8fafe] border border-[#dce9f7] rounded-xl flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
    
    <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
      <div>
        <h3 className={`font-bold text-[#1a5fa8] flex items-center gap-1.5 mb-0.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          <FileText size={compact ? 12 : 14}/> <span>{title}</span>
        </h3>
        <p className="text-[10px] text-gray-500"><span>{subtitle}</span></p>
      </div>
      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          {!onlyImport && (
            <>
              <input id={inputId} type="file" accept=".csv, .xlsx, .xls" onChange={onUpload} disabled={fileLoading} className="hidden" />
              <label translate="no" htmlFor={inputId} className={`notranslate rounded-md font-semibold text-[#1a5fa8] bg-white border border-[#1a5fa8] transition-colors flex-shrink-0 text-center ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} ${fileLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#f0f7ff] cursor-pointer"}`}>
                Escolher arquivo
              </label>
            </>
          )}
          {onImport && (
            <button 
              onClick={onImport}
              disabled={fileLoading}
              className={`rounded-md font-semibold text-white bg-[#1a5fa8] transition-colors flex flex-shrink-0 items-center justify-center gap-1.5 ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} ${fileLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#154d8a] hover:shadow-md"}`}
            >
              <RefreshCw size={compact ? 11 : 13} />
              Puxar Filtrados
            </button>
          )}
        </div>
        <div className="min-w-[120px] max-w-[260px] text-center sm:text-left mt-2 sm:mt-0">
          {fileName ? (
            <p className="text-[11px] text-[#1a5fa8] flex items-center justify-center sm:justify-start gap-1.5 font-medium truncate" title={fileName}>
              <CheckCircle2 size={11} className="flex-shrink-0" /><span className="truncate"><span>{fileName}</span></span>
            </p>
          ) : (
            <p className="text-[11px] text-gray-400 italic truncate">Nenhum dado...</p>
          )}
        </div>
      </div>
    </div>

    {children && (
      <div className="bg-white/60 border-t border-[#dce9f7] p-4 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

const MenuDropdownCodigos = ({ hook }: any) => (
  <div className="relative">
    <button onClick={() => hook.setDropdownOpen((v: boolean) => !v)} className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#1a5fa8]">
      {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 */}
      <span className="text-gray-500">
        <span>{hook.selectedCodes.length === 0 ? "Clique para selecionar códigos de infração..." : `${hook.selectedCodes.length} código(s) selecionado(s)`}</span>
      </span>
      <ChevronDown size={16} className={`text-gray-400 transition-transform ${hook.dropdownOpen ? "rotate-180" : ""}`} />
    </button>
    {hook.dropdownOpen && (
      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
        <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Pesquisar..." value={hook.searchTerm} onChange={(e) => hook.setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
          {hook.filteredCodes.length > 0 ? (
            hook.filteredCodes.map((item: any, index: number) => {
              const selected = hook.selectedCodes.includes(item.code);
              return (
                // Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 3
                <button key={`cod-${item.code}-${index}`} onClick={() => hook.toggleCode(item.code)} className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#f0f7ff] ${selected ? "bg-[#f0f7ff]" : ""}`}>
                  <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${selected ? "bg-[#1a5fa8] border-[#1a5fa8]" : "border-gray-300"}`}>
                    {selected && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#1a5fa8]"><span>{item.code}</span></span>
                      <span className="text-sm font-medium text-gray-800"><span>{item.title}</span></span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]}`}><span>{item.category}</span></span>
                    </div>
                    {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 */}
                    <p className="text-xs text-gray-500 mt-1 truncate"><span>{item.clauseMulta.substring(0, 90)}</span><span>…</span></p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500"><span>Nenhum código encontrado.</span></div>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={() => hook.setDropdownOpen(false)} className="px-4 py-1.5 bg-[#1a5fa8] text-white text-xs rounded-lg hover:bg-[#154d8a]">Confirmar Seleção</button>
        </div>
      </div>
    )}
  </div>
);

const SeletorPenalidade = ({ variante, setVariante }: any) => (
  <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex items-center gap-2"><Info size={14} className="text-gray-400" /><label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Tipo de penalidade</label></div>
    <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
      <button onClick={() => setVariante("multa")} className={`px-6 py-1.5 text-xs font-semibold rounded-md ${variante === "multa" ? "bg-[#1a5fa8] text-white" : "text-gray-500"}`}>Apenas Multa</button>
      <button onClick={() => setVariante("multaCP")} className={`px-6 py-1.5 text-xs font-semibold rounded-md ${variante === "multaCP" ? "bg-[#1a5fa8] text-white" : "text-gray-500"}`}>Multa + Padronização</button>
    </div>
  </div>
);

const PreviaClausulas = ({ itens, variante }: any) => (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-1.5"><Info size={12} className="text-gray-400" /><p className="text-xs text-gray-400 font-medium">Prévia das cláusulas selecionadas</p></div>
    <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
      {itens.map((item: any) => (
        // Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 e 3
        <div key={`prev-${item.code}-${variante}`} className="text-xs text-gray-600 leading-relaxed">
          <span className="font-bold text-[#1a5fa8]"><span>[</span><span>{item.code}</span><span>]</span></span> <span>{variante === "multaCP" ? item.clauseMultaCP : item.clauseMulta}</span>
        </div>
      ))}
    </div>
  </div>
);

const CardClienteLocalizado = ({ cliente, isProcessed }: { cliente: any, isProcessed: boolean }) => {
  if (!cliente.nomeCliente) return null;
  
  return (
    <div className="col-span-full mb-6 bg-[#ebfbf3] border border-[#9ae3b7] rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
      <div className="mt-0.5 text-[#108c4e]">
        <UserCheck size={20} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#0c6b3b]">Cliente localizado e dados importados com sucesso!</p>
        <p className="text-xs text-[#108c4e] mt-1">
          {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 (Naked texts resolvidos) */}
          <span className="font-bold"><span>Nome:</span></span> <span>{cliente.nomeCliente}</span> 
          <span className="text-[#9ae3b7] mx-1.5">|</span> 
          <span className="font-bold"><span>Endereço:</span></span> <span>{cliente.logradouro}</span>
          
          {cliente.numeroHidrometro && (
            <>
              <span className="text-[#9ae3b7] mx-1.5">|</span> 
              <span className="font-bold"><span>Hidrômetro:</span></span> <span>{cliente.numeroHidrometro}</span>
            </>
          )}
        </p>
      </div>
      
      {isProcessed && (
        <div className="flex items-center gap-1.5 bg-[#108c4e] text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex-shrink-0 shadow-sm">
          <CheckCircle2 size={12} /> Já Baixado
        </div>
      )}
    </div>
  );
};

const BuscaFuncionarioInput = ({ hook }: any) => (
  <div className="relative">
    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Funcionário</label>
    <input
      value={hook.funcionario}
      onChange={(e) => {
        hook.setFuncionario(e.target.value);
        hook.setFuncionarioBusca(e.target.value);
        hook.setFuncSearchOpen(true);
      }}
      onFocus={() => hook.setFuncSearchOpen(true)}
      onBlur={() => setTimeout(() => hook.setFuncSearchOpen(false), 200)}
      placeholder="Selecione na lista ou digite..."
      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]"
    />
    {hook.funcSearchOpen && (
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
        {hook.filteredFuncionarios.map((f: any, index: number) => (
          // Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 e 3
          <div key={`func-${f.matricula}-${index}`} className="px-3 py-2 flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-[#f0f7ff] cursor-pointer" onMouseDown={(e) => {
            e.preventDefault();
            hook.setFuncionario(`${f.nome} (Mat. ${f.matricula})`);
            hook.setFuncionarioBusca("");
            hook.setFuncSearchOpen(false);
          }}>
            <span className="truncate"><span>{f.nome}</span></span>
            <span className="text-[10px] font-mono font-bold text-[#1a5fa8]"><span>Mat. </span><span>{f.matricula}</span></span>
          </div>
        ))}
        {hook.filteredFuncionarios.length === 0 && <div className="px-3 py-2 text-xs text-gray-500 italic">Continue digitando para inserir um texto livre...</div>}
      </div>
    )}
  </div>
);

const AlertaPendencias = ({ semCodigos, esqueceuBusca, camposVazios }: any) => {
  if (!semCodigos && !esqueceuBusca && !camposVazios) return null;
  let msg = "Preencha todos os Dados da Notificação.";
  if (semCodigos) msg = "Selecione ao menos um código de infração.";
  else if (esqueceuBusca) msg = "Clique no botão 'Buscar' ao lado da Matrícula antes de gerar.";
  return (
    <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <AlertCircle size={13} className="flex-shrink-0" />
      {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 */}
      <p className="text-xs"><span>{msg}</span></p>
    </div>
  );
};

const AcoesRevisao = ({ hook }: any) => (
  <div className="flex items-center gap-3 mt-3 md:mt-0 w-full justify-between md:justify-end">
    <span className="hidden md:inline-block text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-medium">Gerado com sucesso!</span>
    <button onClick={() => hook.setReviewMode(hook.reviewMode === "preview" ? "edit" : "preview")} className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 bg-white">
      {hook.reviewMode === "preview" ? "Editar Texto" : "Modo Visualização"}
    </button>
    <button onClick={hook.handleCopy} className="flex items-center gap-1.5 py-1.5 px-3 border border-[#1a5fa8] text-[#1a5fa8] rounded-lg text-xs font-semibold hover:bg-[#eef6ff] bg-white">
      {/* Para o DOM permanecer blindado CAMADA DE PROTEÇÃO 2 */}
      {hook.copied ? <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600"><span>Copiado!</span></span></> : <><Copy size={14} /><span>Copiar Texto</span></>}
    </button>
  </div>
);