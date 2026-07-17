import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Copy, CheckCircle2, Scale, FileCheck, FileX, Clock, 
  HelpCircle, FileText, File, Info, ChevronDown, ChevronUp, 
  MessageSquare, Calculator, X
} from "lucide-react";

// --- IMPORTAÇÕES DA NOVA ARQUITETURA ---
import { calculateEndDate, getBusinessDaysDifference, get60BusinessDaysFromToday } from "../lib/dates";
import { formatName } from "../lib/masks";
import { DatePicker } from "./shared/DatePicker";
import { MonthYearPicker } from "./shared/MonthYearPicker";
import { MonthYearRangePicker } from "./shared/MonthYearRangePicker";
import { SectionBlock } from "./shared/SectionBlock";

type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
type TipoCasoType = "leitura" | "servico" | "corte_cavalete" | "hd" | "bypass" | "clandestina" | "la_padronizada" | "la_cadastral" | "prorrogacao";
type DefesaType = "com_defesa" | "sem_defesa";

// ─── Componente: Bloco Editável e Copiável com Altura Dinâmica (Guia Sansys) ───
function EditableCopyBlock({ defaultText }: { defaultText: string }) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(defaultText);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    if (!isDirty) {
      setText(defaultText);
    }
  }, [defaultText, isDirty]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsDirty(false);
    setText(defaultText);
  };

  const lineCount = text.split('\n').length;
  const dynamicRows = Math.max(lineCount, 2);

  return (
    <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono border border-gray-200 focus-within:border-[#1a5fa8] focus-within:ring-1 focus-within:ring-[#1a5fa8]/20 focus-within:bg-white transition-all shadow-sm">
      <div className="flex justify-end mb-1.5 gap-4">
        {isDirty && (
          <button 
            onClick={handleReset} 
            className="text-[10px] text-amber-600 hover:underline flex items-center font-bold"
          >
            Desfazer Edição
          </button>
        )}
        <button 
          onClick={handleCopy} 
          className="text-[10px] text-[#1a5fa8] hover:underline flex items-center gap-1 font-bold"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12}/>}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsDirty(true);
        }}
        rows={dynamicRows}
        className="w-full bg-transparent border-none resize-none focus:outline-none text-gray-700 leading-relaxed overflow-hidden"
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function OuvidoriaManager() {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [generatedText, setGeneratedText] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- CONTROLE DE FLUXO ---
  const [isRecurso, setIsRecurso] = useState<boolean>(true);
  const [historicoDefesa, setHistoricoDefesa] = useState<DefesaType>("sem_defesa");

  // --- ESTADOS DOS CAMPOS DO PROCESSO ---
  const [matricula, setMatricula] = useState("");
  const [morador, setMorador] = useState("");
  const [tipoManifestacao, setTipoManifestacao] = useState("Recurso Administrativo");
  const [numProcesso, setNumProcesso] = useState("");
  const [numAutoInfracao, setNumAutoInfracao] = useState("");
  const [dataEmissaoFatura, setDataEmissaoFatura] = useState("");
  const [dataManifestacao, setDataManifestacao] = useState("");
  
  // Cálculo da diferença usando o helper importado
  const diasUteisDif = getBusinessDaysDifference(dataEmissaoFatura, dataManifestacao);
  const isForaDoPrazo = dataEmissaoFatura && dataManifestacao && diasUteisDif > 30;

  // --- CONFIGURAÇÃO DO CASO ---
  const [tipoCaso, setTipoCaso] = useState<TipoCasoType>("leitura");
  const [decisao, setDecisao] = useState<DecisaoType>(null);
  const [tipoServico, setTipoServico] = useState<"voluntario" | "involuntario">("involuntario");

  // Novos estados para a seleção de Deferimento Específico
  const [deferirMotivo, setDeferirMotivo] = useState<"la_padronizada" | "fato_novo" | null>(null);
  const [fatoNovoStatus, setFatoNovoStatus] = useState<"notificado" | "multado" | null>(null);

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
  const [dataDefesa, setDataDefesa] = useState("");
  const [protDefesa, setProtDefesa] = useState("");
  const [dataIndeferimento, setDataIndeferimento] = useState("");
  const [protIndeferimento, setProtIndeferimento] = useState("");

  const [dataRecebimentoAI, setDataRecebimentoAI] = useState("");
  const [tipoRecebimentoAI, setTipoRecebimentoAI] = useState("Correios");

  // --- ESTADOS: TRATATIVAS SANSYS ---
  const [guiaSansysOpen, setGuiaSansysOpen] = useState(false);
  const [canalResposta, setCanalResposta] = useState("email");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [aplicaIN83, setAplicaIN83] = useState(true);
  const [temRestituicao, setTemRestituicao] = useState(false);
  const [statusMulta426, setStatusMulta426] = useState("aplicada");
  const [tipoIndeferido, setTipoIndeferido] = useState("padrao");
  const [protContatoAtivo, setProtContatoAtivo] = useState("");
  const [faturaAlterada, setFaturaAlterada] = useState(false);

  // --- ESTADOS DA CALCULADORA DE PRAZOS ---
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutsideCalculator(event: MouseEvent) {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node)) {
        setShowCalculator(false);
      }
    }
    if (showCalculator) document.addEventListener("mousedown", handleClickOutsideCalculator);
    return () => document.removeEventListener("mousedown", handleClickOutsideCalculator);
  }, [showCalculator]);
  
  const [calcPrazo, setCalcPrazo] = useState<string>("15");
  const [calcCustomPrazo, setCalcCustomPrazo] = useState<string>("");
  const [calcDataInicial, setCalcDataInicial] = useState<string>("");

  const durationNum = calcPrazo === "X" ? parseInt(calcCustomPrazo || "0", 10) : parseInt(calcPrazo, 10);
  const calcDataFinal = calculateEndDate(calcDataInicial, durationNum);

  // ─── LÓGICA DE CONDICIONAIS DE EXIBIÇÃO ───
  const isLeitura = tipoCaso === "leitura";
  const isServico = tipoCaso === "servico";
  const isCorte = tipoCaso === "corte_cavalete";
  const isHd = tipoCaso === "hd";
  const isBypass = tipoCaso === "bypass";
  const isClandestina = tipoCaso === "clandestina";
  const isPadronizada = tipoCaso === "la_padronizada";
  const isCadastral = tipoCaso === "la_cadastral";
  const isProrrogacao = tipoCaso === "prorrogacao";

  const isSimples = isPadronizada || isCadastral || isProrrogacao;
  const isRecursoEnxuto = isRecurso && (isLeitura || isServico) && (decisao === "deferir" || decisao === "parcial");

  const hasDecisaoButtons = isLeitura || isServico;
  const hasDefesaToggle = true; 
  const showSessao3 = hasDecisaoButtons || hasDefesaToggle;

  const numSessao3 = showSessao3 ? 3 : undefined;
  const numSessao4 = showSessao3 ? 4 : 3;
  const numSessao5 = showSessao3 ? 5 : 4;

  const showDataGeracaoAI = !isSimples && !isRecursoEnxuto;
  const showMesesSemAcesso = isLeitura && !isRecursoEnxuto;
  const showDataConstatacao = (isServico || isCorte || isHd || isBypass || isClandestina) && !isRecursoEnxuto;
  const showProtServico = (isServico || isBypass || isClandestina) && !isRecursoEnxuto;
  const showRecebedorAR = !isSimples && !isRecursoEnxuto;
  const showDataRecebimentoAR = isHd || isProrrogacao || isBypass || isClandestina;
  const showDataAplicacaoSancao = !isSimples && !isRecursoEnxuto && !isBypass && !isClandestina;
  const showDataDecisaoAnterior = !isRecurso && decisao === "indeferir" && !isSimples;
  const showFaturaReferencia = !isProrrogacao && !isBypass && !isClandestina;
  const showDefesaCampos = historicoDefesa === "com_defesa";

  const handleTipoCasoChange = (val: TipoCasoType) => {
    setTipoCaso(val);
    setDeferirMotivo(null);
    setFatoNovoStatus(null);

    if (val === "leitura" || val === "servico") {
      setDecisao(null); 
    } else {
      setDecisao("deferir"); 
    }
  };

  const handleDecisaoChange = (val: DecisaoType) => {
    setDecisao(val);
    if (val !== "deferir") {
      setDeferirMotivo(null);
      setFatoNovoStatus(null);
    }
  };

  // ─── FUNÇÕES DE AUXÍLIO: TRATATIVAS SANSYS ───
  const getParte2Text = (withRestituicao = true) => {
    const prazoStr = get60BusinessDaysFromToday();
    const fat = faturaReferencia || "[FATURA]";
    
    if (decisao === "deferir") {
      let t = "Processo Deferido";
      if (aplicaIN83) t += ", em atendimento a IN 83/2025";
      if (withRestituicao && temRestituicao) t += ". Solicitar restituição das multas pagas pelo e-mail **atendimento@aguasdejoinville.com.br**";
      else t += `. FAT ${fat} corrigida.`;
      return t;
    }
    if (decisao === "parcial") {
      let t = "Processo Deferido parcialmente";
      if (aplicaIN83) t += " em atendimento a IN 83/2025,";
      else t += ",";
      t += ` prorrogado prazo da padronização até ${prazoStr}.`;
      if (withRestituicao && temRestituicao) t += " Solicitar restituição das multas pagas pelo e-mail **atendimento@aguasdejoinville.com.br**";
      else t += ` FAT ${fat} corrigida.`;
      return t;
    }
    if (decisao === "indeferir") {
      if (tipoIndeferido === "in83_aceite") return `Processo Indeferido. Caso cliente aceite padronizar a ligação de água, pode solicitar prazo para a execução e revisão da fatura em atendimento a IN 83/2025. Nova solicitação expira em ${prazoStr}. FAT ${fat} inalterada.`;
      if (tipoIndeferido === "in83_expirado") return `Processo Indeferido. Prazo para padronização conforme IN 83/2025 expirado. FAT ${fat} inalterada.`;
      return `Processo Indeferido. FAT ${fat} inalterada.`;
    }
    return "Decisão não definida";
  };

  const getParte1Text = () => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    if (canalResposta === "email") return `Informar cliente pelo e-mail ${clienteEmail || "[E-MAIL]"}, em ${hoje} sobre teor do docto anexado neste protocolo.`;
    if (canalResposta === "telefone") return `Informar cliente pelo Telefone: ${clienteTelefone || "[TELEFONE]"}, sobre teor do docto anexado neste protocolo.`;
    return `Informar cliente pelo e-mail ${clienteEmail || "[E-MAIL]"} em ${hoje} e Telefone: ${clienteTelefone || "[TELEFONE]"} sobre teor do docto anexado neste protocolo.`;
  };

  // ─── GERAÇÃO DA MINUTA JURÍDICA ───
  const handleGenerateParecer = () => {
    if (!matricula || !numProcesso || (hasDecisaoButtons && !decisao)) {
      alert("Por favor, preencha os dados e a decisão de mérito (se aplicável).");
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
    const tplDataDefesa = dataDefesa || "[DATA DA DEFESA]";
    const tplProtDefesa = protDefesa || "[PROT. DEFESA]";
    const tplDataIndeferimento = dataIndeferimento || "[DATA INDEFERIMENTO]";
    const tplProtIndeferimento = protIndeferimento || "[PROT. INDEFERIMENTO]";
    const tplPrazo = get60BusinessDaysFromToday();

    const paragrafoDefesaPrevia = `Foi apresentada Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}). A mesma foi indeferida em ${tplDataIndeferimento} (Prot. ${tplProtIndeferimento}), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\nInciso XII - Impedimento voluntário/involuntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.`;
    
    const txtImpLow = tipoServico === "voluntario" ? "impedimento voluntário" : "impedimento involuntário";

    const buildVantagensText = () => `Citamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;

    let tpl = "";

    // =======================================================
    // TEXTOS: É RECURSO? -> SIM
    // =======================================================
    if (isRecurso) {
      if (tipoCaso === "leitura" || tipoCaso === "servico") {
        
        // ── NOVO FLUXO: DEFERIMENTO TOTAL (LA / Fato Novo) ──
        if (decisao === "deferir") {
          if (deferirMotivo === "la_padronizada") {
            tpl = `**Recurso prot. ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\nCliente viabilizou a padronização da ligação de água e solicita cancelamento das multas.\n\n**02. DECISÃO:**\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.`;
          } 
          else if (deferirMotivo === "fato_novo") {
            const isMultado = fatoNovoStatus === "multado";
            const hasDefesa = historicoDefesa === "com_defesa";

            // Montagem dos blocos condicionais
            const textDefesaMultado = hasDefesa
              ? `**03.** Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois Conforme Res. 19/2019 ARIS Art. 69: "Toda unidade usuária deverá ter assegurado ao prestador de serviços o livre acesso de forma a permitir a instalação, vistoria, manutenção, corte ou leituras". Sem a execução da padronização no prazo as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.`
              : `**03.** Como não houve apresentação de defesa nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.`;

            const textDefesaNotificado = hasDefesa
              ? `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois Conforme Res. 19/2019 ARIS Art. 69: "Toda unidade usuária deverá ter assegurado ao prestador de serviços o livre acesso de forma a permitir a instalação, vistoria, manutenção, corte ou leituras".\n\n`
              : "";

            const textResolucaoMultado = temRestituicao
              ? `**05.** RETIFICAR, a decisão proferida, retirando as multas aplicadas. Como a FAT ${tplFatura} foi quitada, cliente deve solicitar processo de restituição das multas aplicadas pelo e-mail atendimento@aguasdejoinville.com.br`
              : `**05.** RETIFICAR, a decisão proferida, retirando as multas aplicadas. A FAT ${tplFatura} foi corrigida e segue anexa.`;

            // Atribuições baseadas em Leitura x Serviço Involuntário x Serviço Voluntário
            if (tipoCaso === "leitura") {
              if (isMultado) {
                tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para realizar leituras e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário para execução de leituras. Meses sem acesso: ${tplMeses}.\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
              } else {
                tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento involuntário de acesso a ligação de água para realizar leituras e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário para execução de leituras. Meses sem acesso: ${tplMeses}.\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
              }
            } else if (tipoCaso === "servico") {
              if (tipoServico === "involuntario") {
                if (isMultado) {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para execução de serviços e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário de acesso para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
                } else {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento involuntário de acesso a ligação de água para execução de serviços e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário de acesso para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
                }
              } else {
                if (isMultado) {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento Voluntário de acesso a ligação de água para execução de serviços e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento Voluntário de acesso por recusa para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
                } else {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento Voluntário de acesso a ligação de água para execução de serviços e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento Voluntário de acesso por recusa para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... [EDIÇÃO PECULIAR]\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
                }
              }
            }
          }
        } 
        // ── DEFERIMENTO PARCIAL ──
        else if (decisao === "parcial") {
          if (tipoCaso === "leitura") {
            tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\n${buildVantagensText()}`;
          } else { // serviço
            tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara poder viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\n${buildVantagensText()}`;
          }
        }
        // ── INDEFERIMENTO ──
        else {
          if (tipoCaso === "leitura") {
            tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS.\nFato Gerador: Impedimento involuntário para execução de leituras.\nMeses sem acesso: ${tplMeses}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\nRevisando os fatos, [MANTEMOS A APLICAÇÃO POIS NÃO HÁ COMPROVAÇÃO DE IMPOSSIBILIDADE TÉCNICA].\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.\n\n${buildVantagensText()}`;
          } else { // Serviço
            tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.\nFato gerador: Impedimento para execução do serviço.\nData da constatação: ${tplConstatacao}\nProtocolo de serviço: ${tplProtServico}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\nRevisando os fatos, [NÃO IDENTIFICAMOS EXCLUDENTE DE RESPONSABILIDADE QUE JUSTIFIQUE A RETIRADA].\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nO recurso para revisão da fatura foi solicitado fora do prazo.\nDiante do exposto, ratifica-se integralmente a decisão proferida Pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\n\n${buildVantagensText()}`;
          }
        }
      } 
      // ── CASOS NÃO DECISIVOS DE LEITURA/SERVIÇO (MANTIDOS IGUAIS) ──
      else if (tipoCaso === "corte_cavalete") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Multa por Violação do corte cavalete\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso X da Resolução 019/2019 - ARIS.\nFato gerador: Violação do corte de cavalete\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}.\n\nAnalisando os fatos, há registro de que foi confirmado a violação do corte conforme imagens.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\n\n**02.DECISÃO:**\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão da multa aplicada por não padronização obrigatória da ligação de água, em estrita observância à **Instrução Normativa nº 83/2025**.\nQuanto à multa por violação do corte, não é possível, pois foi constatado a violação.\nA FAT ${tplFatura} foi corrigida e está anexa, com a exclusão da multa por não execução da padronização obrigatória da ligação de água.${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n03.PRORROGAÇÃO: Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação de padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de multa independentemente de nova notificação.\n\nPara padronizar, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)`;
      } else if (tipoCaso === "hd") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Multa por Danificação do hidrômetro.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso VI da Resolução 019/2019 - ARIS.\nFato gerador: Danificação do hidrômetro.\nData da constatação: ${tplConstatacao}.\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor} em ${tplRecebimentoAR}.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n\nAnalisando os fatos, [DESCREVER O DANO COM BASE NOS FATOS], conforme imagens abaixo.\n[INSERIR AQUI ESPAÇO PARA AS IMAGENS: Imagem 1 e Imagem 2]\n\n**DECIDIMOS MANTER** a aplicação de penalidades referente ao Auto de Infração nº ${tplAI}:\n- Multa por Danificação, inversão e/ou supressão do hidrômetro, no valor correspondente;\n\n(Se houver Consumo estimado):\nVisto ter havido retenção de consumo pelo fato, conforme Resolução ARIS 19/2019, o prestador de serviço pode cobrar o consumo estimado de água e esgoto retido, ao primeiro consumo do ciclo completo após a regularização da ligação de água, tendo sido então cobrados a Revisão do faturamento.`;
      } else if (tipoCaso === "bypass") {
        let textDefesa = "";
        if (historicoDefesa === "com_defesa") {
          textDefesa = `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:`;
        } else {
          textDefesa = `Como não houve apresentação de defesa, a(s) multa(s) foi/foram aplicada(s), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:`;
        }
        
        tpl = `À Ouvidoria,\nObjeto: Multa por derivação do ramal predial antes do hidrômetro (by-pass) e Revisão do faturamento de água e esgoto.\n**Morador: ${tplMorador}**\nMatrícula: ${tplMatricula}\nO que ensejou a manifestação do cliente foi a aplicação de multa referente à derivação do ramal predial antes do hidrômetro (by-pass), conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso V, da Resolução 019/2019 - ARIS. Data da constatação: ${tplConstatacao}. Protocolo: ${tplProtServico}. Constatado pela Fiscalização. Penalidade prevista: Multa por derivação não autorizada antes do hidrômetro (by-pass).\nCaso após a retirada da irregularidade, a matrícula tenha variação positiva de consumo, poderá haver a Revisão do faturamento de água e esgoto: ARIS - Resolução 19/2019.\nO Auto de Infração foi entregue, no endereço do imóvel, pelos Correios/por fiscal da Companhia e recebido por ${tplRecebedor} em ${tplRecebimentoAR}. ${textDefesa}\n\nV - Derivação do ramal predial antes do hidrômetro (by-pass).\n§ 2º Em caso de reincidência, no prazo de até 12 (doze) meses, o prestador de serviços poderá cobrar as infrações com valor em dobro.\nVEREDICTO (ANALISAR CFE MANIFESTAÇÃO) A partir da manifestação do cliente verificamos [ANALISE OS FATOS E COMPLETE]\n\nDECIDIMOS:\n04. RATIFICAR, a decisão proferida em [DATA ANTERIOR], MANTENDO AS PENALIDADES. A fatura com a multa não será alterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**`;
      } else if (tipoCaso === "clandestina") {
        let textDefesa = "";
        if (historicoDefesa === "com_defesa") {
          textDefesa = `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}`;
        } else {
          textDefesa = `Como não houve apresentação de defesa, a(s) multa(s) foi/foram aplicada(s),`;
        }
        
        tpl = `À Ouvidoria,\nObjeto: Multa por Ligação clandestina de água e Revisão do faturamento de água.\n**Morador: ${tplMorador}**\n**Matrícula:** ${tplMatricula}\n\nO que ensejou a manifestação do cliente foi a aplicação de multas referente à Ligação clandestina de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso VII da Resolução 019/2019 - ARIS. Data da constatação: ${tplConstatacao}. Protocolo: ${tplProtServico}. Constatado pela Fiscalização. Penalidade prevista: Multa por ligação clandestina de água.\nCaso após a retirada da irregularidade, a matrícula tenha variação positiva de consumo, poderá haver a Revisão do faturamento de água e esgoto: ARIS - Resolução 19/2019.\nO Auto de Infração foi entregue, no endereço do imóvel, pelos Correios/por fiscal da Companhia e recebido por ${tplRecebedor} em ${tplRecebimentoAR}.\n${textDefesa}\npois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\n\n**VII -** Ligação clandestina de água e esgoto.\nVEREDICTO (ANALISAR CFE MANIFESTAÇÃO) A partir da manifestação do cliente, analisada a matrícula, constatamos que [ANALISE OS FATOS E COMPLETE]\n\nDECIDIMOS:\nRATIFICAR, a decisão proferida em [DATA ANTERIOR], MANTENDO as penalidades. A fatura com a multa não será alterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**`;
      }
    } 
    // =======================================================
    // TEXTOS: É RECURSO? -> NÃO
    // =======================================================
    else {
      if (tipoCaso === "leitura") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao **impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água**.\n\nII – DO PROCESSO ADMINISTRATIVO\nAuto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""} As penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\n\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}\n\n` : ""}A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibilidade normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\n\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por **60 (sessenta) dias úteis**, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da **Resolução ARIS nº 019/2019**.\n\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de leituras e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao **impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água**, conforme disposto.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração nº ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram apuradas com fundamento no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, cujo fato gerador consiste no impedimento de acesso para a realização das leituras do consumo, situação verificada nos meses ${tplMeses}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor}, conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""} As penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora.\n\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\n\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, **ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}**, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.`;
        }
      } else if (tipoCaso === "servico") {
        if (decisao === "deferir" || decisao === "parcial") {
          tpl = `À Ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\nMatrícula: ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao ${txtImpLow} de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, tendo como fato gerador o ${txtImpLow} para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nApós a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""} As penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nEncaminhamos anexo, o **Processo Administrativo de Fiscalização** para análise da Agência Reguladora, bem como fatura ${tplFatura} revisada, para entrega ao cliente.\n\nIII – DO DIREITO E DA REVISÃO ADMINISTRATIVA\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}\n\n` : ""}A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável.\nConstatada a possibility normativa de revisão, procedeu-se à retificação da decisão, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, qualquer ilegalidade ou prejuízo ao usuário.\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\n\nIV – DA DECISÃO ADMINISTRATIVA\nAssim, foi determinada a retirada das multas aplicadas, com a consequente correção da fatura nº ${tplFatura}, conforme documento anexo.\nAdemais, foi concedida prorrogação do prazo para padronização da ligação de água por **60 (sessenta) dias úteis**, a contar da data desta decisão, com término em ${tplPrazo}, ficando o usuário expressamente cientificado de que o descumprimento da obrigação dentro do novo prazo poderá ensejar a aplicação de novas sanções, independentemente de nova notificação, nos termos da **Resolução ARIS nº 019/2019**.\n\nV – CONCLUSÃO\nDiante do exposto, resta demonstrado que a Administração atuou em estrita conformidade com a legislação vigente, respeitando o devido processo administrativo e promovendo, inclusive, a revisão do ato sancionatório em benefício do usuário.`;
        } else {
          tpl = `À ouvidoria,\nRecurso Administrativo nº ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**Objeto:** Aplicação de multas por impedimento de acesso à ligação de água para execução de serviços e ausência de padronização obrigatória da ligação de água.\n\nI – DOS FATOS\nA presente demanda decorre da manifestação apresentada pelo usuário em razão da aplicação de penalidades administrativas ao ${txtImpLow} de acesso à ligação de água para execução de serviços, bem como da não padronização obrigatória da ligação de água.\n\nII – DO PROCESSO ADMINISTRATIVO\nO Auto de Infração ${tplAI} foi lavrado em ${tplGeracao}.\nAs infrações foram enquadradas no artigo 144, inciso XII, da **Resolução ARIS nº 019/2019**, tendo como fato gerador o ${txtImpLow} para a execução do serviço de substituição do cavalete de água, constatado em ${tplConstatacao}.\nO referido Auto de Infração foi regularmente expedido e entregue no endereço do imóvel por meio dos Correios, tendo sido recebido por ${tplRecebedor} conforme aviso de recebimento constante no sistema do Prestador de Serviços.\nCom a notificação, foi oportunizado ao usuário o exercício do contraditório e da ampla defesa, bem como a regularização da ligação de água, o que não ocorreu dentro do prazo legalmente estabelecido.\n${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""} As penalidades previstas na legislação aplicável foram devidamente aplicadas em ${tplAplicacao}, constando os valores correspondentes na fatura nº ${tplFatura}.\nIII – DO DIREITO\nAs sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nNão há previsão legal ou normativa que autorize o cancelamento das multas regularmente aplicadas quando comprovada a infração e respeitado o devido processo administrativo, sob pena de violação aos princípios da legalidade e da vinculação da Administração à norma.\n\nIV – DA DECISÃO ADMINISTRATIVA\nDiante do exposto, **ratifica-se integralmente a decisão proferida em ${tplDecisaoAnterior}**, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.`;
        }
      } else if (tipoCaso === "la_padronizada") {
        tpl = `Recurso prot. ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente viabilizou a padronização da ligação de água e solicita cancelamento das multas.\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "la_cadastral") {
        tpl = `Recurso prot. ${tplProc}\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente atualizou o cadastro e solicita o cancelamento da multa.\nTendo o cliente atendido as exigências contidas na notificação recebida,\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** RETIFICAR, a decisão proferida, retirando a multa aplicada. A FAT ${tplFatura} foi corrigida e está anexa.`;
      } else if (tipoCaso === "prorrogacao") {
        tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\nCliente solicita prazo para atender à padronização obrigatória referente notificação recebida em ${tplRecebimentoAR}.\nConsiderando que cliente nos comunicou antes da aplicação das sanções e que a necessidade de prorrogação foi justificada,\n\nA notificação foi entregue no endereço pelos ${tipoRecebimentoAI}, em ${dataRecebimentoAI || "[DATA]"}.\n\n**02.DECISÃO:**\nPRORROGAR o prazo de padronização em mais **60 (sessenta) dias úteis**, a contar do prazo de vencimento constante no Auto de Infração lavrado. **Novo prazo expira em ${tplPrazo}.**\nA não padronização da ligação de água dentro do novo prazo poderá acarretar aplicação de sanções, independentemente de nova notificação.\nApós cliente solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal, deve adquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão. Após instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço. A caixa padrão CAJ deve estar aprovada dentro do novo prazo acordado. O serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\nPadronize sua ligação de água.\nCitamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;
      }
    }

    // Se a decisão for favorável ao cliente, insere o lembrete de fato novo no final
    if (decisao === "deferir" || decisao === "parcial") {
      tpl += `\n\n**<adicionar fato novo ao processo>**`;
    }

    setGeneratedText(tpl);
    setStep("generated");
  };

  const stripBoldMarkers = (text: string) => text.replace(/\*\*/g, "");

  const renderFormattedPreview = (text: string) => {
    return text.split("\n").map((line, lineIdx) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={lineIdx} className="min-h-[1em]">
          {parts.map((part, partIdx) => {
            const isBold = partIdx % 2 !== 0;
            const isRed = part === "<adicionar fato novo ao processo>";

            if (isBold) {
              return (
                <strong key={partIdx} className={isRed ? "text-red-600" : ""}>
                  {part}
                </strong>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stripBoldMarkers(generatedText));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          texto_final: generatedText,
          numeroProcesso: numProcesso || matricula,
          tipoCaso: tipoCaso,
          decisao: decisao 
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF no servidor.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Parecer_${tipoCaso}_${numProcesso || matricula}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF pelo servidor. Certifique-se de que o backend foi atualizado.");
    }
  };

  const handleDownloadWord = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          texto_final: generatedText,
          numeroProcesso: numProcesso || matricula,
          tipoCaso: tipoCaso,
          decisao: decisao 
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar Word no servidor.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Parecer_${tipoCaso}_${numProcesso || matricula}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor. Certifique-se de que o backend foi atualizado.");
    }
  };
  
  const isDeferirIncomplete = hasDecisaoButtons && decisao === "deferir" && (
    !deferirMotivo || (deferirMotivo === "fato_novo" && !fatoNovoStatus)
  );

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nº do Processo / Manifesto</label>
                <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} placeholder="Protocolo de recurso" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Auto de Infração (A.I.) Vinculado</label>
                <input value={numAutoInfracao} onChange={(e) => setNumAutoInfracao(e.target.value)} placeholder="Ex: XXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
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
              onChange={(e) => handleTipoCasoChange(e.target.value as TipoCasoType)}
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

              {/* NOVOS CAMPOS - SEMPRE VISÍVEIS NA SESSÃO 4 */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Recebimento A.I.</label>
                <DatePicker value={dataRecebimentoAI} onChange={setDataRecebimentoAI} placeholder="DD/MM/AAAA" />
              </div>
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

            </div>
          </SectionBlock>

          <button
            onClick={handleGenerateParecer}
            disabled={(hasDecisaoButtons && !decisao) || isDeferirIncomplete || !matricula}
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
                className="animate-fadeIn !border-emerald-200"
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