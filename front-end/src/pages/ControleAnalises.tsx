import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, 
  Search, FileSpreadsheet, Clock, Calculator,
  PieChart, AlertTriangle, Filter, ArrowUpDown, ArrowDown, ArrowUp, FileCheck, X, Eraser, ChevronDown
} from "lucide-react";
import { SectionBlock } from "./../components/shared/SectionBlock";
import { Badge, Button, FeedbackModal, inputClass, PageHeader } from "./../components/shared/ui";
import { useControleAnalises, AnaliseProcessada } from "./../hooks/useControleAnalises";

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
          <p className="text-sm text-ink-muted mt-2 mb-6 max-w-md">Uma extensão do navegador (como tradutores ou corretores) alterou a estrutura da página. Recarregue para continuar.</p>
          <Button onClick={() => window.location.reload()}>Recarregar página</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ControleAnalises() {
  return (
    <ComponenteProtegido>
      <ControleAnalisesConteudo />
    </ComponenteProtegido>
  );
}

function ControleAnalisesConteudo() {
  const hook = useControleAnalises();

  const data = hook.resultadosFiltrados;
  const total = data.length;
  
  const vencidasArr = data.filter(r => r.situacao === "Vencida");
  const qtdVencidas = vencidasArr.length;
  const noPrazo = total - qtdVencidas;

  const padronizadas = data.filter(r => r.isPadronizado).length;
  const naoPadronizadas = total - padronizadas;
  
  const diasAtrasoTotal = vencidasArr.reduce((acc, curr) => acc + curr.diasAtraso, 0);
  const mediaAtraso = qtdVencidas > 0 ? Math.round(diasAtrasoTotal / qtdVencidas) : 0;
  const maxAtraso = qtdVencidas > 0 ? Math.max(...vencidasArr.map(v => v.diasAtraso)) : 0;

  const SortIcon = ({ columnKey }: { columnKey: keyof AnaliseProcessada }) => {
    if (hook.sortConfig.key !== columnKey) return <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40 transition-opacity ml-1" />;
    return hook.sortConfig.direction === "asc" ? <ArrowUp size={12} className="text-brand ml-1" /> : <ArrowDown size={12} className="text-brand ml-1" />;
  };

  const limparFiltros = () => {
    hook.setSearchTerm("");
    hook.setFiltroCodigo("Todos");
    hook.setFiltroStatusCliente("Todos");
    hook.setFiltroPadronizadoAtivo(false);
    hook.setFiltroFuncionario("");
    hook.setFiltroSituacao("Todas");
    hook.setFiltroSituacaoOS([]); 
  };

  const isFiltroAtivo = hook.searchTerm !== "" || hook.filtroCodigo !== "Todos" || hook.filtroStatusCliente !== "Todos" || hook.filtroPadronizadoAtivo || hook.filtroFuncionario !== "" || hook.filtroSituacao !== "Todas" || hook.filtroSituacaoOS.length > 0;

  return (
    <div className="h-full flex flex-col">
      
      {/* ─── MODAL DE FEEDBACK ─── */}
      {hook.fileModal && (
        <FeedbackModal type={hook.fileModal.type} message={hook.fileModal.message} onClose={() => hook.setFileModal(null)} />
      )}

      {/* ─── CABEÇALHO ─── */}
      <PageHeader
        icon={Clock}
        title="Análises Vencidas"
        description="Gestão de prazos e priorização de serviços"
        actions={<Button variant="ghost-danger" icon={Eraser} onClick={hook.limparTela}>Limpar tela</Button>}
      />

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-8 max-w-[1200px] mx-auto space-y-6">

          {/* SESSÃO 1: UPLOAD */}
          <SectionBlock number={1} title="Importação de Relatórios" description="Carregue as planilhas extraídas do Sansys para realizar o cruzamento de dados">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              
              <label translate="no" htmlFor="up-op" className={`notranslate h-full relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[10px] transition-colors cursor-pointer group ${hook.fileNameOP ? 'border-success-line bg-success-soft/60 hover:bg-success-soft' : 'border-brand-line bg-brand-subtle hover:bg-brand-soft hover:border-brand'}`}>
                <input id="up-op" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "OP")} className="hidden" />
                
                {hook.fileNameOP ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white text-success flex items-center justify-center mb-3"><CheckCircle2 size={24} /></div>
                    <span className="font-semibold text-sm text-success text-center">Relatório OP00002 anexado</span>
                    <span className="text-xs text-ink-muted truncate max-w-[250px] mt-1">{hook.fileNameOP}</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white text-brand border border-brand-line flex items-center justify-center mb-3"><UploadCloud size={24} /></div>
                    <span className="font-semibold text-sm text-ink text-center">Relatório OP00002</span>
                    <span className="text-xs text-ink-muted mt-1">Base obrigatória. Clique para selecionar o arquivo.</span>
                  </>
                )}
              </label>

              <div className="flex flex-col gap-4">
                
                <label translate="no" htmlFor="up-989-cliente" className={`notranslate flex-1 relative flex items-center p-4 border-2 border-dashed rounded-[10px] transition-colors cursor-pointer group ${hook.fileName989Cliente ? 'border-success-line bg-success-soft/60 hover:bg-success-soft' : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'}`}>
                  <input id="up-989-cliente" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "989_Cliente")} className="hidden" />
                  
                  {hook.fileName989Cliente ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white text-success flex items-center justify-center shrink-0 mr-4"><CheckCircle2 size={20} /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm text-success">989 Status Cliente anexado</span>
                        <span className="text-xs text-ink-muted truncate mt-0.5">{hook.fileName989Cliente}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-ink-muted flex items-center justify-center shrink-0 mr-4 transition-colors group-hover:bg-brand-soft group-hover:text-brand"><FileSpreadsheet size={20} /></div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-ink">Relatório 989 - Status Cliente</span>
                        <span className="text-xs text-ink-muted mt-0.5">Base opcional</span>
                      </div>
                    </>
                  )}
                </label>

                <label translate="no" htmlFor="up-989-caj" className={`notranslate flex-1 relative flex items-center p-4 border-2 border-dashed rounded-[10px] transition-colors cursor-pointer group ${hook.fileName989CAJ ? 'border-success-line bg-success-soft/60 hover:bg-success-soft' : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'}`}>
                  <input id="up-989-caj" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "989_CAJ")} className="hidden" />
                  
                  {hook.fileName989CAJ ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white text-success flex items-center justify-center shrink-0 mr-4"><CheckCircle2 size={20} /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm text-success">344v3setor Encerrado/Executado anexado</span>
                        <span className="text-xs text-ink-muted truncate mt-0.5">{hook.fileName989CAJ}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-ink-muted flex items-center justify-center shrink-0 mr-4 transition-colors group-hover:bg-brand-soft group-hover:text-brand"><FileSpreadsheet size={20} /></div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-ink">Relatório 344v3setor - Encerrado/Executado</span>
                        <span className="text-xs text-ink-muted mt-0.5">Base opcional</span>
                      </div>
                    </>
                  )}
                </label>
              </div>

            </div>

            <Button size="lg" icon={Calculator} className="w-full" loading={hook.loading} disabled={hook.dadosOP.length === 0} onClick={hook.processarDados}>
              {hook.loading ? "Processando prazos…" : "Processar e analisar prazos"}
            </Button>
          </SectionBlock>

          {/* SESSÃO DE RESULTADOS */}
          {hook.resultados.length > 0 && (
            <>
              {/* ─── DASHBOARD DE KPIs ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
                
                <div className="bg-white border border-gray-200 rounded-[10px] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-ink-muted">Volume Listado</p>
                      <p className="text-[28px] leading-none font-semibold text-ink mt-2"><span>{total}</span></p>
                    </div>
                    <span className="w-9 h-9 bg-brand-soft text-brand rounded-md flex items-center justify-center"><PieChart size={18} /></span>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-medium text-ink-muted mb-1.5">
                      <span className="text-success"><span>{noPrazo}</span> <span>no prazo</span></span>
                      <span className="text-danger"><span>{qtdVencidas}</span> <span>vencidas</span></span>
                    </div>
                    <div className="w-full h-2 bg-danger-soft rounded-full overflow-hidden flex" role="img" aria-label={`${noPrazo} no prazo e ${qtdVencidas} vencidas`}>
                      <div className="h-full bg-success transition-[width] duration-500" style={{ width: `${total > 0 ? (noPrazo/total)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-[10px] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-ink-muted">Padronizadas</p>
                      <p className="text-[28px] leading-none font-semibold text-success mt-2"><span>{padronizadas}</span></p>
                    </div>
                    <span className="w-9 h-9 bg-success-soft text-success rounded-md flex items-center justify-center"><FileCheck size={18} /></span>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-medium text-ink-muted mb-1.5">
                      <span className="text-success"><span>{padronizadas}</span> <span>padronizadas</span></span>
                      <span><span>{naoPadronizadas}</span> <span>restantes</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-success transition-[width] duration-500" title="Padronizadas" style={{ width: `${total > 0 ? (padronizadas/total)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-[10px] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-ink-muted">Atrasos Ativos</p>
                      <p className="text-[28px] leading-none font-semibold text-danger mt-2"><span>{qtdVencidas}</span></p>
                    </div>
                    <span className="w-9 h-9 bg-danger-soft text-danger rounded-md flex items-center justify-center"><AlertTriangle size={18} /></span>
                  </div>
                  <p className="text-xs text-ink-muted mt-5">Processos que pedem atenção imediata.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-[10px] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-ink-muted">Média de Atraso</p>
                      <p className="text-[28px] leading-none font-semibold text-warning mt-2">
                        <span>{mediaAtraso}</span> <span className="text-sm font-medium text-ink-muted">dias</span>
                      </p>
                    </div>
                    <span className="w-9 h-9 bg-warning-soft text-warning rounded-md flex items-center justify-center"><Clock size={18} /></span>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs text-ink-muted">
                    <ArrowUp size={14} className="text-danger" />
                    <span>Maior atraso:</span> <strong className="text-danger font-semibold"><span>{maxAtraso}</span> <span>dias</span></strong>
                  </div>
                </div>

              </div>

              {/* TABELA DE RESULTADOS */}
              <SectionBlock icon={FileText} title="Monitoramento Detalhado" description="Listagem completa ordenada da mais atrasada para a mais recente" headerAction={
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors pointer-events-none" />
                    <input type="text" aria-label="Buscar em todas as colunas" placeholder="Buscar em todas as colunas…" value={hook.searchTerm} onChange={(e) => hook.setSearchTerm(e.target.value)} className={`${inputClass} h-9 pl-9 sm:w-72`} />
                  </div>
                }
              >
                
                {/* ─── BARRA DE FILTROS AVANÇADOS ─── */}
                <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-ink-body">Filtros</span>
                  </div>
                  
                  {/* SELECT DE CÓDIGOS DINÂMICO */}
                  <div className="relative">
                    <select value={hook.filtroCodigo} onChange={(e) => hook.setFiltroCodigo(e.target.value)} aria-label="Filtrar por código" className={`w-32 pl-3 pr-8 h-8 bg-white border border-gray-300 rounded-md text-xs font-medium text-ink-body hover:border-gray-400 focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none transition-colors appearance-none cursor-pointer ${hook.filtroCodigo !== "Todos" ? "!border-brand !bg-brand-soft !text-brand" : ""}`}>
                      <option value="Todos">Código</option>
                      {hook.codigosDisponiveis.map(cod => (
                        <option key={cod} value={cod}>{cod}</option>
                      ))}
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  {/* SELECT DE STATUS CLIENTE */}
                  <div className="relative">
                    <select value={hook.filtroStatusCliente} onChange={(e) => hook.setFiltroStatusCliente(e.target.value)} aria-label="Filtrar por status do cliente" className={`w-36 pl-3 pr-8 h-8 bg-white border border-gray-300 rounded-md text-xs font-medium text-ink-body hover:border-gray-400 focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none transition-colors appearance-none cursor-pointer ${hook.filtroStatusCliente !== "Todos" ? "!border-brand !bg-brand-soft !text-brand" : ""}`}>
                      <option value="Todos">Status cliente</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Programado">Programado</option>
                      <option value="Para Reprogramar">Para Reprogramar</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  {/* BOTÃO TOGGLE DE PADRONIZADO */}
                  <button 
                    onClick={() => hook.setFiltroPadronizadoAtivo(!hook.filtroPadronizadoAtivo)} 
                    aria-pressed={hook.filtroPadronizadoAtivo}
                    className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 border ${hook.filtroPadronizadoAtivo ? 'bg-success text-white border-success' : 'bg-white text-ink-body border-gray-300 hover:border-gray-400'}`}
                  >
                    {hook.filtroPadronizadoAtivo && <CheckCircle2 size={14} className="text-white" />}
                    <span>Padronizado</span>
                  </button>

                  {/* DROPDOWN DE MÚLTIPLA ESCOLHA PARA SITUAÇÃO OS */}
                  <div className="relative">
                    <button type="button" aria-expanded={hook.dropdownOSOpen} onClick={() => hook.setDropdownOSOpen(!hook.dropdownOSOpen)} className={`w-36 px-3 h-8 bg-white border border-gray-300 rounded-md text-xs font-medium text-ink-body hover:border-gray-400 focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none transition-colors flex justify-between items-center ${hook.filtroSituacaoOS.length > 0 ? "!border-brand !bg-brand-soft !text-brand" : ""}`}>
                      <span className="truncate">
                        <span>{hook.filtroSituacaoOS.length === 0 ? "Situação OS" : `${hook.filtroSituacaoOS.length} selecionada(s)`}</span>
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${hook.dropdownOSOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {hook.dropdownOSOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => hook.setDropdownOSOpen(false)} />
                        <div className="absolute z-50 mt-1.5 w-44 bg-white border border-gray-200 rounded-md shadow-xl py-1.5 top-full left-0 flex flex-col animate-slideUp">
                          {["Programado", "Pendente", "Postergada"].map(opt => (
                            <label key={opt} className="flex items-center gap-2 px-3 h-8 hover:bg-gray-50 cursor-pointer text-xs text-ink-body font-medium transition-colors">
                              <input type="checkbox" checked={hook.filtroSituacaoOS.includes(opt)} onChange={() => hook.toggleFiltroSituacaoOS(opt)} className="rounded border-gray-300 accent-brand w-3.5 h-3.5" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <input type="text" placeholder="Responsável…" value={hook.filtroFuncionario} onChange={(e) => hook.setFiltroFuncionario(e.target.value)} aria-label="Filtrar por responsável" className={`flex-1 min-w-[140px] px-3 h-8 bg-white border border-gray-300 rounded-md text-xs font-medium text-ink-body hover:border-gray-400 focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none transition-colors placeholder:text-gray-400 ${hook.filtroFuncionario ? "!border-brand !bg-brand-soft !text-brand" : ""}`} />

                  <div className="relative">
                    <select value={hook.filtroSituacao} onChange={(e) => hook.setFiltroSituacao(e.target.value)} aria-label="Filtrar por situação" className={`w-32 pl-3 pr-8 h-8 bg-white border border-gray-300 rounded-md text-xs font-medium text-ink-body hover:border-gray-400 focus:border-brand focus:ring-3 focus:ring-brand/15 focus:outline-none transition-colors appearance-none cursor-pointer ${hook.filtroSituacao !== "Todas" ? "!border-brand !bg-brand-soft !text-brand" : ""}`}>
                      <option value="Todas">Situação</option>
                      <option value="Vencida">Vencida</option>
                      <option value="No Prazo">No Prazo</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  {isFiltroAtivo && (
                    <Button variant="ghost" size="sm" icon={X} onClick={limparFiltros} className="ml-auto hover:!text-danger hover:!bg-danger-soft">
                      Limpar filtros
                    </Button>
                  )}
                </div>

                {/* ─── TABELA DE DADOS ─── */}
                <div className="overflow-auto max-h-[450px] -mx-4 mb-[-24px] custom-scrollbar border-t border-gray-100">
                  <table translate="no" className="notranslate w-full text-[13px] min-w-[900px] border-collapse relative">
                    <thead className="sticky top-0 z-20">
                      <tr>
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-4 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('dataAbertura')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Abertura</span> <SortIcon columnKey="dataAbertura" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('codigoServico')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Código</span> <SortIcon columnKey="codigoServico" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('matricula')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Matrícula</span> <SortIcon columnKey="matricula" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('statusCliente')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Status Cliente</span> <SortIcon columnKey="statusCliente" /></div>
                        </th>

                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('situacaoOS')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Situação OS</span> <SortIcon columnKey="situacaoOS" /></div>
                        </th>

                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-center group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('isPadronizado')}>
                          <div className="flex items-center justify-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Padronizado</span> <SortIcon columnKey="isPadronizado" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-right group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('diasTranscorridos')}>
                          <div className="flex items-center justify-end text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Corridos</span> <SortIcon columnKey="diasTranscorridos" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-right group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('diasAtraso')}>
                          <div className="flex items-center justify-end text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Atraso</span> <SortIcon columnKey="diasAtraso" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-2 h-10 text-center group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('situacao')}>
                          <div className="flex items-center justify-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Situação</span> <SortIcon columnKey="situacao" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_var(--color-gray-200)] px-4 h-10 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('funcionario')}>
                          <div className="flex items-center text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap"><span>Responsável</span> <SortIcon columnKey="funcionario" /></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {hook.resultadosFiltrados.map((row) => (
                        <tr key={row.id} className="hover:bg-brand-subtle transition-colors group">
                          
                          <td className={`px-4 py-3 text-xs font-medium text-ink-muted whitespace-nowrap ${row.situacao === "Vencida" ? "shadow-[inset_3px_0_0_var(--color-danger)]" : ""}`}>{row.dataAbertura}</td>
                          
                          <td className="px-2 py-3">
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-ink-body rounded text-[11px] font-mono font-medium border border-gray-200">
                              {row.codigoServico}
                            </span>
                          </td>
                          
                          <td className="px-2 py-3 text-[13px] font-semibold text-ink">{row.matricula}</td>

                          <td className="px-2 py-3">
                            {row.statusCliente !== "—" ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-ink-body border border-gray-200 truncate max-w-[130px]" title={row.statusCliente}>
                                {row.statusCliente}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-2 py-3">
                            {row.situacaoOS !== "—" ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-soft text-brand border border-brand-line truncate max-w-[100px]" title={row.situacaoOS}>
                                {row.situacaoOS}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          <td className="px-2 py-3 text-center">
                            {row.isPadronizado ? (
                              <Badge tone="success" icon={CheckCircle2}>Padronizado</Badge>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-3 text-right text-xs text-ink-body whitespace-nowrap"><span>{row.diasTranscorridos}</span> <span>dias</span></td>
                          
                          <td className="px-2 py-3 text-right text-xs whitespace-nowrap">
                            {row.diasAtraso > 0 ? (
                              <span className="font-semibold text-danger"><span>+{row.diasAtraso}</span> <span>{row.diasAtraso === 1 ? 'dia' : 'dias'}</span></span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-3 text-center">
                            {row.situacao === "Vencida" ? (
                              <Badge tone="danger" icon={AlertTriangle}>Vencida</Badge>
                            ) : (
                              <Badge tone="success">No prazo</Badge>
                            )}
                          </td>
                          
                          <td className="px-4 py-3 text-xs text-ink-body truncate max-w-[130px]" title={row.funcionario}>{row.funcionario}</td>
                        </tr>
                      ))}
                      
                      {hook.resultadosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-6 py-12 text-center text-ink-muted text-sm">
                            <Search size={24} className="mx-auto text-gray-300 mb-2" />
                            <span className="block font-semibold text-ink">Nenhuma análise encontrada</span>
                            <span className="block mt-1">Ajuste a busca ou use “Limpar filtros”.</span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>
            </>
          )}

        </div>
      </div>
    </div>
  );
}