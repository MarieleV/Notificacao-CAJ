import { 
  FileText, UploadCloud, CheckCircle2, AlertCircle, 
  Search, RefreshCw, FileSpreadsheet, Clock, CheckCircle, Calculator
} from "lucide-react";
import { SectionBlock } from "./../components/shared/SectionBlock";
import { useControleAnalises } from "./../hooks/useControleAnalises";

// Subcomponente de KPI para ficar elegante
function KpiCard({ title, value, subtitle, theme }: any) {
  const themes = {
    blue: "border-[#c3ddf8] bg-[#eef6ff] text-[#1a5fa8]",
    red: "border-red-200 bg-red-50 text-red-600",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    default: "border-gray-200 bg-gray-50 text-gray-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${themes[theme as keyof typeof themes]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-2">{title}</p>
      <p className="text-2xl font-bold tabular-nums leading-none">{value}</p>
      <p className="text-[10px] mt-1.5 font-medium opacity-70">{subtitle}</p>
    </div>
  );
}

export function ControleAnalises() {
  const hook = useControleAnalises();

  const total = hook.resultados.length;
  const vencidas = hook.resultados.filter(r => r.situacao === "Vencida").length;
  const noPrazo = total - vencidas;
  const padronizadas = hook.resultados.filter(r => r.padronizada === "Sim").length;

  return (
    <div className="h-full flex flex-col">
      {/* Modais de Feedback */}
      {hook.fileModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center text-center gap-3">
            {hook.fileModal.type === "success" && <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 size={26} className="text-emerald-500" /></div>}
            {hook.fileModal.type === "warning" && <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center"><AlertCircle size={26} className="text-amber-500" /></div>}
            {hook.fileModal.type === "error" && <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center"><AlertCircle size={26} className="text-red-500" /></div>}
            <p className="text-sm text-gray-700 leading-relaxed">{hook.fileModal.message}</p>
            <button onClick={() => hook.setFileModal(null)} className="mt-1 w-full py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-lg text-xs font-semibold transition-colors">
              OK
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Controle de Análises Vencidas</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Gestão de prazos e priorização de serviços</p>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex-1 overflow-auto bg-[#f0f4f8]">
        <div className="p-8 max-w-[1200px] mx-auto space-y-6">

          {/* SESSÃO 1: UPLOAD */}
          <SectionBlock number={1} title="Importação de Relatórios" description="Carregue as planilhas extraídas do sistema para cruzamento">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Box Upload OP00002 */}
              <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#1a5fa8]">
                  <FileSpreadsheet size={16} />
                  <span className="font-bold text-sm">Relatório OP00002</span>
                </div>
                <div className="flex items-center gap-3">
                  <input id="up-op" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "OP")} className="hidden" />
                  <label htmlFor="up-op" className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1a5fa8] hover:bg-[#154d8a] cursor-pointer transition-colors shadow-sm">
                    Escolher arquivo
                  </label>
                  <span className="text-xs text-gray-500 font-medium truncate flex-1">
                    {hook.fileNameOP || "Nenhum arquivo..."}
                  </span>
                </div>
              </div>

              {/* Box Upload 989 */}
              <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[#1a5fa8]">
                  <FileSpreadsheet size={16} />
                  <span className="font-bold text-sm">Relatório 989 (Opcional)</span>
                </div>
                <div className="flex items-center gap-3">
                  <input id="up-989" type="file" accept=".csv, .xlsx, .xls" onChange={(e) => hook.handleFileUpload(e, "989")} className="hidden" />
                  <label htmlFor="up-989" className="px-4 py-2 rounded-lg text-xs font-semibold text-[#1a5fa8] bg-white border border-[#1a5fa8] hover:bg-[#eef6ff] cursor-pointer transition-colors shadow-sm">
                    Escolher arquivo
                  </label>
                  <span className="text-xs text-gray-500 font-medium truncate flex-1">
                    {hook.fileName989 || "Nenhum arquivo..."}
                  </span>
                </div>
              </div>

            </div>

            <button
              onClick={hook.processarDados}
              disabled={hook.loading || hook.dadosOP.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow"
            >
              {hook.loading ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
              Processar e Analisar Prazos
            </button>
          </SectionBlock>

          {/* SESSÃO 2 E 3: RESULTADOS (Só aparece após processar) */}
          {hook.resultados.length > 0 && (
            <>
              {/* KPIS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
                <KpiCard title="Total Analisado" value={total} subtitle="registros válidos" theme="blue" />
                <KpiCard title="No Prazo" value={noPrazo} subtitle="dias transcorridos <= prazo" theme="emerald" />
                <KpiCard title="Vencidas" value={vencidas} subtitle="prazos extrapolados" theme="red" />
                <KpiCard title="Padronizadas (989)" value={padronizadas} subtitle="match encontrado" theme="default" />
              </div>

              {/* TABELA DE RESULTADOS */}
              <SectionBlock 
                icon={FileText} 
                title="Lista de Análises" 
                description="Monitoramento detalhado por matrícula"
                headerAction={
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar Matrícula, Código..."
                      value={hook.searchTerm}
                      onChange={(e) => hook.setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8]"
                    />
                  </div>
                }
              >
                <div className="overflow-x-auto -mx-6 mb-[-24px]">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-[#f8fafe] border-y border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Abertura</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-3 text-left text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider">Matrícula</th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Padronizada?</th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Transcorridos</th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Atraso</th>
                        <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Situação</th>
                        <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Funcionário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {hook.resultadosFiltrados.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 text-xs text-gray-600 whitespace-nowrap">{row.dataAbertura}</td>
                          <td className="px-4 py-3 text-xs font-mono font-medium text-gray-600">{row.codigoServico}</td>
                          <td className="px-4 py-3 text-sm font-bold text-[#0b1e35]">{row.matricula}</td>
                          <td className="px-4 py-3 text-center">
                            {row.padronizada === "Sim" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle size={10}/> Sim
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium">Não</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-700">{row.diasTranscorridos} dias</td>
                          <td className="px-4 py-3 text-center text-xs">
                            {row.diasAtraso > 0 ? (
                              <span className="font-bold text-red-600">+{row.diasAtraso}</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.situacao === "Vencida" ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                VENCIDA
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                NO PRAZO
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-600 truncate max-w-[150px]">{row.funcionario}</td>
                        </tr>
                      ))}
                      {hook.resultadosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhum resultado encontrado.</td>
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