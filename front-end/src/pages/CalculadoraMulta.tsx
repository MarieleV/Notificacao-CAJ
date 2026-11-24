import { ElementType, useState, useEffect } from "react";
import {
  Trash2, Calculator, ClipboardList, AlertCircle, 
  Droplets, Info, FileText, CheckCircle2, Copy, RefreshCw, Eraser, Plus, UserSearch
} from "lucide-react";

import { parseMonthYear, labelMonth } from "./../utils/dates";
import { fmtBRL } from "./../utils/masks";
import { DatePicker } from "./../components/shared/DatePicker";
import { MonthYearPicker } from "./../components/shared/MonthYearPicker";
import { MonthYearRangePicker } from "./../components/shared/MonthYearRangePicker";
import { SectionBlock } from "./../components/shared/SectionBlock";
import { FiltroMatriculaLote } from "./../components/shared/FiltroMatriculaLote";
import { Button, buttonClass, inputClass, labelClass, PageHeader, textareaClass } from "./../components/shared/ui";

import { useCalculadoraMulta, ManualRow } from "./../hooks/useCalculadoraMulta";

// ─── Subcomponentes (DRY) ────────────────────────────────────────────────────

const GridInput = ({ hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input
    {...props}
    className={`w-full px-2.5 border rounded-md text-xs text-ink focus:outline-none focus:ring-3 transition-colors h-[34px] placeholder:text-gray-400 ${
      hasError
        ? "border-danger bg-danger-soft focus:border-danger focus:ring-danger/15"
        : "border-gray-300 hover:border-gray-400 focus:border-brand focus:ring-brand/15 bg-white"
    } ${props.className || ""}`}
    aria-invalid={hasError || undefined}
  />
);

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ElementType;
  theme: "default" | "blue" | "red" | "emerald";
}

function KpiCard({ title, value, subtitle, icon: Icon, theme }: KpiCardProps) {
  const themes = {
    default: { wrapper: "border-gray-200 bg-white", icon: "text-ink-muted", title: "text-ink-muted", value: "text-ink", subtitle: "text-ink-muted" },
    blue: { wrapper: "border-brand-line bg-brand-subtle", icon: "text-brand", title: "text-brand", value: "text-brand", subtitle: "text-ink-muted" },
    red: { wrapper: "border-danger-line bg-danger-soft", icon: "text-danger", title: "text-danger", value: "text-danger", subtitle: "text-ink-muted" },
    emerald: { wrapper: "border-success-line bg-success-soft", icon: "text-success", title: "text-success", value: "text-success", subtitle: "text-ink-muted" }
  };
  
  const active = themes[theme];

  return (
    <div className={`rounded-[10px] border p-4 transition-colors ${active.wrapper}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={active.icon} />
        <p className={`text-xs font-medium ${active.title}`}>{title}</p>
      </div>
      <p className={`text-2xl font-semibold leading-tight ${active.value}`}>{value}</p>
      <p className={`text-xs mt-1 ${active.subtitle}`}>{subtitle}</p>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function CalculadoraMulta() {
  const {
    waterRows, waterPeriod, setWaterPeriod, waterReportText, setWaterReportText, copiedWater, setCopiedWater, waterResults,
    sewageRows, sewagePeriod, setSewagePeriod, sewageReportText, setSewageReportText, copiedSewage, setCopiedSewage, sewageResults,
    aiNumber, setAiNumber, removalDate, setRemovalDate, baseConsumption, setBaseConsumption, postRegRef, setPostRegRef,
    handleGeneratePeriod, addRow, removeRow, changeRow, applyFillRange, handleGenerateText, handleCopy, limparTela,
    filtroMatricula
  } = useCalculadoraMulta();

  // Estado para controlar o "arrastar" (Drag-to-Fill) estilo Excel
  const [dragFill, setDragFill] = useState<{
    active: boolean; type: "water" | "sewage" | null; field: keyof ManualRow | null;
    startIdx: number; currentIdx: number; val: string;
  }>({ active: false, type: null, field: null, startIdx: -1, currentIdx: -1, val: "" });

  // Dispara a aplicação dos dados quando o usuário solta o clique do mouse
  useEffect(() => {
    const handleMouseUp = () => {
      if (dragFill.active && dragFill.field && dragFill.type) {
        applyFillRange(dragFill.type, dragFill.field, dragFill.startIdx, dragFill.currentIdx, dragFill.val);
        setDragFill({ active: false, type: null, field: null, startIdx: -1, currentIdx: -1, val: "" });
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [dragFill, applyFillRange]);

  // ─── Renderização das Tabelas de Entrada ────────────────────────────────────

  const renderEntryTable = (stepNum: number, title: string, desc: string, type: "water" | "sewage") => {
    const rows = type === "water" ? waterRows : sewageRows;
    const period = type === "water" ? waterPeriod : sewagePeriod;
    const setPeriod = type === "water" ? setWaterPeriod : setSewagePeriod;
    
    return (
      <SectionBlock
        number={stepNum} title={title} description={desc}
        headerAction={
          <div className="w-full max-w-[240px]">
            <MonthYearRangePicker 
              value={period} onChange={(val) => { setPeriod(val); if (val) handleGeneratePeriod(val, type); }} 
              placeholder="Adicione um período..." 
            />
          </div>
        }
      >
        <div className="overflow-x-auto -mx-2 px-2 pb-2">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[90px_80px_80px_1fr_1fr_1fr_1fr_40px] gap-2 mb-2 px-1">
              {[
                "Mês/Ano", "Cons. Reg.", "Cons. Irreg.", "Valor Correto", "Serviço Correto", 
                "Valor Cobrado Errado", "Serv. Cobrado Errado", ""
              ].map((h, i) => (
                <div key={i} className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide leading-tight">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => {
                const dateError = row.monthYear.length === 7 && !parseMonthYear(row.monthYear);
                
                // Célula inteligente: sabe pular linha e possui o quadradinho de arrastar
                const renderCell = (field: keyof ManualRow, val: string, placeholder: string, customClass: string) => {
                  const isDraggingThis = dragFill.active && dragFill.type === type && dragFill.field === field;
                  const isHighlighted = isDraggingThis && idx >= Math.min(dragFill.startIdx, dragFill.currentIdx) && idx <= Math.max(dragFill.startIdx, dragFill.currentIdx);
                  
                  return (
                    <div 
                      className="relative group/cell"
                      onMouseEnter={() => {
                        if (dragFill.active && dragFill.type === type && dragFill.field === field) {
                          setDragFill(prev => ({ ...prev, currentIdx: idx }));
                        }
                      }}
                    >
                      <GridInput
                        id={`input-${type}-${field}-${idx}`} // ID dinâmico para navegação
                        value={val}
                        onChange={(e) => changeRow(row.id, field, e.target.value, type)}
                        placeholder={placeholder}
                        className={`${customClass} ${isHighlighted ? "!bg-brand-line !border-brand" : ""}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            document.getElementById(`input-${type}-${field}-${idx + 1}`)?.focus();
                          }
                        }}
                      />
                      {/* Quadradinho azul estilo Excel */}
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-brand border-[0.5px] border-white cursor-ns-resize opacity-0 group-hover/cell:opacity-100 transition-opacity z-10 shadow-sm"
                        onMouseDown={(e) => {
                           e.preventDefault(); // Evita selecionar o texto enquanto arrasta
                           setDragFill({ active: true, type, field, startIdx: idx, currentIdx: idx, val: val });
                        }}
                      />
                    </div>
                  );
                };

                return (
                  <div key={row.id}>
                    <div className="grid grid-cols-[90px_80px_80px_1fr_1fr_1fr_1fr_40px] gap-2 items-center group">
                      <GridInput
                        id={`input-${type}-monthYear-${idx}`}
                        value={row.monthYear}
                        onChange={(e) => changeRow(row.id, "monthYear", e.target.value, type)}
                        placeholder="MM/AAAA"
                        maxLength={7}
                        hasError={dateError}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            document.getElementById(`input-${type}-monthYear-${idx + 1}`)?.focus();
                          }
                        }}
                      />
                      {renderCell("consumption", row.consumption, "Ex: 20", "")}
                      {renderCell("irregularConsumption", row.irregularConsumption, "Ex: 15", "")}
                      {renderCell("correctValue", row.correctValue, "R$ Correto", "bg-brand-subtle border-brand-line")}
                      {renderCell("correctService", row.correctService, "R$ Serv. Cor.", "bg-brand-subtle border-brand-line")}
                      {renderCell("chargedValue", row.chargedValue, "R$ Cobrado", "bg-danger-soft/50 border-danger-line")}
                      {renderCell("chargedService", row.chargedService, "R$ Serv. Cob.", "bg-danger-soft/50 border-danger-line")}
                      <button
                        type="button"
                        onClick={() => removeRow(row.id, type)}
                        aria-label="Remover mês"
                        title="Remover mês"
                        className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-danger hover:bg-danger-soft transition-colors justify-self-center opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {dateError && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-danger px-1">
                        <AlertCircle size={12} /> Formato inválido. Use MM/AAAA.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {rows.length === 0 && (
              <div className="py-8 text-center text-ink-muted text-sm border border-dashed border-gray-300 rounded-md">
                Utilize o gerador de período acima ou clique abaixo para adicionar manualmente.
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => addRow(type)}
                className={buttonClass("ghost", "sm", "text-brand hover:text-brand-hover hover:bg-brand-soft")}
              >
                <Plus size={14} />
                Adicionar mês avulso
              </button>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex items-start gap-2">
              <Info size={15} className="text-ink-muted mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ink-body leading-relaxed">
                <strong>Dicas de produtividade:</strong> Use a tecla <strong>Enter</strong> para pular rapidamente para a célula de baixo.
                Para copiar um valor para outras linhas, passe o mouse sobre o campo preenchido e <strong>clique e arraste o quadradinho azul</strong> no canto inferior direito (como no Excel).
              </p>
            </div>
          </div>
        </div>
      </SectionBlock>
    );
  };

  // ─── Renderização dos Resultados ─────────────────────────────────────────────

  const renderResultSection = (title: string, results: typeof waterResults, isSewage: boolean) => {
    const qtdMeses = results.calcRows.length;
    const textoMeses = qtdMeses === 1 ? "1 mês" : `${qtdMeses} meses`;

    if (qtdMeses === 0) return null;

    return (
      <section className="bg-white rounded-[10px] border border-gray-200 overflow-hidden animate-slideUp">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isSewage ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"}`}>
            <Droplets size={16} />
          </span>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="overflow-x-auto custom-scrollbar -mx-2 px-2">
            <table className="w-full text-[13px] min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 h-10">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Mês</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Vol. Recup. (m³)</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-brand uppercase tracking-wide bg-brand-soft border-l border-white rounded-tl-md">Valor Correto</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-brand uppercase tracking-wide bg-brand-soft">Serviço Correto</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-brand uppercase tracking-wide bg-brand-soft border-r border-white rounded-tr-md">Total Correto</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-danger uppercase tracking-wide bg-danger-soft rounded-tl-md">Valor Errado</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-danger uppercase tracking-wide bg-danger-soft">Serviço Errado</th>
                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-danger uppercase tracking-wide bg-danger-soft rounded-tr-md">Total Errado</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Diferença R$</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.calcRows.map((c) => {
                  const positive = c.diff >= 0;
                  return (
                    <tr key={c.row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">
                        {labelMonth(c.row.monthYear)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-gray-700">
                        {String(c.diffM3).replace(".", ",")} m³
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-brand bg-brand-subtle">
                        {c.row.correctValue ? `R$ ${c.row.correctValue}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-brand bg-brand-subtle">
                        {c.row.correctService ? `R$ ${c.row.correctService}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-brand bg-brand-subtle">
                        {fmtBRL(c.totalCorrect)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-danger bg-danger-soft/50">
                        {c.row.chargedValue ? `R$ ${c.row.chargedValue}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-danger bg-danger-soft/50">
                        {c.row.chargedService ? `R$ ${c.row.chargedService}` : "R$ 0,00"}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-danger bg-danger-soft/50">
                        {fmtBRL(c.totalCharged)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums font-semibold ${positive ? "text-success" : "text-danger"}`}>
                        {fmtBRL(c.diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="px-4 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-wide">Totais</td>
                  <td className="px-3 py-3 text-right tabular-nums text-xs font-semibold text-gray-700">{String(results.totalM3).replace(".", ",")} m³</td>
                  <td colSpan={2} className="bg-brand-soft/70"></td>
                  <td className="px-3 py-3 text-right tabular-nums text-sm font-semibold text-brand bg-brand-soft/70 rounded-b-md">{fmtBRL(results.grandCorrect)}</td>
                  <td colSpan={2} className="bg-danger-soft/70"></td>
                  <td className="px-3 py-3 text-right tabular-nums text-sm font-semibold text-danger bg-danger-soft/70 rounded-b-md">{fmtBRL(results.grandCharged)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums text-sm font-semibold ${results.grandDiff >= 0 ? "text-success" : "text-danger"}`}>
                    {fmtBRL(results.grandDiff)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Vol. Recuperado" value={`${String(results.totalM3).replace(".", ",")} m³`} subtitle="diferença (reg. - irreg.)" icon={Droplets} theme="default" />
            <KpiCard title="Valor Correto" value={fmtBRL(results.grandCorrect)} subtitle="soma dos valores corretos" icon={Calculator} theme="blue" />
            <KpiCard title="Cobrado" value={fmtBRL(results.grandCharged)} subtitle="soma dos valores errados" icon={AlertCircle} theme="red" />
            <KpiCard title="Diferença a Lançar" value={fmtBRL(Math.abs(results.grandDiff))} subtitle={results.grandDiff >= 0 ? "a cobrar do cliente" : "cobrado a mais do cliente"} icon={ClipboardList} theme={results.grandDiff >= 0 ? "emerald" : "red"} />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 flex items-start gap-2">
            <Info size={15} className="text-ink-muted mt-0.5 flex-shrink-0" />
            <p className="text-sm text-ink-body leading-relaxed">
              <strong>Resumo:</strong> Nos {textoMeses} de irregularidade apurados, o valor correto total seria de <strong>{fmtBRL(results.grandCorrect)}</strong>, porém foi cobrado apenas <strong>{fmtBRL(results.grandCharged)}</strong>. A diferença financeira de <strong>{fmtBRL(Math.abs(results.grandDiff))}</strong> representa o ajuste a ser lançado referente ao volume recuperado de <strong>{String(results.totalM3).replace(".", ",")} m³</strong>.
            </p>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        icon={Calculator}
        title="Tabela de Multas"
        description="Apuração do valor correto vs. cobrado"
        actions={<Button variant="ghost-danger" icon={Eraser} onClick={limparTela}>Limpar tela</Button>}
      />

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-8 max-w-5xl mx-auto space-y-10">

          <SectionBlock icon={UserSearch} title="Filtro de Matrícula" description="Selecione o responsável e navegue pelos casos importados do Controle de Análises">
            <FiltroMatriculaLote filtro={filtroMatricula} idPrefix="calc" />
          </SectionBlock>

          <div className="space-y-6">
            {renderEntryTable(1, "Lançamento de Água", "Insira os valores corretos (calculados externamente) e os valores cobrados.", "water")}
            {renderResultSection("Apuração Detalhada - Água", waterResults, false)}
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-6">
            {renderEntryTable(2, "Lançamento de Esgoto", "Insira os valores corretos e cobrados especificamente para o esgoto.", "sewage")}
            {renderResultSection("Apuração Detalhada - Esgoto", sewageResults, true)}
          </div>

          <hr className="border-gray-200" />

          <SectionBlock number={3} title="Emissão de Laudos de Apuração" description="Insira os dados complementares para gerar o texto final copiável">
            <div className="space-y-6">
              <div className="mb-8">
                <p className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                  <FileText size={15} className="text-brand"/> Dados complementares do laudo
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Número do AI</label>
                    <input value={aiNumber} onChange={(e) => setAiNumber(e.target.value.replace(/\D/g, ""))} placeholder="Ex: 14036735" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Data de Retirada (Corte)</label>
                    <DatePicker value={removalDate} onChange={setRemovalDate} placeholder="DD/MM/AAAA" />
                  </div>
                  <div>
                    <label className={labelClass}>Consumo base (m³)</label>
                    <input value={baseConsumption} onChange={(e) => setBaseConsumption(e.target.value.replace(/\D/g, ""))} placeholder="Ex: 49" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Mês de Referência</label>
                    <MonthYearPicker value={postRegRef} onChange={setPostRegRef} placeholder="MM/AAAA" size="md" />
                  </div>
                </div>

                <div className="mt-4 bg-brand-soft border border-brand-line rounded-md px-3 py-2.5 flex items-start gap-2">
                  <Info size={14} className="text-brand mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-ink-body leading-relaxed">
                    Os valores de <strong>período</strong>, <strong>valor correto</strong>, <strong>valor cobrado</strong>,
                    <strong> diferença</strong> e <strong>volume total recuperado</strong> são preenchidos automaticamente a partir dos cálculos das tabelas acima.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-ink">Laudo de Água</h4>
                    <div className="flex items-center gap-2">
                      <Button size="sm" icon={RefreshCw} onClick={() => handleGenerateText("water")} disabled={waterRows.length === 0}>
                        Gerar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleCopy(waterReportText, setCopiedWater)} disabled={!waterReportText} className={copiedWater ? "!text-success !border-success-line" : "text-brand"}>
                        {copiedWater ? <><CheckCircle2 size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                      </Button>
                    </div>
                  </div>
                  <textarea value={waterReportText} onChange={(e) => setWaterReportText(e.target.value)} placeholder={waterRows.length === 0 ? "Adicione meses na tabela de Água e clique em [Gerar]..." : "O texto da Água aparecerá aqui."} rows={12} className={`${textareaClass} px-4 py-3 bg-gray-50 focus:bg-white font-mono text-[13px] resize-none`} spellCheck={false} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-ink">Laudo de Esgoto</h4>
                    <div className="flex items-center gap-2">
                      <Button size="sm" icon={RefreshCw} onClick={() => handleGenerateText("sewage")} disabled={sewageRows.length === 0}>
                        Gerar
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleCopy(sewageReportText, setCopiedSewage)} disabled={!sewageReportText} className={copiedSewage ? "!text-success !border-success-line" : "text-brand"}>
                        {copiedSewage ? <><CheckCircle2 size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                      </Button>
                    </div>
                  </div>
                  <textarea value={sewageReportText} onChange={(e) => setSewageReportText(e.target.value)} placeholder={sewageRows.length === 0 ? "Adicione meses na tabela de Esgoto e clique em [Gerar]..." : "O texto do Esgoto aparecerá aqui."} rows={12} className={`${textareaClass} px-4 py-3 bg-gray-50 focus:bg-white font-mono text-[13px] resize-none`} spellCheck={false} />
                </div>
              </div>
              
              <p className="mt-2 text-xs text-ink-muted flex items-center gap-1.5">
                <Info size={13} />
                Dica: clique em qualquer texto gerado para ajustá-lo antes de copiar.
              </p>
            </div>
          </SectionBlock>

        </div>
      </div>
    </div>
  );
}