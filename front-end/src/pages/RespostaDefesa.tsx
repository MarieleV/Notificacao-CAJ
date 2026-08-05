import { useState, useRef } from "react";
import {
  Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Search, Calculator,
  MessageSquareReply, Check
} from "lucide-react";

import { DatePicker } from "../components/shared/DatePicker";
import { SectionBlock } from "../components/shared/SectionBlock";
import { CATEGORY_COLORS } from "../services/defesas";

// 1. Importando o Cérebro (Hook)
import { useRespostaDefesa } from "../hooks/useRespostaDefesa";

export function RespostaDefesa() {
  // 2. Instanciando o hook
  const hook = useRespostaDefesa();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Estado local apenas para o feedback visual de cópia da data na calculadora
  const [calcCopiado, setCalcCopiado] = useState(false);

  // Função para copiar a data da calculadora
  const handleCopiarDataCalc = () => {
    if (!hook.calcDataFinal) return;
    navigator.clipboard.writeText(hook.calcDataFinal);
    setCalcCopiado(true);
    setTimeout(() => setCalcCopiado(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareReply size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Redigir Resposta de Defesa</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Módulo de respostas baseadas em infrações</p>
        </div>

        {/* BOTÃO DA CALCULADORA */}
        <div className="relative">
          <button
            onClick={() => hook.setShowCalculator((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              hook.showCalculator
                ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]"
                : "bg-white border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] shadow-sm"
            }`}
          >
            <Calculator size={16} />
            Calculadora de Dias Úteis
          </button>

          {/* MODAL: CALCULADORA DE DIAS ÚTEIS */}
          {hook.showCalculator && (
            <div className="absolute top-full right-0 mt-3 w-full sm:min-w-[380px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right z-50 animate-slideUp">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-[#1a5fa8]" />
                  <h2 className="text-[#0b1e35] font-bold text-sm">Calculadora de Dias Úteis</h2>
                </div>
                <button onClick={() => hook.setShowCalculator(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Data Inicial</label>
                  <DatePicker value={hook.calcDataInicial} onChange={hook.setCalcDataInicial} placeholder="DD/MM/AAAA" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prazo de Resposta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={hook.calcPrazo}
                      onChange={(e) => hook.setCalcPrazo(e.target.value)}
                      className="col-span-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] transition-all"
                    >
                      <option value="15">15 dias úteis</option>
                      <option value="30">30 dias úteis</option>
                      <option value="45">45 dias úteis</option>
                      <option value="60">60 dias úteis</option>
                      <option value="90">90 dias úteis</option>
                      <option value="X">X dias úteis (Personalizar)</option>
                    </select>

                    {hook.calcPrazo === "X" && (
                      <input
                        type="number"
                        min="1"
                        value={hook.calcCustomPrazo}
                        onChange={(e) => hook.setCalcCustomPrazo(e.target.value)}
                        placeholder="Qtd. dias"
                        className="col-span-2 w-full px-3 py-2 border border-[#1a5fa8] rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a5fa8]"
                      />
                    )}
                  </div>
                </div>

                {/* Bloco interativo de cópia da Data Final */}
                <div className="bg-[#f8fafe] border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Data Final Calculada:</span>
                  
                  {hook.calcDataFinal ? (
                    <button 
                      onClick={handleCopiarDataCalc}
                      title="Copiar data"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg shadow-sm hover:border-[#1a5fa8] hover:shadow-md transition-all group outline-none focus:ring-2 focus:ring-blue-100 active:scale-95"
                    >
                      <span className="text-sm font-bold text-[#1a5fa8]">
                        {hook.calcDataFinal}
                      </span>
                      {calcCopiado ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : (
                        <Copy size={16} className="text-blue-300 group-hover:text-[#1a5fa8] transition-colors" />
                      )}
                    </button>
                  ) : (
                    <span className="text-sm font-bold text-gray-400 mr-2">
                      --/--/----
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => hook.setShowCalculator(false)} className="px-5 py-2 bg-[#1a5fa8] text-white text-xs font-bold rounded-lg hover:bg-[#154d8a] transition-all">
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Bloco 1 — Seleção de Códigos */}
          <SectionBlock
            number={1}
            title="Seleção de Códigos de Infração"
            description="Selecione a infração referente ao caso do cliente"
          >
            <div className="relative">
              <button
                onClick={() => hook.setDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#1a5fa8] hover:bg-[#f0f7ff] transition-all"
              >
                <span className="text-gray-500">
                  {hook.selectedCodes.length === 0
                    ? "Clique para selecionar códigos de infração..."
                    : `${hook.selectedCodes.length} código(s) selecionado(s)`}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${hook.dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {hook.dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar por código, título ou categoria..."
                        value={hook.searchTerm}
                        onChange={(e) => hook.setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {hook.filteredCodes.length > 0 ? (
                      hook.filteredCodes.map((item) => {
                        const selected = hook.selectedCodes.includes(item.code);
                        return (
                          <button
                            key={item.code}
                            onClick={() => hook.toggleCode(item.code)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#f0f7ff] transition-colors ${selected ? "bg-[#f0f7ff]" : ""}`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-[#1a5fa8] border-[#1a5fa8]" : "border-gray-300"}`}>
                              {selected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                                <span className="text-sm font-medium text-gray-800">{item.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]}`}>
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">Nenhum código encontrado.</div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => hook.setDropdownOpen(false)}
                      className="px-4 py-1.5 bg-[#1a5fa8] text-white text-xs rounded-lg hover:bg-[#154d8a] transition-colors"
                    >
                      Confirmar Seleção
                    </button>
                  </div>
                </div>
              )}
            </div>

            {hook.selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {hook.selectedItems.map((item) => (
                  <div key={item.code} className="flex items-center gap-1.5 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                    <span className="text-xs text-[#0b1e35]">{item.title}</span>
                    <button onClick={() => hook.toggleCode(item.code)} className="text-[#4a7fa5] hover:text-red-500 transition-colors ml-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(hook.selectedCodes.length === 0 || hook.camposObrigatoriosVazios) && (
              <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                <p className="text-xs">
                  {hook.selectedCodes.length === 0
                    ? "Selecione ao menos um código de infração para habilitar a geração de defesa."
                    : "Preencha o Nº da Defesa A.I. para prosseguir."}
                </p>
              </div>
            )}
          </SectionBlock>

          {/* Bloco 2 — Dados da Notificação */}
          <SectionBlock
            number={2}
            title="Dados da Notificação"
            description="Preencha os dados necessários para embasar a defesa"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Defesa A.I. nº <span className="text-red-500">*</span>
                </label>
                <input
                  value={hook.defesaAI}
                  onChange={(e) => hook.setDefesaAI(e.target.value)}
                  placeholder="Ex: 12345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Motivo do Indeferimento</label>
                <textarea
                  value={hook.motivoIndeferimento}
                  onChange={(e) => hook.setMotivoIndeferimento(e.target.value)}
                  placeholder="Descreva o fundamento específico para a decisão. Ex: 'A constatação em campo não condiz com as alegações do morador...'"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] transition-all resize-y"
                />
                <p className="text-[10px] text-gray-400 mt-1">Este texto substituirá automaticamente a marcação de 'motivo de indeferimento' na minuta final.</p>
              </div>
            </div>

            <button
              onClick={hook.handleGenerate}
              disabled={hook.selectedCodes.length === 0 || hook.camposObrigatoriosVazios}
              className="w-full mt-2 flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              <FileText size={18} />
              Gerar Texto da Defesa
            </button>
          </SectionBlock>

          {/* Bloco 3 — Revisão e Edição */}
          {hook.step === "generated" && (
            <SectionBlock
              number={3}
              title="Revisão e Edição do Texto"
              description='Preencha os campos "XXX" e ajuste qualquer detalhe necessário.'
              className="animate-fadeIn"
              headerAction={
                <div className="flex items-center gap-3 w-full justify-between md:justify-end mt-3 md:mt-0">
                  <span className="hidden md:inline-block text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    Pronto para edição!
                  </span>
                  <button
                    onClick={() => hook.setReviewMode(hook.reviewMode === "preview" ? "edit" : "preview")}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all bg-white"
                  >
                    {hook.reviewMode === "preview" ? "Editar Texto" : "Modo Visualização"}
                  </button>
                  <button
                    onClick={hook.handleCopy}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-[#1a5fa8] text-[#1a5fa8] rounded-lg text-xs font-semibold hover:bg-[#eef6ff] transition-all bg-white"
                  >
                    {hook.copied ? (
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
              {hook.reviewMode === "preview" ? (
                <div
                  onClick={() => hook.setReviewMode("edit")}
                  className="w-full min-h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text hover:border-[#1a5fa8]/40 transition-all"
                >
                  {hook.generatedText}
                </div>
              ) : (
                <textarea
                  ref={textAreaRef}
                  autoFocus
                  value={hook.generatedText}
                  onChange={(e) => hook.setGeneratedText(e.target.value)}
                  onBlur={() => hook.setReviewMode("preview")}
                  className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                  spellCheck={false}
                />
              )}
            </SectionBlock>
          )}

          {/* Bloco 4 — Exportação */}
          {hook.step === "generated" && (
            <SectionBlock 
              number={4} 
              title="Exportação e Entrega" 
              description="Baixe o arquivo de resposta formatado em PDF ou Word" 
              className="animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={hook.handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                >
                  <FileText size={17} />
                  Baixar em PDF
                </button>

                <button
                  onClick={hook.handleDownloadWord}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Download size={17} />
                  Baixar .docx
                </button>
              </div>
            </SectionBlock>
          )}
        </div>
      </div>
    </div>
  );
}