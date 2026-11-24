// front-end/src/pages/RedatorNotificacao.tsx
import React, { Component, ErrorInfo, ReactNode, useRef } from "react";
import {
  Sparkles, Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Info, Search, UserCheck, Eraser,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import {
  Alert, Badge, Button, buttonClass, FeedbackModal, inputClass, labelClass, LoadingOverlay, PageHeader, textareaClass,
} from "../components/shared/ui";

import { SectionBlock } from "../components/shared/SectionBlock";
import { CATEGORY_COLORS } from "../services/categorias";
import { useRedatorNotificacao } from "../hooks/useRedatorNotificacao";

// Error Boundary para proteção contra modificações indevidas no DOM pelo tradutor
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
        <div className="h-full flex flex-col items-center justify-center p-8 bg-canvas text-center animate-fadeIn">
          <span className="w-14 h-14 rounded-full bg-danger-soft text-danger flex items-center justify-center mb-4">
            <AlertCircle size={28} />
          </span>
          <h2 className="text-xl font-semibold text-ink">A interface foi interrompida</h2>
          <p className="text-sm text-ink-muted mt-2 mb-6 max-w-md">Uma extensão do navegador (como o tradutor automático) alterou a estrutura da página. Recarregue para continuar.</p>
          <Button onClick={() => window.location.reload()}>Recarregar redator</Button>
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
      <LoadingOverlay visible={hook.fileLoading} message="Carregando planilha…" />
      {hook.fileModal && (
        <FeedbackModal type={hook.fileModal.type} message={<span>{hook.fileModal.message}</span>} onClose={() => hook.setFileModal(null)} />
      )}
      
      <Cabecalho limparTela={hook.limparTela} />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {hook.chaveGeminiCadastrada === false && (
            <Alert tone="warning">
              Você ainda não cadastrou sua chave do Gemini. Cadastre em <b>Minha chave do Gemini</b> (ícone <Sparkles size={13} className="inline -mt-0.5" /> no rodapé da barra lateral) para gerar notificações com IA.
            </Alert>
          )}

          {/* ================= BLOCO 1: CÓDIGOS ================= */}
          <SectionBlock number={1} title="Seleção de Códigos de Infração" description="Selecione um ou mais códigos referentes ao caso do cliente">
            <MenuDropdownCodigos hook={hook} />

            {hook.selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {hook.selectedItems.map((item) => (
                  <div key={`badge-${item.code}`} className="flex items-center gap-2 bg-brand-soft border border-brand-line rounded-md pl-2.5 pr-1 h-8">
                    <span className="text-xs font-mono font-semibold text-brand"><span>{item.code}</span></span>
                    <span className="text-xs text-ink"><span>{item.title}</span></span>
                    <button onClick={() => hook.toggleCode(item.code)} aria-label={`Remover código ${item.code}`} className="w-6 h-6 flex items-center justify-center rounded text-navy-muted hover:text-danger hover:bg-white transition-colors">
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
                    <label className={labelClass}>
                      Trabalhar em lote por responsável
                    </label>
                    <div className="relative">
                      <select
                        translate="no"
                        value={hook.filtroResponsavel}
                        onChange={(e) => hook.handleSelectResponsavel(e.target.value)}
                        className={`notranslate ${inputClass} pr-9 appearance-none cursor-pointer ${
                          !hook.filtroResponsavel ? "text-ink-muted" : "text-ink font-medium"
                        }`}
                      >
                        <option value="" className="text-gray-500">Selecione um responsável…</option>
                        {hook.responsaveisList.map(resp => (
                          <option key={`resp-${resp}`} value={resp} className="text-gray-800">{resp}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                  {hook.filtroResponsavel && (
                    <div className="text-right sm:border-l sm:border-brand-line sm:pl-5 sm:ml-2 flex flex-col justify-center h-full">
                      <span className="text-[28px] font-semibold text-brand leading-none"><span>{hook.totalCasos}</span></span>
                      <p className="text-xs font-medium text-ink-muted mt-1"><span>casos vinculados</span></p>
                    </div>
                  )}
                </div>
              )}
            </PainelUploadPlanilha>

            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className={`${labelClass} flex justify-between items-center`}>
                    <span>Matrícula</span>
                    
                    {hook.filtroResponsavel && hook.totalCasos > 0 && (
                      <span className="text-brand font-semibold text-[11px] bg-brand-soft px-2 py-0.5 rounded-full border border-brand-line">
                        <span>Caso </span><span>{hook.currentCasoIndex >= 0 ? hook.currentCasoIndex + 1 : "?"}</span><span> de </span><span>{hook.totalCasos}</span>
                      </span>
                    )}
                  </label>
                  
                  <div className="flex gap-2">
                    {hook.filtroResponsavel && hook.totalCasos > 1 && (
                      <button onClick={() => hook.navegarCaso('prev')} title="Caso anterior" aria-label="Caso anterior" className={buttonClass("secondary", "md", "w-10 px-0 text-brand")}>
                        <ChevronLeft size={16} />
                      </button>
                    )}

                    <input
                      value={hook.matricula}
                      onChange={(e) => hook.setMatricula(e.target.value)}
                      placeholder="Ex: 1298382-9"
                      className={`${inputClass} flex-1`}
                    />

                    {hook.filtroResponsavel && hook.totalCasos > 1 && (
                      <button onClick={() => hook.navegarCaso('next')} title="Próximo caso" aria-label="Próximo caso" className={buttonClass("secondary", "md", "w-10 px-0 text-brand")}>
                        <ChevronRight size={16} />
                      </button>
                    )}

                    <Button
                      variant="secondary"
                      icon={Search}
                      onClick={hook.handleSearchMatricula}
                      disabled={hook.excelData.length === 0}
                      title={hook.excelData.length === 0 ? "Carregue a base de dados do cliente para buscar" : undefined}
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </div>

              <CardClienteLocalizado cliente={hook.clienteData} isProcessed={hook.isCurrentProcessed} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Data Constatação</label>
                  <input
                    type="text"
                    value={hook.dataConstatacao}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      let masked = digits;
                      if (digits.length > 2) masked = digits.slice(0, 2) + "/" + digits.slice(2);
                      if (digits.length > 4) masked = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
                      hook.setDataConstatacao(masked);
                    }}
                    placeholder="DD/MM/AAAA"
                    className={inputClass}
                  />
                </div>
                
                {/* Protocolo: oculto apenas quando o 20012 é o ÚNICO código selecionado */}
                {hook.precisaProtocolo && (
                  <div>
                    <label className={labelClass}>Protocolo</label>
                    <input value={hook.protocolo} onChange={(e) => hook.setProtocolo(e.target.value)} placeholder="Ex: 12345678" className={inputClass} />
                  </div>
                )}
                
                <BuscaFuncionarioInput hook={hook} />

                <div>
                  <label className={labelClass}>Equipe</label>
                  <input value={hook.equipe} onChange={(e) => hook.setEquipe(e.target.value)} placeholder="Ex: Leiturista" className={inputClass} />
                </div>

                {/* Meses sem acesso: aparece sempre que o 20012 estiver selecionado (sozinho ou combinado) */}
                {hook.exigeMeses && (
                  <div className="animate-fadeIn">
                    <label className={`${labelClass} !text-warning`}>
                      Qtd. meses sem acesso <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={hook.mesesSemAcesso}
                      onChange={(e) => hook.setMesesSemAcesso(e.target.value)}
                      placeholder="Ex: 3"
                      className={`${inputClass} !bg-warning-soft !border-warning-line focus:!border-warning focus:!ring-warning/15`}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              icon={Sparkles}
              loading={hook.loading}
              onClick={hook.handleGenerate}
              disabled={hook.selectedCodes.length === 0 || hook.camposObrigatoriosVazios}
            >
              {hook.loading ? "Redigindo a notificação com IA…" : "Consolidar e redigir texto"}
            </Button>

            <AlertaPendencias 
              semCodigos={hook.selectedCodes.length === 0} 
              esqueceuBusca={hook.esqueceuDeBuscar} 
              camposVazios={hook.camposObrigatoriosVazios} 
              faltaMeses={hook.exigeMeses && !hook.mesesSemAcesso.trim()}
              faltaProtocolo={hook.precisaProtocolo && !hook.protocolo.trim()}
            />
          </SectionBlock>


          {/* ================= BLOCO 3: REVISÃO ================= */}
          {hook.step === "generated" && (
            <SectionBlock
              icon={CheckCircle2} title="Revisão e Edição do Texto" description="Clique no texto para personalizar qualquer detalhe necessário"
              className="animate-slideUp !border-success-line"
              headerAction={<AcoesRevisao hook={hook} />}
            >
              {hook.reviewMode === "preview" ? (
                <div onClick={() => hook.setReviewMode("edit")} className="w-full min-h-96 p-5 bg-gray-50 border border-gray-200 rounded-md text-[13px] text-ink leading-relaxed whitespace-pre-wrap cursor-text transition-colors hover:border-brand/40 hover:bg-white" title="Clique para editar">
                  {hook.generatedText}
                </div>
              ) : (
                <textarea
                  translate="no"
                  ref={textAreaRef} autoFocus value={hook.generatedText}
                  onChange={(e) => hook.setGeneratedText(e.target.value)}
                  onBlur={() => hook.setReviewMode("preview")}
                  className={`notranslate ${textareaClass} h-96 p-5 font-mono text-[13px] resize-none`}
                  spellCheck={false}
                />
              )}
            </SectionBlock>
          )}


          {/* ================= BLOCO 4: EXPORTAÇÃO ================= */}
          {hook.step === "generated" && (
            <SectionBlock number={4} title="Exportação e Entrega" description="Informe o Nº do Auto e baixe o arquivo formatado" className="animate-slideUp">
              <div className="mb-6">
                <label className={labelClass}>
                  <span>Nº do auto de infração </span><span className="text-danger">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    value={hook.autoInfracao} onChange={(e) => hook.setAutoInfracao(e.target.value)} placeholder="Ex: 98765"
                    className={`${inputClass} sm:w-64`}
                  />
                  {!hook.autoInfracao.trim() && (
                    <span className="text-xs text-warning font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="flex-shrink-0" /> <span>Obrigatório para baixar o arquivo</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" icon={FileText} className="flex-1" onClick={hook.handleDownloadPDF} disabled={!hook.autoInfracao.trim()}>
                  Baixar em PDF
                </Button>
                <Button size="lg" icon={Download} className="flex-1" onClick={hook.handleDownload} disabled={!hook.autoInfracao.trim()}>
                  Baixar .docx
                </Button>
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

const Cabecalho = ({ limparTela }: any) => (
  <PageHeader
    icon={FileText}
    title={<span>Redigir Notificação Extrajudicial</span>}
    description={<span>Assistente de redação jurídica com inteligência artificial</span>}
    actions={
      <Button variant="ghost-danger" icon={Eraser} onClick={limparTela}>Limpar tela</Button>
    }
  />
);

const PainelUploadPlanilha = ({ fileLoading, fileName, onUpload, onImport, title, subtitle, inputId, compact, onlyImport, children }: any) => (
  <div translate="no" className={`notranslate mb-4 bg-brand-subtle border rounded-md flex flex-col transition-colors overflow-hidden ${fileName ? "border-success-line" : "border-brand-line"}`}>
    
    <div className={`${compact ? 'p-3' : 'p-4'} flex flex-col sm:flex-row items-center justify-between gap-3`}>
      <div>
        <h3 className="font-semibold text-ink text-sm flex items-center gap-2 mb-0.5">
          <FileText size={15} className="text-brand flex-shrink-0" /> <span>{title}</span>
        </h3>
        <p className="text-xs text-ink-muted"><span>{subtitle}</span></p>
      </div>
      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          {!onlyImport && (
            <>
              <input id={inputId} type="file" accept=".csv, .xlsx, .xls" onChange={onUpload} disabled={fileLoading} className="hidden" />
              <label translate="no" htmlFor={inputId} className={`notranslate ${buttonClass("secondary", "sm", "text-brand border-brand-line")} ${fileLoading ? "opacity-55 cursor-not-allowed" : "cursor-pointer"}`}>
                Escolher arquivo
              </label>
            </>
          )}
          {onImport && (
            <button 
              onClick={onImport}
              disabled={fileLoading}
              className={buttonClass("primary", "sm")}
            >
              <RefreshCw size={14} />
              Puxar filtrados
            </button>
          )}
        </div>
        <div className="min-w-[120px] max-w-[260px] text-center sm:text-left mt-2 sm:mt-0">
          {fileName ? (
            <p className="text-xs text-success flex items-center justify-center sm:justify-start gap-1.5 font-medium truncate" title={fileName}>
              <CheckCircle2 size={13} className="flex-shrink-0" /><span className="truncate"><span>{fileName}</span></span>
            </p>
          ) : (
            <p className="text-xs text-ink-muted truncate">Nenhum arquivo carregado</p>
          )}
        </div>
      </div>
    </div>

    {children && (
      <div className="bg-white border-t border-brand-line p-4 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);

const MenuDropdownCodigos = ({ hook }: any) => (
  <div className="relative">
    <button onClick={() => hook.setDropdownOpen((v: boolean) => !v)} aria-expanded={hook.dropdownOpen} className={`w-full flex items-center justify-between gap-3 px-4 h-11 bg-white border rounded-md text-sm transition-colors ${hook.dropdownOpen ? "border-brand ring-3 ring-brand/15" : "border-gray-300 hover:border-gray-400"}`}>
      <span className={hook.selectedCodes.length === 0 ? "text-ink-muted" : "text-ink font-medium"}>
        <span>{hook.selectedCodes.length === 0 ? "Clique para selecionar códigos de infração..." : `${hook.selectedCodes.length} código(s) selecionado(s)`}</span>
      </span>
      <ChevronDown size={16} className={`text-gray-400 transition-transform ${hook.dropdownOpen ? "rotate-180" : ""}`} />
    </button>
    {hook.dropdownOpen && (
      <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-[10px] shadow-xl overflow-hidden animate-slideUp">
        <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Pesquisar..." value={hook.searchTerm} onChange={(e) => hook.setSearchTerm(e.target.value)} onClick={(e) => e.stopPropagation()} className={`${inputClass} pl-9`} />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
          {hook.filteredCodes.length > 0 ? (
            hook.filteredCodes.map((item: any, index: number) => {
              const selected = hook.selectedCodes.includes(item.code);
              return (
                <button key={`cod-${item.code}-${index}`} onClick={() => hook.toggleCode(item.code)} className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${selected ? "bg-brand-soft" : "hover:bg-gray-50"}`}>
                  <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${selected ? "bg-brand border-brand" : "border-gray-300"}`}>
                    {selected && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-brand"><span>{item.code}</span></span>
                      <span className="text-sm font-medium text-ink"><span>{item.title}</span></span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]}`}><span>{item.category}</span></span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1 truncate"><span>{item.clauseMulta.substring(0, 90)}</span><span>…</span></p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-ink-muted"><span>Nenhum código corresponde à pesquisa.</span></div>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button size="sm" onClick={() => hook.setDropdownOpen(false)}>Confirmar seleção</Button>
        </div>
      </div>
    )}
  </div>
);

const SeletorPenalidade = ({ variante, setVariante }: any) => (
  <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
    <p className="text-sm font-medium text-ink-body">Tipo de penalidade</p>
    <div role="group" aria-label="Tipo de penalidade" className="inline-flex bg-gray-100 border border-gray-200 rounded-md p-0.5">
      <button onClick={() => setVariante("multa")} aria-pressed={variante === "multa"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${variante === "multa" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Apenas multa</button>
      <button onClick={() => setVariante("multaCP")} aria-pressed={variante === "multaCP"} className={`px-5 h-8 text-xs font-semibold rounded transition-colors ${variante === "multaCP" ? "bg-white text-brand shadow-xs" : "text-ink-muted hover:text-ink"}`}>Multa + padronização</button>
    </div>
  </div>
);

const PreviaClausulas = ({ itens, variante }: any) => (
  <div className="mt-4 space-y-2">
    <div className="flex items-center gap-1.5"><Info size={13} className="text-ink-muted" /><p className="text-xs text-ink-muted font-medium">Prévia das cláusulas selecionadas</p></div>
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
      {itens.map((item: any) => (
        <div key={`prev-${item.code}-${variante}`} className="text-xs text-ink-body leading-relaxed">
          <span className="font-semibold text-brand"><span>[</span><span>{item.code}</span><span>]</span></span> <span>{variante === "multaCP" ? item.clauseMultaCP : item.clauseMulta}</span>
        </div>
      ))}
    </div>
  </div>
);

const CardClienteLocalizado = ({ cliente, isProcessed }: { cliente: any, isProcessed: boolean }) => {
  if (!cliente.nomeCliente) return null;
  
  return (
    <div className="col-span-full mb-6 bg-success-soft border border-success-line rounded-md p-4 flex items-start gap-3 animate-slideUp">
      <div className="mt-0.5 text-success">
        <UserCheck size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-success">Cliente localizado. Dados importados da base.</p>
        <p className="text-xs text-ink-body mt-1 leading-relaxed">
          <span className="font-semibold"><span>Nome:</span></span> <span>{cliente.nomeCliente}</span> 
          <span className="text-success-line mx-1.5">|</span> 
          <span className="font-semibold"><span>Endereço:</span></span> <span>{cliente.logradouro}</span>
          
          {cliente.numeroHidrometro && (
            <>
              <span className="text-success-line mx-1.5">|</span> 
              <span className="font-semibold"><span>Hidrômetro:</span></span> <span>{cliente.numeroHidrometro}</span>
            </>
          )}
        </p>
      </div>
      
      {isProcessed && (
        <Badge tone="success" icon={CheckCircle2} className="flex-shrink-0">Já baixado</Badge>
      )}
    </div>
  );
};

const BuscaFuncionarioInput = ({ hook }: any) => (
  <div className="relative">
    <label className={labelClass}>Funcionário</label>
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
      className={inputClass}
    />
    {hook.funcSearchOpen && (
      <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-md shadow-xl max-h-56 overflow-y-auto custom-scrollbar animate-slideUp">
        {hook.filteredFuncionarios.map((f: any, index: number) => (
          <div key={`func-${f.matricula}-${index}`} className="px-3 py-2 flex items-center justify-between gap-2 text-sm text-ink-body hover:bg-brand-soft hover:text-ink cursor-pointer" onMouseDown={(e) => {
            e.preventDefault();
            hook.setFuncionario(`${f.nome} (Mat. ${f.matricula})`);
            hook.setFuncionarioBusca("");
            hook.setFuncSearchOpen(false);
          }}>
            <span className="truncate"><span>{f.nome}</span></span>
            <span className="text-[11px] font-mono font-semibold text-brand"><span>Mat. </span><span>{f.matricula}</span></span>
          </div>
        ))}
        {hook.erroFuncionarios && <div className="px-3 py-2 text-xs text-danger">{hook.erroFuncionarios}</div>}
        {!hook.erroFuncionarios && hook.filteredFuncionarios.length === 0 && <div className="px-3 py-2 text-xs text-ink-muted">Nenhum funcionário encontrado. O texto digitado será usado como está.</div>}
      </div>
    )}
  </div>
);

const AlertaPendencias = ({ semCodigos, esqueceuBusca, camposVazios, faltaMeses, faltaProtocolo }: any) => {
  if (!semCodigos && !esqueceuBusca && !camposVazios && !faltaMeses && !faltaProtocolo) return null;
  let msg = "Preencha todos os Dados da Notificação.";
  if (semCodigos) msg = "Selecione ao menos um código de infração.";
  else if (esqueceuBusca) msg = "Clique no botão 'Buscar' ao lado da Matrícula antes de gerar.";
  else if (faltaMeses) msg = "Informe a quantidade de meses sem acesso (exigido pelo código 20012).";
  else if (faltaProtocolo) msg = "Informe o número do Protocolo.";
  
  return (
    <Alert tone="warning" className="mt-3"><span>{msg}</span></Alert>
  );
};

const AcoesRevisao = ({ hook }: any) => (
  <div className="flex items-center gap-3 mt-3 md:mt-0 w-full justify-between md:justify-end">
    <Badge tone="success" icon={CheckCircle2} className="hidden md:inline-flex">Texto gerado</Badge>
    <Button variant="secondary" size="sm" onClick={() => hook.setReviewMode(hook.reviewMode === "preview" ? "edit" : "preview")}>
      {hook.reviewMode === "preview" ? "Editar texto" : "Visualizar"}
    </Button>
    <Button variant="secondary" size="sm" onClick={hook.handleCopy} className={hook.copied ? "!text-success !border-success-line" : "text-brand"}>
      {hook.copied ? <><CheckCircle2 size={14} /><span><span>Copiado</span></span></> : <><Copy size={14} /><span>Copiar texto</span></>}
    </Button>
  </div>
);