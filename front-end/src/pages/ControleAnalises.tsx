import React, { Component, ErrorInfo, ReactNode } from "react";
import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, 
  Search, RefreshCw, FileSpreadsheet, Clock, Calculator,
  PieChart, AlertTriangle, Filter, ArrowUpDown, ArrowDown, ArrowUp, FileCheck, X, Eraser, ChevronDown
} from "lucide-react";
import { SectionBlock } from "./../components/shared/SectionBlock";
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
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50 text-center animate-fadeIn">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-[#0b1e35]">Ops! A interface sofreu uma interferência.</h2>
          <p className="text-gray-500 mt-2 mb-6">Uma extensão do seu navegador (como tradutores ou corretores) alterou a estrutura da página.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-xl font-bold shadow-md transition-all">
            Recarregar Página
          </button>
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
    return hook.sortConfig.direction === "asc" ? <ArrowUp size={12} className="text-[#1a5fa8] ml-1" /> : <ArrowDown size={12} className="text-[#1a5fa8] ml-1" />;
  };

  const limparFiltros = () => {
    hook.setSearchTerm("");
    hook.setFiltroCodigo("");
    hook.setFiltroStatusCliente("");
    hook.setFiltroFuncionario("");
    hook.setFiltroSituacao("Todas");
    hook.setFiltroSituacaoOS([]); 
  };

  const isFiltroAtivo = hook.searchTerm !== "" || hook.filtroCodigo !== "" || hook.filtroStatusCliente !== "" || hook.filtroFuncionario !== "" || hook.filtroSituacao !== "Todas" || hook.filtroSituacaoOS.length > 0;

  return (
    <div className="h-full flex flex-col">
      
      {/* ─── MODAL DE FEEDBACK ─── */}
      {hook.fileModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-4 transform transition-all scale-100">
            {hook.fileModal.type === "success" && <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center ring-8 ring-emerald-50/50"><CheckCircle2 size={32} className="text-emerald-500" /></div>}
            {hook.fileModal.type === "warning" && <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center ring-8 ring-amber-50/50"><AlertTriangle size={32} className="text-amber-500" /></div>}
            {hook.fileModal.type === "error" && <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center ring-8 ring-red-50/50"><AlertCircle size={32} className="text-red-500" /></div>}
            
            <p className="text-sm font-medium text-gray-700 leading-relaxed mt-2">{hook.fileModal.message}</p>
            
            <button onClick={() => hook.setFileModal(null)} className="mt-4 w-full py-3 bg-[#0b1e35] hover:bg-[#1a5fa8] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ─── CABEÇALHO ─── */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Controle de Análises Vencidas</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Gestão inteligente de prazos e priorização de serviços.</p>
        </div>
        
        <button onClick={hook.limparTela} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-all">
          <Eraser size={16} /> Limpar Tela
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#f4f7f9] custom-scrollbar">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">

          {/* SESSÃO 1: UPLOAD */}
          <SectionBlock number={1} title="Importação de Relatórios" description="Carregue as planilhas extraídas do Sansys para realizar o cruzamento de dados">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              
              <label translate="no" htmlFor="up-op" className={`notranslate h-full relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${hook.fileNameOP ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' : 'border-blue-200 bg-[#f8fafe] hover:bg-blue-50/50 hover:border-[#1a5fa8]'}`}>
                <input id="up-op" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "OP")} className="hidden" />
                
                {hook.fileNameOP ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3"><CheckCircle2 size={24} className="text-emerald-600" /></div>
                    <span className="font-bold text-sm text-emerald-800 text-center">Relatório OP00002 Anexado</span>
                    <span className="text-xs text-emerald-600/80 font-medium truncate max-w-[250px] mt-1">{hook.fileNameOP}</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><UploadCloud size={24} className="text-[#1a5fa8]" /></div>
                    <span className="font-bold text-sm text-[#0b1e35] text-center">Relatório OP00002</span>
                    <span className="text-[11px] text-gray-400 font-medium mt-1">Base Obrigatória</span>
                  </>
                )}
              </label>

              <div className="flex flex-col gap-4">
                
                <label translate="no" htmlFor="up-989-cliente" className={`notranslate flex-1 relative flex items-center p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${hook.fileName989Cliente ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                  <input id="up-989-cliente" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "989_Cliente")} className="hidden" />
                  
                  {hook.fileName989Cliente ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mr-4"><CheckCircle2 size={20} className="text-emerald-600" /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-xs text-emerald-800">989 Status Cliente Anexado</span>
                        <span className="text-[10px] text-emerald-600/80 font-medium truncate mt-0.5">{hook.fileName989Cliente}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform"><FileSpreadsheet size={20} className="text-gray-500" /></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0b1e35]">Relatório 989 - Status Cliente</span>
                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">Base Opcional</span>
                      </div>
                    </>
                  )}
                </label>

                <label translate="no" htmlFor="up-989-caj" className={`notranslate flex-1 relative flex items-center p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${hook.fileName989CAJ ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'}`}>
                  <input id="up-989-caj" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "989_CAJ")} className="hidden" />
                  
                  {hook.fileName989CAJ ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mr-4"><CheckCircle2 size={20} className="text-emerald-600" /></div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-xs text-emerald-800">344v3setor Encerrado/Executado Anexado</span>
                        <span className="text-[10px] text-emerald-600/80 font-medium truncate mt-0.5">{hook.fileName989CAJ}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform"><FileSpreadsheet size={20} className="text-gray-500" /></div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#0b1e35]">Relatório 344v3setor - Encerrado/Executado</span>
                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">Base Opcional</span>
                      </div>
                    </>
                  )}
                </label>
              </div>

            </div>

            <button onClick={hook.processarDados} disabled={hook.loading || hook.dadosOP.length === 0} className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none">
              {hook.loading ? <RefreshCw size={18} className="animate-spin" /> : <Calculator size={18} />} Processar e Analisar Prazos
            </button>
          </SectionBlock>

          {/* SESSÃO DE RESULTADOS */}
          {hook.resultados.length > 0 && (
            <>
              {/* ─── DASHBOARD DE KPIs ─── */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 animate-fadeIn">
                
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Volume Listado</p>
                      <h3 className="text-3xl font-black text-[#0b1e35] mt-2"><span>{total}</span></h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-[#1a5fa8] rounded-xl"><PieChart size={20} /></div>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                      <span className="text-emerald-600"><span>{noPrazo}</span> <span>No Prazo</span></span>
                      <span className="text-red-500"><span>{qtdVencidas}</span> <span>Vencidas</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${total > 0 ? (noPrazo/total)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Padronizadas</p>
                      <h3 className="text-3xl font-black text-emerald-600 mt-2"><span>{padronizadas}</span></h3>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><FileCheck size={20} /></div>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                      <span className="text-emerald-600"><span>{padronizadas}</span> <span>Padronizadas</span></span>
                      <span className="text-gray-500"><span>{naoPadronizadas}</span> <span>Restantes</span></span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all duration-500" title="Padronizadas" style={{ width: `${total > 0 ? (padronizadas/total)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Atrasos Ativos</p>
                      <h3 className="text-3xl font-black text-red-600 mt-2"><span>{qtdVencidas}</span></h3>
                    </div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={20} /></div>
                  </div>
                  <p className="text-[11px] font-medium text-gray-400 mt-5">Processos requerendo atenção imediata.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Média de Atraso</p>
                      <h3 className="text-3xl font-black text-amber-500 mt-2">
                        <span>{mediaAtraso}</span> <span className="text-sm font-bold text-amber-500/60">dias</span>
                      </h3>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Clock size={20} /></div>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                    <ArrowUp size={14} className="text-red-500" />
                    <span>Pico de atraso:</span> <strong className="text-red-600 font-bold"><span>{maxAtraso}</span> <span>dias</span></strong>
                  </div>
                </div>

              </div>

              {/* TABELA DE RESULTADOS */}
              <SectionBlock icon={FileText} title="Monitoramento Detalhado" description="Listagem completa ordenada da mais atrasada para a mais recente" headerAction={
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a5fa8] transition-colors" />
                    <input type="text" placeholder="Busca Global Rápida..." value={hook.searchTerm} onChange={(e) => hook.setSearchTerm(e.target.value)} className="w-full sm:w-72 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all shadow-sm" />
                  </div>
                }
              >
                
                {/* ─── BARRA DE FILTROS AVANÇADOS ─── */}
                <div className="flex flex-wrap items-center gap-3 mb-5 p-3 bg-gray-50/80 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-2 mr-2">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Filtros</span>
                  </div>
                  
                  <input type="text" placeholder="Código..." value={hook.filtroCodigo} onChange={(e) => hook.setFiltroCodigo(e.target.value)} className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] focus:outline-none transition-all shadow-sm" />
                  <input type="text" placeholder="Status Cliente..." value={hook.filtroStatusCliente} onChange={(e) => hook.setFiltroStatusCliente(e.target.value)} className="w-32 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] focus:outline-none transition-all shadow-sm" />

                  {/* DROPDOWN DE MÚLTIPLA ESCOLHA PARA SITUAÇÃO OS */}
                  <div className="relative">
                    <button onClick={() => hook.setDropdownOSOpen(!hook.dropdownOSOpen)} className="w-36 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 flex justify-between items-center hover:bg-gray-50 focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] transition-all shadow-sm">
                      <span className="truncate">
                        <span>{hook.filtroSituacaoOS.length === 0 ? "Situação OS" : `${hook.filtroSituacaoOS.length} Selecionada(s)`}</span>
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${hook.dropdownOSOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {hook.dropdownOSOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => hook.setDropdownOSOpen(false)} />
                        <div className="absolute z-50 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 top-full left-0 flex flex-col gap-0.5">
                          {["Programado", "Pendente", "Postergada"].map(opt => (
                            <label key={opt} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-xs text-gray-700 font-medium transition-colors">
                              <input type="checkbox" checked={hook.filtroSituacaoOS.includes(opt)} onChange={() => hook.toggleFiltroSituacaoOS(opt)} className="rounded border-gray-300 text-[#1a5fa8] focus:ring-[#1a5fa8] w-3.5 h-3.5" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <input type="text" placeholder="Filtrar Responsável..." value={hook.filtroFuncionario} onChange={(e) => hook.setFiltroFuncionario(e.target.value)} className="flex-1 min-w-[120px] px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] focus:outline-none transition-all shadow-sm" />

                  <div className="relative">
                    <select value={hook.filtroSituacao} onChange={(e) => hook.setFiltroSituacao(e.target.value)} className="w-32 pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] focus:outline-none transition-all shadow-sm appearance-none cursor-pointer">
                      <option value="Todas">Situações</option>
                      <option value="Vencida">Vencida</option>
                      <option value="No Prazo">No Prazo</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  {isFiltroAtivo && (
                    <button onClick={limparFiltros} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <X size={14} strokeWidth={2.5} /> Limpar Filtros
                    </button>
                  )}
                </div>

                {/* ─── TABELA DE DADOS ─── */}
                <div className="overflow-auto max-h-[450px] -mx-4 mb-[-24px] custom-scrollbar border-t border-gray-100">
                  <table translate="no" className="notranslate w-full text-sm min-w-[900px] border-collapse relative">
                    <thead className="sticky top-0 z-20">
                      <tr>
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-4 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('dataAbertura')}>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Abertura</span> <SortIcon columnKey="dataAbertura" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('codigoServico')}>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Código</span> <SortIcon columnKey="codigoServico" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('matricula')}>
                          <div className="flex items-center text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider"><span>Matrícula</span> <SortIcon columnKey="matricula" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('statusCliente')}>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Status Cliente</span> <SortIcon columnKey="statusCliente" /></div>
                        </th>

                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('situacaoOS')}>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Situação OS</span> <SortIcon columnKey="situacaoOS" /></div>
                        </th>

                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-center group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('isPadronizado')}>
                          <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Padronizado</span> <SortIcon columnKey="isPadronizado" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-right group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('diasTranscorridos')}>
                          <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Corridos</span> <SortIcon columnKey="diasTranscorridos" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-right group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('diasAtraso')}>
                          <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Atraso</span> <SortIcon columnKey="diasAtraso" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-2 py-3 text-center group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('situacao')}>
                          <div className="flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Situação</span> <SortIcon columnKey="situacao" /></div>
                        </th>
                        
                        <th className="bg-white shadow-[0_1px_0_0_#e5e7eb] px-4 py-3 text-left group cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => hook.requestSort('funcionario')}>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"><span>Responsável</span> <SortIcon columnKey="funcionario" /></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {hook.resultadosFiltrados.map((row) => (
                        <tr key={row.id} className="hover:bg-[#f8fafe] transition-colors group">
                          
                          <td className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{row.dataAbertura}</td>
                          
                          <td className="px-2 py-3">
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-mono font-medium border border-gray-200">
                              {row.codigoServico}
                            </span>
                          </td>
                          
                          <td className="px-2 py-3 text-[13px] font-semibold text-[#0b1e35]">{row.matricula}</td>

                          <td className="px-2 py-3">
                            {row.statusCliente !== "—" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200 truncate max-w-[130px]" title={row.statusCliente}>
                                {row.statusCliente}
                              </span>
                            ) : (
                              <span className="text-gray-300 font-medium text-[10px]">—</span>
                            )}
                          </td>

                          <td className="px-2 py-3">
                            {row.situacaoOS !== "—" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#1a5fa8] border border-blue-100 truncate max-w-[100px]" title={row.situacaoOS}>
                                {row.situacaoOS}
                              </span>
                            ) : (
                              <span className="text-gray-300 font-medium text-[10px]">—</span>
                            )}
                          </td>

                          <td className="px-2 py-3 text-center">
                            {row.isPadronizado ? (
                              <span className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                <CheckCircle2 size={12} strokeWidth={3} /> PADRONIZADO
                              </span>
                            ) : (
                              <span className="text-gray-300 font-medium text-[10px]">—</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-3 text-right text-xs font-medium text-gray-600 whitespace-nowrap"><span>{row.diasTranscorridos}</span> <span>dias</span></td>
                          
                          <td className="px-2 py-3 text-right text-xs whitespace-nowrap">
                            {row.diasAtraso > 0 ? (
                              <span className="font-bold text-red-500"><span>+{row.diasAtraso}</span> <span>{row.diasAtraso === 1 ? 'dia' : 'dias'}</span></span>
                            ) : (
                              <span className="text-gray-300 font-medium">—</span>
                            )}
                          </td>
                          
                          <td className="px-2 py-3 text-center">
                            {row.situacao === "Vencida" ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                                VENCIDA
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                                NO PRAZO
                              </span>
                            )}
                          </td>
                          
                          <td className="px-4 py-3 text-[11px] font-medium text-gray-500 truncate max-w-[130px]">{row.funcionario}</td>
                        </tr>
                      ))}
                      
                      {hook.resultadosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-6 py-10 text-center text-gray-400 text-sm font-medium">
                            <Search size={28} className="mx-auto text-gray-200 mb-2" />
                            Nenhum resultado encontrado para os filtros aplicados.
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