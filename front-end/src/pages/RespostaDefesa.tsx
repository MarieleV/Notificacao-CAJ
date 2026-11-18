import { useRef } from "react";
import {
  Copy, Download, CheckCircle2,
  ChevronDown, X, FileText, Search,
  MessageSquareReply, Eraser
} from "lucide-react";

import { SectionBlock } from "../components/shared/SectionBlock";
import { CalculadoraDiasUteis } from "../components/shared/CalculadoraDiasUteis";
import { FiltroMatriculaLote } from "../components/shared/FiltroMatriculaLote";
import { Alert, Badge, Button, hintClass, inputClass, labelClass, PageHeader, textareaClass } from "../components/shared/ui";
import { CATEGORY_COLORS } from "../services/defesas";

// 1. Importando o Hook
import { useRespostaDefesa } from "../hooks/useRespostaDefesa";

export function RespostaDefesa() {
  // 2. Instanciando o hook
  const hook = useRespostaDefesa();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="h-full flex flex-col">

      <PageHeader
        icon={MessageSquareReply}
        title="Redigir Resposta de Defesa"
        description="Respostas a defesas com base no código de infração"
        actions={
          <>
            <Button variant="ghost-danger" icon={Eraser} onClick={hook.limparTela}>Limpar tela</Button>
            <CalculadoraDiasUteis
              open={hook.showCalculator}
              setOpen={hook.setShowCalculator}
              dataInicial={hook.calcDataInicial}
              setDataInicial={hook.setCalcDataInicial}
              prazo={hook.calcPrazo}
              setPrazo={hook.setCalcPrazo}
              customPrazo={hook.calcCustomPrazo}
              setCustomPrazo={hook.setCalcCustomPrazo}
              dataFinal={hook.calcDataFinal}
            />
          </>
        }
      />

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-8 max-w-5xl mx-auto space-y-6">

          {/* Bloco 1 — Seleção de Códigos */}
          <SectionBlock
            number={1}
            title="Seleção de Códigos de Infração"
            description="Selecione a infração referente ao caso do cliente"
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => hook.setDropdownOpen((v) => !v)}
                aria-expanded={hook.dropdownOpen}
                className={`w-full flex items-center justify-between gap-3 px-4 h-11 bg-white border rounded-md text-sm transition-colors ${
                  hook.dropdownOpen ? "border-brand ring-3 ring-brand/15" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <span className={hook.selectedCodes.length === 0 ? "text-ink-muted" : "text-ink font-medium"}>
                  {hook.selectedCodes.length === 0
                    ? "Clique para selecionar códigos de infração..."
                    : `${hook.selectedCodes.length} código(s) selecionado(s)`}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${hook.dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {hook.dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-[10px] shadow-xl overflow-hidden animate-slideUp">
                  <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Pesquisar por código, título ou categoria..."
                        value={hook.searchTerm}
                        onChange={(e) => hook.setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                    {hook.filteredCodes.length > 0 ? (
                      hook.filteredCodes.map((item) => {
                        const selected = hook.selectedCodes.includes(item.code);
                        return (
                          <button
                            type="button"
                            key={item.code}
                            onClick={() => hook.toggleCode(item.code)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${selected ? "bg-brand-soft" : "hover:bg-gray-50"}`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-brand border-brand" : "border-gray-300"}`}>
                              {selected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-semibold text-brand">{item.code}</span>
                                <span className="text-sm font-medium text-ink">{item.title}</span>
                                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium capitalize ${CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS]}`}>
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-sm text-ink-muted">Nenhum código corresponde à pesquisa.</div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <Button size="sm" onClick={() => hook.setDropdownOpen(false)}>Confirmar seleção</Button>
                  </div>
                </div>
              )}
            </div>

            {hook.selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {hook.selectedItems.map((item) => (
                  <div key={item.code} className="flex items-center gap-2 bg-brand-soft border border-brand-line rounded-md pl-2.5 pr-1 h-8">
                    <span className="text-xs font-mono font-semibold text-brand">{item.code}</span>
                    <span className="text-xs text-ink">{item.title}</span>
                    <button
                      type="button"
                      onClick={() => hook.toggleCode(item.code)}
                      aria-label={`Remover código ${item.code}`}
                      className="w-6 h-6 flex items-center justify-center rounded text-navy-muted hover:text-danger hover:bg-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(hook.selectedCodes.length === 0 || hook.camposObrigatoriosVazios) && (
              <Alert tone="warning" className="mt-4">
                {hook.selectedCodes.length === 0
                  ? "Selecione ao menos um código de infração para habilitar a geração de defesa."
                  : "Preencha o Nº da Defesa A.I. para prosseguir."}
              </Alert>
            )}
          </SectionBlock>

          {/* Bloco 2 — Dados da Notificação */}
          <SectionBlock
            number={2}
            title="Dados da Notificação"
            description="Preencha os dados necessários para embasar a defesa"
          >
            <FiltroMatriculaLote filtro={hook.filtroMatricula} idPrefix="defesa" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <label htmlFor="defesa-ai" className={labelClass}>
                  Defesa A.I. nº <span className="text-danger">*</span>
                </label>
                <input
                  id="defesa-ai"
                  value={hook.defesaAI}
                  onChange={(e) => hook.setDefesaAI(e.target.value)}
                  placeholder="Ex: 12345678"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="motivo-indeferimento" className={labelClass}>Motivo do indeferimento</label>
                <textarea
                  id="motivo-indeferimento"
                  value={hook.motivoIndeferimento}
                  onChange={(e) => hook.setMotivoIndeferimento(e.target.value)}
                  placeholder="Descreva o fundamento específico para a decisão. Ex: 'A constatação em campo não condiz com as alegações do morador...'"
                  rows={3}
                  aria-describedby="motivo-dica"
                  className={`${textareaClass} resize-y`}
                />
                <p id="motivo-dica" className={hintClass}>Este texto substitui a marcação de motivo de indeferimento na minuta final.</p>
              </div>
            </div>

            <Button
              size="lg"
              icon={FileText}
              className="w-full"
              onClick={hook.handleGenerate}
              disabled={hook.selectedCodes.length === 0 || hook.camposObrigatoriosVazios}
            >
              Gerar texto da defesa
            </Button>
          </SectionBlock>

          {/* Bloco 3 — Revisão e Edição */}
          {hook.step === "generated" && (
            <SectionBlock
              number={3}
              title="Revisão e Edição do Texto"
              description='Preencha os campos "XXX" e ajuste qualquer detalhe necessário.'
              className="animate-slideUp"
              headerAction={
                <div className="flex items-center gap-2 w-full justify-between md:justify-end mt-3 md:mt-0">
                  <Badge tone="success" icon={CheckCircle2} className="hidden md:inline-flex">Pronto para edição</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => hook.setReviewMode(hook.reviewMode === "preview" ? "edit" : "preview")}
                  >
                    {hook.reviewMode === "preview" ? "Editar texto" : "Visualizar"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={hook.handleCopy}
                    className={hook.copied ? "!text-success !border-success-line" : "text-brand"}
                  >
                    {hook.copied ? (
                      <>
                        <CheckCircle2 size={14} />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar texto
                      </>
                    )}
                  </Button>
                </div>
              }
            >
              {hook.reviewMode === "preview" ? (
                <div
                  onClick={() => hook.setReviewMode("edit")}
                  title="Clique para editar"
                  className="w-full min-h-96 p-5 bg-gray-50 border border-gray-200 rounded-md text-[13px] text-ink leading-relaxed whitespace-pre-wrap cursor-text transition-colors hover:border-brand/40 hover:bg-white"
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
                  className={`${textareaClass} h-96 p-5 font-mono text-[13px] resize-none`}
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
              className="animate-slideUp"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" size="lg" icon={FileText} className="flex-1" onClick={hook.handleDownloadPDF}>
                  Baixar em PDF
                </Button>
                <Button size="lg" icon={Download} className="flex-1" onClick={hook.handleDownloadWord}>
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
