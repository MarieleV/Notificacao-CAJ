import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Copy, CheckCircle2,
  Scale, FileCheck, FileX, Clock, HelpCircle, FileText, File, FileDown,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from "lucide-react";
import { jsPDF } from "jspdf";

type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
type TipoCasoType = "leitura" | "servico" | "corte_cavalete" | "hd" | "la_padronizada" | "la_cadastral" | "prorrogacao";

// ─── Helpers de Data ──────────────────────────────────────────────────────────

function get60BusinessDaysFromToday(): string {
  const d = new Date();
  let added = 0;
  while (added < 60) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      added++;
    }
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

function parseMonthYear(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

function labelMonth(mmyyyy: string): string {
  const d = parseMonthYear(mmyyyy);
  if (!d) return mmyyyy;
  return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "").replace(/^\w/, (c) => c.toUpperCase());
}

function parseFullDate(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

function labelFullDate(s: string): string {
  const d = parseFullDate(s);
  if (!d) return s;
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

// ─── Componente: Seletor de Mês/Ano (Calendário) ──────────────────────────────

function MonthYearPicker({
  value,
  onChange,
  placeholder,
  size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  size?: "sm" | "md";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => {
    const parsed = parseMonthYear(value);
    return parsed ? parsed.getFullYear() : new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = parseMonthYear(value);

  function handleToggle() {
    if (!isOpen) {
      setViewYear(selected ? selected.getFullYear() : new Date().getFullYear());
    }
    setIsOpen((v) => !v);
  }

  function selectMonth(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onChange(`${mm}/${viewYear}`);
    setIsOpen(false);
  }

  const buttonSizeClasses =
    size === "md"
      ? "w-full px-3 py-2.5 text-sm rounded-lg"
      : "w-[128px] px-2.5 py-1.5 text-xs rounded-md";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 border transition-all bg-white ${buttonSizeClasses} ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20" : "border-gray-200"
        } ${selected ? "text-gray-700" : "text-gray-400"}`}
      >
        <span className="truncate">{selected ? labelMonth(value) : placeholder}</span>
        <CalendarIcon size={size === "md" ? 14 : 12} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[210px] bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-[#0b1e35] tabular-nums">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS_SHORT.map((m, idx) => {
              const isSelected =
                !!selected && selected.getFullYear() === viewYear && selected.getMonth() === idx;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(idx)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1a5fa8] text-white"
                      : "text-gray-600 hover:bg-[#eef6ff] hover:text-[#1a5fa8]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente: Seletor de Data Completa (Dia/Mês/Ano) ───────────────────────

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    const parsed = parseFullDate(value);
    return parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selected = parseFullDate(value);

  function handleToggle() {
    if (!isOpen) {
      const parsed = parseFullDate(value);
      setViewDate(parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date());
    }
    setIsOpen((v) => !v);
  }

  function changeMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  function selectDay(day: number) {
    const dd = String(day).padStart(2, "0");
    const mm = String(viewDate.getMonth() + 1).padStart(2, "0");
    const yyyy = viewDate.getFullYear();
    onChange(`${dd}/${mm}/${yyyy}`);
    setIsOpen(false);
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase());

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-1.5 w-full px-3 py-2 border rounded-lg text-sm transition-all bg-white ${
          isOpen ? "border-[#1a5fa8] ring-1 ring-[#1a5fa8]/20" : "border-gray-200"
        } ${selected ? "text-gray-700" : "text-gray-400"}`}
      >
        <span className="truncate">{selected ? labelFullDate(value) : placeholder}</span>
        <CalendarIcon size={14} className="text-[#1a5fa8] flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-[260px] bg-white border border-gray-200 rounded-lg shadow-xl p-3">
          <div className="flex items-center justify-between mb-2.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-bold text-[#0b1e35]">{monthLabel}</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-[#eef6ff] text-gray-500 hover:text-[#1a5fa8] transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS_SHORT.map((w, i) => (
              <div key={i} className="text-[10px] text-center text-gray-400 font-semibold">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const isSelected =
                !!selected &&
                selected.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-7 w-7 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#1a5fa8] text-white"
                      : "text-gray-600 hover:bg-[#eef6ff] hover:text-[#1a5fa8]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function OuvidoriaManager() {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [generatedText, setGeneratedText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- CONTROLE DE FLUXO ---
  const [isRecurso, setIsRecurso] = useState<boolean>(true);

  // --- ESTADOS DOS CAMPOS DO PROCESSO ---
  const [matricula, setMatricula] = useState("");
  const [morador, setMorador] = useState("");
  const [tipoManifestacao, setTipoManifestacao] = useState("Recurso Administrativo");
  const [numProcesso, setNumProcesso] = useState("");
  const [numAutoInfracao, setNumAutoInfracao] = useState("");

  // --- CONFIGURAÇÃO DO CASO ---
  const [tipoCaso, setTipoCaso] = useState<TipoCasoType>("leitura");
  const [decisao, setDecisao] = useState<DecisaoType>(null);

  // --- VARIÁVEIS DOS TEMPLATES (Exibidas condicionalmente) ---
  const [dataGeracaoAI, setDataGeracaoAI] = useState("");
  const [mesesSemAcesso, setMesesSemAcesso] = useState("");
  const [dataConstatacaoInfracao, setDataConstatacaoInfracao] = useState("");
  const [protServico, setProtServico] = useState("");
  const [recebedorCorreios, setRecebedorCorreios] = useState("");
  const [dataRecebimentoAR, setDataRecebimentoAR] = useState("");
  const [dataAplicacaoSancao, setDataAplicacaoSancao] = useState("");
  const [dataDecisaoAnterior, setDataDecisaoAnterior] = useState("");
  const [faturaReferencia, setFaturaReferencia] = useState("");

  // Lógica para esconder campos inúteis dependendo do tipo do caso
  const isLeitura = tipoCaso === "leitura";
  const isServico = tipoCaso === "servico";
  const isCorte = tipoCaso === "corte_cavalete";
  const isHd = tipoCaso === "hd";
  const isPadronizada = tipoCaso === "la_padronizada";
  const isCadastral = tipoCaso === "la_cadastral";
  const isProrrogacao = tipoCaso === "prorrogacao";

  const isSimples = isPadronizada || isCadastral || isProrrogacao;
  const isRecursoEnxuto = isRecurso && (isLeitura || isServico) && (decisao === "deferir" || decisao === "parcial");

  // Regras de renderização das variáveis
  const showDataGeracaoAI = !isSimples && !isRecursoEnxuto;
  const showMesesSemAcesso = isLeitura && !isRecursoEnxuto;
  const showDataConstatacao = (isServico || isCorte || isHd) && !isRecursoEnxuto;
  const showProtServico = isServico && !isRecursoEnxuto;
  const showRecebedorAR = !isSimples && !isRecursoEnxuto;
  const showDataRecebimentoAR = isHd || isProrrogacao;
  const showDataAplicacaoSancao = !isSimples && !isRecursoEnxuto;
  const showDataDecisaoAnterior = !isRecurso && decisao === "indeferir" && !isSimples;
  const showFaturaReferencia = !isProrrogacao;

  // Lidar com a troca de opções do tipo de caso
  const handleTipoCasoChange = (val: TipoCasoType) => {
    setTipoCaso(val);
    if (val === "la_padronizada" || val === "la_cadastral" || val === "prorrogacao") {
      setDecisao("deferir"); // Auto-seleciona para simplificar, já que só possuem uma resposta positiva
    } else {
      setDecisao(null);
    }
  };

  // 100% GERAÇÃO LOCAL
  const handleGenerateParecer = () => {
    if (!matricula || !numProcesso || !decisao) {
      alert("Por favor, preencha a Matrícula, o Número do Processo e selecione uma Decisão de Mérito.");
      return;
    }

    const tplMorador = morador || "[NOME DO MORADOR]";
    const tplMatricula = matricula || "[MATRÍCULA]";
    const tplProc = numProcesso || "[Nº DO PROCESSO]";
    const tplAI = numAutoInfracao || "[AUTO INFRAÇÃO]";
    const tplFatura = faturaReferencia || "[FATURA]";
    const tplGeracao = dataGeracaoAI || "[DATA GERAÇÃO AI]";
    const tplAplicacao = dataAplicacaoSancao || "[DATA APLICAÇÃO SANÇÃO]";
    const tplConstatacao = dataConstatacaoInfracao || "[DATA CONSTATAÇÃO]";
    const tplRecebedor = recebedorCorreios || "[RECEBEDOR AR]";
    const tplRecebimentoAR = dataRecebimentoAR || "[DATA RECEBIMENTO AR]";
    const tplMeses = mesesSemAcesso || "[MESES SEM ACESSO]";
    const tplProtServico = protServico || "[PROTOCOLO SERVIÇO]";
    const tplDecisaoAnterior = dataDecisaoAnterior || "[DATA DECISÃO ANTERIOR]";
    const tplPrazo = get60BusinessDaysFromToday();

    let tpl = "";

    // =======================================================
    // TEXTOS: É RECURSO? -> SIM
    // =======================================================
    if (isRecurso) {
      if (tipoCaso === "leitura") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}.\nComo não houve apresentação de defesa, nem a padronização obrigatória da ligação de água, as sanções foram aplicadas e constam na FAT ${tplFatura}.\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n02. DECISÃO:\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n03. PRORROGAÇÃO: Fica o prazo de padronização prorrogado por 60 (sessenta) dias úteis a contar da data desta decisão.\nNovo prazo para padronizar a ligação de água vence em ${tplPrazo}.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        } else {
          tpl = `Recurso protocolo ${tplProc}\nMorador: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS.\nFato Gerador: Impedimento involuntário para execução de leituras.\nMeses sem acesso: ${tplMeses}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\nComo não houve apresentação de defesa nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.\nRevisando os fatos, [MANTEMOS A APLICAÇÃO POIS NÃO HÁ COMPROVAÇÃO DE IMPOSSIBILIDADE TÉCNICA].\n02. DECISÃO:\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: atendimento@aguasdejoinville.com.br.\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        }
      } else if (tipoCaso === "servico") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. Objeto: Aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}.\nComo não houve apresentação de defesa, nem a padronização obrigatória da ligação de água, as sanções foram aplicadas e constam na FAT ${tplFatura}.\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n02. DECISÃO:\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n03. PRORROGAÇÃO: Fica o prazo de padronização prorrogado por 60 (sessenta) dias úteis a contar da data desta decisão.\nNovo prazo para padronizar a ligação de água vence em ${tplPrazo}.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara poder viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        } else {
          tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: Aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.\nFato gerador: Impedimento Involuntário para execução do serviço.\nData da constatação: ${tplConstatacao}\nProtocolo de serviço: ${tplProtServico}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\nComo não houve apresentação de defesa, nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.\nRevisando os fatos, [NÃO IDENTIFICAMOS EXCLUDENTE DE RESPONSABILIDADE QUE JUSTIFIQUE A RETIRADA].\n02. DECISÃO:\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida Pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: atendimento@aguasdejoinville.com.br.\n\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
        }
      } else if (tipoCaso === "corte_cavalete") {
        tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. Objeto : Multa por Violação do corte cavalete\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso X da Resolução 019/2019 - ARIS.\nFato gerador: Violação do corte de cavalete\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\nComo não houve apresentação de defesa nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.\nAnalisando os fatos, há registro de que foi confirmado a violação do corte conforme imagens.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\n02.DECISÃO:\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão da multa aplicada por não padronização obrigatória da ligação de água, em estrita observância à Instrução Normativa nº 83/2025.\nQuanto à multa por violação do corte, não é possível, pois foi constatado a violação.\nA FAT ${tplFatura} foi corrigida e está anexa, com a exclusão da multa por não execução da padronização obrigatória da ligação de água.\n03.PRORROGAÇÃO: Fica o prazo de padronização prorrogado por 60 (sessenta) dias úteis a contar da data desta decisão.\nNovo prazo para padronizar a ligação de água vence em ${tplPrazo}.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação de padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de multa independentemente de nova notificação.\n\nPara padronizar, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)`;
      } else if (tipoCaso === "hd") {
        tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. Objeto : Multa por Danificação do hidrômetro.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso VI da Resolução 019/2019 - ARIS.\nFato gerador: Danificação do hidrômetro.\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor} em ${tplRecebimentoAR}.\nComo não houve apresentação de defesa, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.\nAnalisando os fatos, [DESCREVER O DANO COM BASE NOS FATOS], conforme imagens abaixo.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\nDECIDIMOS\nMANTER a aplicação de penalidades referente ao Auto de Infração nº ${tplAI}:\n- Multa por Danificação, inversão e/ou supressão do hidrômetro, no valor correspondente;\n\n(Se houver Consumo estimado):\nVisto ter havido retenção de consumo pelo fato, conforme Resolução ARIS 19/2019, o prestador de serviço pode cobrar o consumo estimado de água e esgoto retido, ao primeiro consumo do ciclo completo após a regularização da ligação de água, tendo sido então cobrados a Revisão do faturamento.`;
      }
    } 
    // =======================================================
    // TEXTOS: É RECURSO? -> NÃO
    // =======================================================
    else {
      if (tipoCaso === "leitura") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\nObjeto: Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nII – DO PROCESSO ADMINISTRATIVO\nAuto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da Resolução ARIS nº 019/2019, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o Processo Administrativo de Fiscalização para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibilidade normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por 60 (sessenta) dias úteis, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da Resolução ARIS nº 019/2019.\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\nMorador: ${tplMorador}\nMatrícula: ${tplMatricula}\nObjeto: Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água, conforme disposto.\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da Resolução ARIS nº 019/2019, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor}, conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o Processo Administrativo de Fiscalização para análise da Agência Reguladora.\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: atendimento@aguasdejoinville.com.br.`;
        }
      } else if (tipoCaso === "servico") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\nObjeto: Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao impedimento involuntário de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da Resolução ARIS nº 019/2019, tendo como fato gerador o impedimento involuntário para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nApós a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o Processo Administrativo de Fiscalização para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibilidade normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por 60 (sessenta) dias úteis, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da Resolução ARIS nº 019/2019.\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À ouvidoria,\nRecurso Administrativo nº ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\nObjeto: Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao impedimento involuntário de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da Resolução ARIS nº 019/2019, tendo como fato gerador o impedimento involuntário para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\nDiante da ausência de apresentação de defesa administrativa e da não adequação da ligação de água às normas vigentes, as penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: atendimento@aguasdejoinville.com.br.`;
        }
      } else if (tipoCaso === "la_padronizada") {
        tpl = `Recurso prot. ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente viabilizou a padronização da ligação de água e solicita cancelamento das multas.\n02. DECISÃO:\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "la_cadastral") {
        tpl = `Recurso prot. ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente atualizou o cadastro e solicita o cancelamento da multa.\nTendo o cliente atendido as exigências contidas na notificação recebida,\n02. DECISÃO:\nRETIFICAR, a decisão proferida, retirando a multa aplicada. A FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "prorrogacao") {
        tpl = `Recurso protocolo ${tplProc}\nMorador cadastrado: ${tplMorador}\nMatrícula: ${tplMatricula}\n01. OBJETO: AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente solicita prazo para atender à padronização obrigatória referente notificação recebida em ${tplRecebimentoAR}.\nConsiderando que cliente nos comunicou antes da aplicação das sanções e que a necessidade de prorrogação foi justificada,\n02.DECISÃO:\nPRORROGAR o prazo de padronização em mais 60 (sessenta) dias úteis, a contar do prazo de vencimento constante no Auto de Infração lavrado. Novo prazo expira em ${tplPrazo} .\nA não padronização da ligação de água dentro do novo prazo poderá acarretar aplicação de sanções, independentemente de nova notificação.\nApós cliente solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal, deve adquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão. Após instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço. A caixa padrão CAJ deve estar aprovada dentro do novo prazo acordado. O serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nPadronize sua ligação de água.\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
      }
    }

    setGeneratedText(tpl);
    setStep("generated");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(generatedText, 10, 10, { maxWidth: 190 });
    doc.save(`Parecer_${tipoCaso}_${numProcesso}.pdf`);
  };

  const handleDownloadWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Parecer Exportado</title></head><body>";
    const footer = "</body></html>";
    const html = header + generatedText.replace(/\n/g, "<br>") + footer;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Parecer_${tipoCaso}_Proc_${numProcesso || matricula}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      </div>

      <div className="flex-1 overflow-auto bg-[#f8fafe]">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* SESSÃO 1: IDENTIFICAÇÃO DO PROCESSO */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Dados Globais da Manifestação</h2>
                <p className="text-gray-500 text-xs">Insira os dados cadastrais básicos obtidos na triagem do manifesto</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome Completo do Morador</label>
                  <input value={morador} onChange={(e) => setMorador(e.target.value)} placeholder="Ex: Nome Completo do Usuário" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Matrícula</label>
                  <input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Ex: XXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nº do Processo / Manifesto</label>
                  <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} placeholder="Ex: Número do processo triado" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Auto de Infração (A.I.) Vinculado</label>
                  <input value={numAutoInfracao} onChange={(e) => setNumAutoInfracao(e.target.value)} placeholder="Ex: XXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
              </div>
            </div>
          </div>

          {/* SESSÃO 2: TIPO DE INFRAÇÃO */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Tipo de Infração (Objeto)</h2>
                <p className="text-gray-500 text-xs">Selecione o enquadramento do fato gerador do auto de infração</p>
              </div>
            </div>

            <div className="p-6">
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
                onChange={(e) => handleTipoCasoChange(e.target.value as TipoCasoType)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] focus:bg-[#eef6ff] transition-all cursor-pointer"
              >
                {isRecurso ? (
                  <>
                    <option value="leitura">Leitura</option>
                    <option value="servico">Serviço</option>
                    <option value="corte_cavalete">Violação de corte de cavalete</option>
                    <option value="hd">Hidrômetro danificado</option>
                  </>
                ) : (
                  <>
                    <option value="leitura">Leitura</option>
                    <option value="servico">Serviços</option>
                    <option value="la_padronizada">LA Padronizada</option>
                    <option value="la_cadastral">Atualização Cadastral (LA)</option>
                    <option value="prorrogacao">Não multado/Prorrogação de Prazo</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* SESSÃO 3: VEREDICTO DE MÉRITO (Escondida nos casos Simples) */}
          {!isSimples && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Veredicto Final e Conclusão</h2>
                  <p className="text-gray-500 text-xs">Defina o posicionamento formal de mérito da CAJ frente ao recurso</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setDecisao("deferir")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "deferir" ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className={decisao === "deferir" ? "text-emerald-600" : "text-gray-400"} size={20} />
                      <span className="font-bold text-sm">1. Deferir (Retificar)</span>
                    </div>
                    <p className="text-xs text-gray-500">Cancela as penalidades. Padronização realizada cfe protocolo.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisao("parcial")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "parcial" ? "border-amber-500 bg-amber-50 text-amber-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className={decisao === "parcial" ? "text-amber-600" : "text-gray-400"} size={20} />
                      <span className="font-bold text-sm">2. Deferir Parcialmente</span>
                    </div>
                    <p className="text-xs text-gray-500">Retira as multas atuais mas concede prorrogação de 90 dias.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisao("indeferir")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${decisao === "indeferir" ? "border-red-500 bg-red-50 text-red-900 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileX className={decisao === "indeferir" ? "text-red-600" : "text-gray-400"} size={20} />
                      <span className="font-bold text-sm">3. Indeferir (Ratificar)</span>
                    </div>
                    <p className="text-xs text-gray-500">Mantém integralmente as penalidades e orienta o parcelamento.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SESSÃO 4: REQUISITOS VARIÁVEIS (Apenas os relevantes aparecem) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Variáveis e Datas da Irregularidade</h2>
                <p className="text-gray-500 text-xs">Apenas os campos pertinentes a esta infração estão sendo exibidos abaixo</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {showDataGeracaoAI && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Geração A.I.</label>
                    <DatePicker 
                      value={dataGeracaoAI} 
                      onChange={setDataGeracaoAI} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showMesesSemAcesso && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-1">Meses sem acesso</label>
                    <input 
                      value={mesesSemAcesso} 
                      onChange={(e) => setMesesSemAcesso(e.target.value)} 
                      placeholder="Ex: Jan/2026 a Mar/2026" 
                      className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] bg-[#eef6ff] transition-all" 
                    />
                  </div>
                )}

                {showDataConstatacao && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Data Constatação/Imped.</label>
                    <DatePicker 
                      value={dataConstatacaoInfracao} 
                      onChange={setDataConstatacaoInfracao} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}
                
                {showProtServico && (
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 tracking-wider uppercase mb-1">Nº Prot. Serviço</label>
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
                    <DatePicker 
                      value={dataRecebimentoAR} 
                      onChange={setDataRecebimentoAR} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showDataAplicacaoSancao && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Aplicação Sanções</label>
                    <DatePicker 
                      value={dataAplicacaoSancao} 
                      onChange={setDataAplicacaoSancao} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showDataDecisaoAnterior && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Decisão Anterior</label>
                    <DatePicker 
                      value={dataDecisaoAnterior} 
                      onChange={setDataDecisaoAnterior} 
                      placeholder="DD/MM/AAAA" 
                    />
                  </div>
                )}

                {showFaturaReferencia && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fatura (Competência)</label>
                    <MonthYearPicker 
                      value={faturaReferencia} 
                      onChange={setFaturaReferencia} 
                      placeholder="MM/AAAA" 
                      size="md" 
                    />
                  </div>
                )}

              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateParecer}
            disabled={!decisao || !matricula}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles size={18} />
            Emitir Minuta de Parecer Oficial
          </button>

          {/* ÁREA DE EXIBIÇÃO E EXPORTAÇÃO DA MINUTA */}
          {step === "generated" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={13} />
                  </span>
                  <div>
                    <h2 className="text-[#0b1e35] font-semibold text-sm">Revisão e Edição do Parecer</h2>
                    <p className="text-gray-500 text-xs">Clique no texto para personalizar qualquer detalhe necessário</p>
                  </div>
                </div>
                
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

              <div className="p-6">
                <textarea
                  ref={textAreaRef}
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                />
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</span>
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Exportação e Entrega</h2>
                  <p className="text-gray-500 text-xs">Baixe o arquivo formatado em Microsoft Word ou PDF</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}