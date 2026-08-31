import { useState, useRef, useEffect } from "react";
import { useSessionStorage } from "./useSessionStorage";
import { calculateEndDate, getBusinessDaysDifference, get60BusinessDaysFromToday } from "../utils/dates";
import { formatName } from "../utils/masks";
import { FUNCIONARIOS } from "../utils/funcionarios";
import { DecisaoType, TipoCasoType, DefesaType } from "../services/ouvidoria";
import { exportarParecerPDF, exportarParecerWord } from "../services/api";

export function useProcessoOuvidoria() {
  // --- ESTADOS VISUAIS DA TELA ---
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [generatedText, setGeneratedText] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [funcSearchOpen, setFuncSearchOpen] = useState(false);
  const [guiaSansysOpen, setGuiaSansysOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // --- CONTROLE DE FLUXO ---
  const [isRecurso, setIsRecurso] = useSessionStorage<boolean>("ouv_isRecurso", true);
  const [historicoDefesa, setHistoricoDefesa] = useSessionStorage<DefesaType>("ouv_historicoDefesa", "sem_defesa");

  // --- ESTADOS DOS CAMPOS DO PROCESSO ---
  const [matricula, setMatricula] = useSessionStorage("ouv_matricula", "");
  const [morador, setMorador] = useSessionStorage("ouv_morador", "");
  const [tipoManifestacao, setTipoManifestacao] = useSessionStorage("ouv_tipoManifestacao", "Recurso Administrativo");
  const [numProcesso, setNumProcesso] = useSessionStorage("ouv_numProcesso", "");
  const [numAutoInfracao, setNumAutoInfracao] = useSessionStorage("ouv_numAutoInfracao", "");
  const [dataEmissaoFatura, setDataEmissaoFatura] = useSessionStorage("ouv_dataEmissaoFatura", "");
  const [dataManifestacao, setDataManifestacao] = useSessionStorage("ouv_dataManifestacao", "");
  
  // --- ESTADOS DE FUNCIONÁRIO ---
  const [funcionario, setFuncionario] = useSessionStorage("ouv_funcionario", "");
  const [funcionarioBusca, setFuncionarioBusca] = useSessionStorage("ouv_funcionarioBusca", "");
  
  // --- CONFIGURAÇÃO DO CASO ---
  const [tipoCaso, setTipoCaso] = useSessionStorage<TipoCasoType>("ouv_tipoCaso", "leitura");
  const [decisao, setDecisao] = useSessionStorage<DecisaoType>("ouv_decisao", null);
  const [tipoServico, setTipoServico] = useSessionStorage<"voluntario" | "involuntario">("ouv_tipoServico", "involuntario");
  const [tipoCorte, setTipoCorte] = useSessionStorage<"cavalete" | "ramal">("ouv_tipoCorte", "cavalete");
  const [foiMultado, setFoiMultado] = useSessionStorage<"sim" | "nao">("ouv_foiMultado", "nao");

  const [deferirMotivo, setDeferirMotivo] = useSessionStorage<"la_padronizada" | "fato_novo" | "sem_padronizacao" | null>("ouv_deferirMotivo", null);
  const [fatoNovoStatus, setFatoNovoStatus] = useSessionStorage<"notificado" | "multado" | null>("ouv_fatoNovoStatus", null);
  const [faturaQuitada, setFaturaQuitada] = useSessionStorage<"fatura_quitada" | "fatura_nao_quitada" | null>("ouv_faturaQuitada", null);
  
  // --- VARIÁVEIS DOS TEMPLATES ---
  const [dataGeracaoAI, setDataGeracaoAI] = useSessionStorage("ouv_dataGeracaoAI", "");
  const [mesesSemAcesso, setMesesSemAcesso] = useSessionStorage("ouv_mesesSemAcesso", "");
  const [dataConstatacaoInfracao, setDataConstatacaoInfracao] = useSessionStorage("ouv_dataConstatacaoInfracao", "");
  const [protServico, setProtServico] = useSessionStorage("ouv_protServico", "");
  const [recebedorCorreios, setRecebedorCorreios] = useSessionStorage("ouv_recebedorCorreios", "");
  const [dataRecebimentoAR, setDataRecebimentoAR] = useSessionStorage("ouv_dataRecebimentoAR", "");
  const [dataAplicacaoSancao, setDataAplicacaoSancao] = useSessionStorage("ouv_dataAplicacaoSancao", "");
  const [dataDecisaoAnterior, setDataDecisaoAnterior] = useSessionStorage("ouv_dataDecisaoAnterior", "");
  const [faturaReferencia, setFaturaReferencia] = useSessionStorage("ouv_faturaReferencia", "");
  const [dataDefesa, setDataDefesa] = useSessionStorage("ouv_dataDefesa", "");
  const [protDefesa, setProtDefesa] = useSessionStorage("ouv_protDefesa", "");
  const [dataIndeferimento, setDataIndeferimento] = useSessionStorage("ouv_dataIndeferimento", "");
  const [protIndeferimento, setProtIndeferimento] = useSessionStorage("ouv_protIndeferimento", "");
  const [dataRecebimentoAI, setDataRecebimentoAI] = useSessionStorage("ouv_dataRecebimentoAI", "");
  const [tipoRecebimentoAI, setTipoRecebimentoAI] = useSessionStorage("ouv_tipoRecebimentoAI", "Correios");

  // --- ESTADOS: TRATATIVAS SANSYS ---
  const [canalResposta, setCanalResposta] = useSessionStorage("ouv_canalResposta", "email");
  const [clienteEmail, setClienteEmail] = useSessionStorage("ouv_clienteEmail", "");
  const [clienteTelefone, setClienteTelefone] = useSessionStorage("ouv_clienteTelefone", "");
  const [aplicaIN83, setAplicaIN83] = useSessionStorage("ouv_aplicaIN83", true);
  const [temRestituicao, setTemRestituicao] = useSessionStorage("ouv_temRestituicao", false);
  const [statusMulta426, setStatusMulta426] = useSessionStorage("ouv_statusMulta426", "aplicada");
  const [tipoIndeferido, setTipoIndeferido] = useSessionStorage("ouv_tipoIndeferido", "padrao");
  const [protContatoAtivo, setProtContatoAtivo] = useSessionStorage("ouv_protContatoAtivo", "");
  const [faturaAlterada, setFaturaAlterada] = useSessionStorage("ouv_faturaAlterada", false);

  // --- ESTADOS DA CALCULADORA DE PRAZOS ---
  const [calcPrazo, setCalcPrazo] = useSessionStorage<string>("ouv_calcPrazo", "15");
  const [calcCustomPrazo, setCalcCustomPrazo] = useSessionStorage<string>("ouv_calcCustomPrazo", "");
  const [calcDataInicial, setCalcDataInicial] = useSessionStorage<string>("ouv_calcDataInicial", "");

  useEffect(() => {
    function handleClickOutsideCalculator(event: MouseEvent) {
      if (calculatorRef.current && !calculatorRef.current.contains(event.target as Node)) {
        setShowCalculator(false);
      }
    }
    if (showCalculator) document.addEventListener("mousedown", handleClickOutsideCalculator);
    return () => document.removeEventListener("mousedown", handleClickOutsideCalculator);
  }, [showCalculator]);
  
  // --- CÁLCULOS E DERIVAÇÕES ---
  const diasUteisDif = getBusinessDaysDifference(dataEmissaoFatura, dataManifestacao);
  const isForaDoPrazo = dataEmissaoFatura && dataManifestacao && diasUteisDif > 30;

  const durationNum = calcPrazo === "X" ? parseInt(calcCustomPrazo || "0", 10) : parseInt(calcPrazo, 10);
  const calcDataFinal = calculateEndDate(calcDataInicial, durationNum);

  const filteredFuncionarios = FUNCIONARIOS.filter((f) => {
    const term = funcionarioBusca.toLowerCase().trim();
    if (!term) return true;
    return f.nome.toLowerCase().includes(term) || String(f.matricula).includes(term);
  });

  const funcionarioSelecionado = FUNCIONARIOS.find((f) => String(f.matricula) === funcionario);

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
  
  const isRecursoLSTC = isRecurso && (isLeitura || isServico || isCorte); // Corte adicionado ao grupo principal
  const isFatoNovo = isRecursoLSTC && decisao === "deferir" && deferirMotivo === "fato_novo";
  const isLAPadronizadaRecurso = isRecursoLSTC && decisao === "deferir" && deferirMotivo === "la_padronizada";
  const isParcial = isRecursoLSTC && decisao === "parcial";
  const isIndeferir = isRecursoLSTC && decisao === "indeferir";

  // Corte agora tem botões de decisão
  const hasDecisaoButtons = isLeitura || isServico || isCorte;
  const hasDefesaToggle = true; 
  const showSessao3 = hasDecisaoButtons || hasDefesaToggle;

  const numSessao3 = showSessao3 ? 3 : undefined;
  const numSessao4 = showSessao3 ? 4 : 3;
  const numSessao5 = showSessao3 ? 5 : 4;

  // Atualização das visibilidades para incluir isCorte
  const showDataGeracaoAI = !isSimples && (!isRecursoLSTC || isFatoNovo || isIndeferir || isCorte);
  const showMesesSemAcesso = isLeitura && (!isRecursoLSTC || isFatoNovo || isIndeferir);
  const showDataConstatacao = ((isServico && (!isRecursoLSTC || isFatoNovo || isIndeferir)) || isCorte || isHd || isBypass || isClandestina) && !isSimples;
  const showProtServico = ((isServico && (!isRecursoLSTC || isFatoNovo || isIndeferir)) || isBypass || isClandestina) && !isSimples;
  
  const showRecebedorAR = !isSimples && (!isRecursoLSTC || isIndeferir || isCorte); 
  const showDataRecebimentoAR = isFatoNovo || isHd || isBypass || isClandestina || isProrrogacao || isCorte; 
  
  const showDataAplicacaoSancao = (isFatoNovo && fatoNovoStatus === "multado") || (!isRecurso && hasDecisaoButtons) || (isCorte && foiMultado === "sim");
  const showDataDecisaoAnterior = (!isRecurso && decisao === "indeferir" && !isSimples) || (isRecurso && (isBypass || isClandestina || isCorte));
  const showFaturaReferencia = !isProrrogacao && !isBypass && !isClandestina;
  const showDefesaCampos = hasDefesaToggle && historicoDefesa === "com_defesa";
  
  const showTipoRecebimentoAI = isFatoNovo || isParcial || isLAPadronizadaRecurso || (isIndeferir && isServico) || isSimples || isCorte;
  const showDataRecebimentoAI = isParcial || isLAPadronizadaRecurso || (isIndeferir && isServico) || isSimples || isCorte;

  const isDeferirIncomplete = hasDecisaoButtons && decisao === "deferir" && (!deferirMotivo || (deferirMotivo === "fato_novo" && !fatoNovoStatus));
  const isParcialIncomplete = hasDecisaoButtons && decisao === "parcial" && !faturaQuitada;

  // --- FUNÇÕES E HANDLERS ---
  const handleTipoCasoChange = (val: TipoCasoType) => {
    setTipoCaso(val);
    setDeferirMotivo(null);
    setFatoNovoStatus(null);
    setFaturaQuitada(null);
    setTipoCorte("cavalete");

    if (val === "leitura" || val === "servico" || val === "corte_cavalete") {
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
    if (val !== "parcial") {
      setFaturaQuitada(null);
    }
  };

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
    if (canalResposta === "email") return `Cliente informado pelo e-mail ${clienteEmail || "[E-MAIL]"}, em ${hoje} sobre teor do docto anexado neste protocolo.`;
    if (canalResposta === "telefone") return `Informar cliente pelo Telefone: ${clienteTelefone || "[TELEFONE]"}, sobre teor do docto anexado neste protocolo.`;
    return `Cliente informado pelo e-mail ${clienteEmail || "[E-MAIL]"} em ${hoje} e Telefone: ${clienteTelefone || "[TELEFONE]"} sobre teor do docto anexado neste protocolo.`;
  };

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
    const tplDataLimite = dataEmissaoFatura ? calculateEndDate(dataEmissaoFatura, 30) : "[DATA LIMITE]";
    const tplPrazo = get60BusinessDaysFromToday();

    const paragrafoDefesaPrevia = `Foi apresentada Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}). A mesma foi indeferida em ${tplDataIndeferimento} (Prot. ${tplProtIndeferimento}), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\nInciso XII - Impedimento voluntário/involuntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.`;
    
    const txtDefesaItem01 = historicoDefesa === "com_defesa" ? `\n\n${paragrafoDefesaPrevia}` : "";
    const txtImpLow = tipoServico === "voluntario" ? "impedimento voluntário" : "impedimento involuntário";

    const buildVantagensText = () => `Citamos algumas das vantagens em instalar a caixa padrão:\n· Facilidade de leitura, sem a necessidade de adentrar o imóvel.\n· Segurança, com proteção contra vandalismo.\n· Prevenção de desgaste precoce dos materiais do cavalete e proteção do medidor de água.\n· Redução dos riscos de vazamento.\n· Facilidade na realização de manutenções.\n· Preservação da qualidade da água tratada.\n· Melhoria na estética do imóvel.\n· Conformidade com as normas regulamentares, prevenindo eventuais penalidades.`;

    let tpl = "";

    // =======================================================
    // TEXTOS: É RECURSO? -> SIM
    // =======================================================
    if (isRecurso) {
      if (tipoCaso === "leitura" || tipoCaso === "servico" || tipoCaso === "corte_cavalete") {
        
        // ── FLUXO: DEFERIMENTO ──
        if (decisao === "deferir") {
          
          if (tipoCaso === "corte_cavalete") {
            // LÓGICA UNIFICADA: Gera as 14 variações (7 para Ramal e 7 para Cavalete)
            const isMultado = foiMultado === "sim";
            const hasDefesa = historicoDefesa === "com_defesa";
            const hasPadronizacao = deferirMotivo === "la_padronizada";

            const infracaoWord = isMultado ? (hasPadronizacao ? "multas" : "multa") : "notificação";
            
            const p1 = `**01.** O que ensejou a manifestação do cliente foi a aplicação de ${infracaoWord} referente à Violação do corte ${tipoCorte}${hasPadronizacao ? ' e não padronização obrigatória da ligação de água' : ''}, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso ${tipoCorte === "ramal" ? "XXII" : "X"} da Resolução 019/2019 - ARIS. Data da constatação: ${tplConstatacao}. Constatação via fiscalização.`;

            const incisoText = tipoCorte === "ramal" 
                ? "XXII - Restabelecimento irregular do abastecimento de água em ligações cortadas no ramal;" 
                : "X - Restabelecimento irregular do abastecimento de água em ligações cortadas no cavalete;";

            let p2_defesa = "";
            if (isMultado) {
                if (hasDefesa) {
                    p2_defesa = `Foi apresentado defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento} (Prot. ${tplProtIndeferimento}) e ${hasPadronizacao ? 'as sanções foram aplicadas' : 'a sanção foi aplicada'} em ${tplAplicacao}, pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\n${incisoText}`;
                } else {
                    p2_defesa = `Como não foi apresentado defesa, ${hasPadronizacao ? 'as sanções foram aplicadas' : 'a sanção foi aplicada'} em ${tplAplicacao}, pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\n${incisoText}`;
                }
            } else {
                if (hasDefesa) {
                    p2_defesa = `Foi apresentado defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento} (Prot. ${tplProtIndeferimento}), pois segundo a Resolução 19/2019 ARIS no Art. 144. Constitui infração a prática decorrente da ação ou omissão do usuário, relativa ao seguinte fato:\n${incisoText}`;
                }
            }

            const p2 = `**02.** O Auto de Infração foi entregue, no endereço do imóvel, por ${tipoRecebimentoAI}, para ${tplRecebedor} em ${dataRecebimentoAI}. ${p2_defesa}`.trim();

            let decisaoBlock = "";
            if (isMultado) {
                decisaoBlock = `**03.** RETIFICAR a decisão proferida em ${tplDecisaoAnterior || '[DATA ANTERIOR]'}, RETIRANDO ${hasPadronizacao ? 'AS PENALIDADES' : 'A PENALIDADE'}.\nA fatura ref. ${tplFatura} foi corrigida e está anexa.`;
            } else {
                decisaoBlock = `**03.** DEFERIR a manifestação apresentada, tendo sido retirado ${hasPadronizacao ? 'as penalidades' : 'a penalidade'} e anulado o respectivo Auto de Infração.`;
            }

            tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n${p1}\n\n${p2}\n\nConsiderando a manifestação apresentada, visto que **[EDIÇÃO PECULIAR]**\n\n**DECIDIMOS:**\n${decisaoBlock}`;
          } 
          else if (deferirMotivo === "la_padronizada") {
            tpl = `**Recurso prot. ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\nCliente padronizou a ligação de água e solicita cancelamento das multas.${txtDefesaItem01}\n\n**02. DECISÃO:**\nA Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à Instrução Normativa nº 83/2025, não havendo, portanto, prejuízo ao usuário.\nA FAT ${tplFatura} foi corrigida e está anexa.`;
          } 
          else if (deferirMotivo === "fato_novo") {
            const isMultado = fatoNovoStatus === "multado";
            const hasDefesa = historicoDefesa === "com_defesa";

            const textDefesaMultado = hasDefesa
              ? `**03.** Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois Conforme Res. 19/2019 ARIS Art. 69: "Toda unidade usuária deverá ter assegurado ao prestador de serviços o livre acesso de forma a permitir a instalação, vistoria, manutenção, corte ou leituras". Sem a execução da padronização no prazo as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.`
              : `**03.** Como não houve apresentação de defesa nem a padronização obrigatória da ligação de água, as sanções foram aplicadas em ${tplAplicacao} e constam na FAT ${tplFatura}.`;

            const textDefesaNotificado = hasDefesa
              ? `Foi apresentado Defesa em ${tplDataDefesa} (Prot. ${tplProtDefesa}) e foi indeferida em ${tplDataIndeferimento}, pois Conforme Res. 19/2019 ARIS Art. 69: "Toda unidade usuária deverá ter assegurado ao prestador de serviços o livre acesso de forma a permitir a instalação, vistoria, manutenção, corte ou leituras".\n\n`
              : "";

            const textResolucaoMultado = temRestituicao
              ? `**05.** RETIFICAR, a decisão proferida, retirando as multas aplicadas. Como a FAT ${tplFatura} foi quitada, cliente deve solicitar processo de restituição das multas aplicadas pelo e-mail atendimento@aguasdejoinville.com.br`
              : `**05.** RETIFICAR, a decisão proferida, retirando as multas aplicadas. A FAT ${tplFatura} foi corrigida e segue anexa.`;

            if (tipoCaso === "leitura") {
              if (isMultado) {
                tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para realizar leituras e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário para execução de leituras. Meses sem acesso: ${tplMeses}.${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
              } else {
                tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento involuntário de acesso a ligação de água para realizar leituras e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário para execução de leituras. Meses sem acesso: ${tplMeses}.${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
              }
            } else if (tipoCaso === "servico") {
              if (tipoServico === "involuntario") {
                if (isMultado) {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento involuntário de acesso a ligação de água para execução de serviços e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário de acesso para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
                } else {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento involuntário de acesso a ligação de água para execução de serviços e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento involuntário de acesso para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
                }
              } else {
                if (isMultado) {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de multas referente à Impedimento Voluntário de acesso a ligação de água para execução de serviços e Não padronização da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento Voluntário de acesso por recusa para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaMultado}\n\n**04.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n${textResolucaoMultado}\n\n${buildVantagensText()}`;
                } else {
                  tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n**Objeto:** AUTO DE INFRAÇÃO Nº ${tplAI}\n\n**01.** O que ensejou a manifestação do cliente foi a aplicação de notificação referente à Impedimento Voluntário de acesso a ligação de água para execução de serviços e padronização obrigatória da ligação de água, conforme Auto de Infração nº ${tplAI} gerado em ${tplGeracao}. Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS. Fato Gerador: Impedimento Voluntário de acesso por recusa para execução de serviços.\nData da constatação: ${tplConstatacao}.\nProtocolo: ${tplProtServico}${txtDefesaItem01}\n\n**02.** O Auto de Infração foi entregue, pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${tplRecebimentoAR}.\n\n${textDefesaNotificado}**03.** A partir da manifestação, em análise dos fatos ... **[EDIÇÃO PECULIAR]**\n\n**04.** RETIFICAR, a decisão proferida, anulando o respectivo Auto de Infração.\n\n${buildVantagensText()}`;
                }
              }
            }
          }
        } 
        // ── FLUXO: DEFERIMENTO PARCIAL ──
        else if (decisao === "parcial") {
          if (tipoCaso === "corte_cavalete") {
             tpl = `**[COLE AQUI A VERSÃO PARA VIOLAÇÃO DE CORTE -> DEFERIDO PARCIALMENTE]**`;
          } else {
            const textoFaturaDecisao = faturaQuitada === "fatura_quitada" 
              ? `Como a FAT ${tplFatura} foi quitada, cliente deve solicitar processo de restituição das multas aplicadas pelo e-mail **atendimento@aguasdejoinville.com.br**.` 
              : `A FAT ${tplFatura} foi corrigida e está anexa.`;

            if (tipoCaso === "leitura") {
              tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\n\nA notificação foi entregue pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${dataRecebimentoAI || "[DATA]"}.\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\n${textoFaturaDecisao}\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\n${buildVantagensText()}`;
            } else { 
              tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI}. ${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\n\nA notificação foi entregue pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${dataRecebimentoAI || "[DATA]"}.\nAcatamos o exposto pelo(a) cliente e concedemos novo prazo para padronização da ligação de água.\n\n**02. DECISÃO:** A Administração Pública, observando os princípios da legalidade, razoabilidade e autotutela, promoveu a revisão do ato administrativo anteriormente praticado, nos termos da legislação aplicável, com a exclusão das multas aplicadas, em estrita observância à **Instrução Normativa nº 83/2025**, não havendo, portanto, prejuízo ao usuário.\n${textoFaturaDecisao}\n\n**03. PRORROGAÇÃO:** Fica o prazo de padronização prorrogado por **60 (sessenta) dias úteis** a contar da data desta decisão.\n**Novo prazo para padronizar a ligação de água vence em ${tplPrazo}.**\n\nRessalte-se que a revisão administrativa não eximiu o usuário do cumprimento da obrigação principal, qual seja, a padronização da ligação de água, exigência de natureza técnica e obrigatória, prevista na regulamentação vigente.\nA não padronização dentro do novo prazo, poderá implicar aplicação de sanções independentemente de nova notificação.\nPara poder viabilizar a padronização, cliente deve solicitar à Companhia Águas de Joinville, o deslocamento de cavalete/ramal.\nAdquirir a Caixa Padrão CAJ, em empresas de materiais de construção, e instalar a Caixa Padrão.\nApós instalação, solicitar a Vistoria junto à CAJ, fornecendo o protocolo da solicitação de serviço.\nA caixa padrão CAJ deve estar aprovada dentro do novo prazo concedido.\nO serviço de deslocamento do cavalete deverá ser executado pelo Prestador de Serviços (CAJ)\n\n${buildVantagensText()}`;
            }
          }
        }
        // ── FLUXO: INDEFERIMENTO ──
        else {
          if (tipoCaso === "corte_cavalete") {
             tpl = `**[COLE AQUI A VERSÃO PARA VIOLAÇÃO DE CORTE -> INDEFERIDO]**`;
          } else {
            if (tipoCaso === "leitura") {
              tpl = `**Recurso protocolo ${tplProc}**\n**Morador:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento involuntário de acesso à ligação de água para execução de leituras e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 19/2019 - ARIS.\nFato Gerador: Impedimento involuntário para execução de leituras.\nMeses sem acesso: ${tplMeses}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\nRevisando os fatos, [MANTEMOS A APLICAÇÃO POIS NÃO HÁ COMPROVAÇÃO DE IMPOSSIBILIDADE TÉCNICA].\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de leitura e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\n\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nNeste caso, a fatura ${tplFatura} foi emitida em ${dataEmissaoFatura || "[DATA DA EMISSÃO]"} e teria o prazo até dia ${tplDataLimite}. O recurso para revisão da fatura foi solicitado em ${dataManifestacao || "[DATA DA MANIFESTAÇÃO]"}; portanto, fora do prazo.\n\nDiante do exposto, ratifica-se integralmente a decisão proferida pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.\n\n${buildVantagensText()}`;
            } else { 
              tpl = `**Recurso protocolo ${tplProc}**\n**Morador cadastrado:** ${tplMorador}\n**Matrícula:** ${tplMatricula}\n\n**01. OBJETO:** Aplicação de multas referente à impedimento de acesso a ligação de água para realização de serviços e à não padronização obrigatória da ligação de água.\nA presente demanda decorre de manifestação apresentada pelo(a) usuário(a) em razão da aplicação de penalidades administrativas relativas ao Auto de Infração nº ${tplAI} gerado em ${tplGeracao}.\nDispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.\nFato gerador: Impedimento para execução do serviço.\nData da constatação: ${tplConstatacao}\nProtocolo de serviço: ${tplProtServico}\nO Auto de Infração foi entregue, pelos Correios, no endereço do imóvel, e recebido por ${tplRecebedor}.\n\n${historicoDefesa === "com_defesa" ? `${paragrafoDefesaPrevia}` : ""}\nRevisando os fatos, [NÃO IDENTIFICAMOS EXCLUDENTE DE RESPONSABILIDADE QUE JUSTIFIQUE A RETIRADA].\n\nA notificação foi entregue pelos ${tipoRecebimentoAI}, no endereço do imóvel, e recebido em ${dataRecebimentoAI || "[DATA]"}.\n\n**02. DECISÃO:** As sanções impostas encontram-se estritamente amparadas na legislação vigente, em especial na Resolução Normativa ARIS nº 019/2019, que atribui ao usuário a responsabilidade por garantir o livre acesso à ligação para fins de execução de serviços e pela adequação da ligação de água aos padrões técnicos exigidos.\nA previsão legal ou normativa que autoriza o cancelamento das multas regularmente aplicadas por não padronização da ligação de água, é regido pela Instrução Normativa CAJ nº 83/2025.\n\nNesta, consta o prazo de 30 dias úteis, contados da data de emissão da fatura, para solicitar revisão.\nNeste caso, a fatura ${tplFatura} foi emitida em ${dataEmissaoFatura || "[DATA DA EMISSÃO]"} e teria o prazo até dia ${tplDataLimite}. O recurso para revisão da fatura foi solicitado em ${dataManifestacao || "[DATA DA MANIFESTAÇÃO]"}; portanto, fora do prazo.\n\nDiante do exposto, ratifica-se integralmente a decisão proferida Pelo Prestador de Serviços, mantendo-se as penalidades aplicadas, por estarem em conformidade com a legislação vigente e devidamente fundamentadas.\nA fatura nº ${tplFatura} permanece inalterada. Eventual solicitação de parcelamento do débito poderá ser realizada por meio do endereço eletrônico: **atendimento@aguasdejoinville.com.br**.${historicoDefesa === "com_defesa" ? `\n${paragrafoDefesaPrevia}` : ""}\n\n${buildVantagensText()}`;
            }
          }
        }
      } 
      else if (tipoCaso === "hd") {
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
      if (tipoCaso === "corte_cavalete") {
        tpl = `**[COLE AQUI A VERSÃO PARA VIOLAÇÃO DE CORTE QUANDO NÃO FOR RECURSO]**`;
      } else if (tipoCaso === "leitura") {
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

    if (decisao === "parcial") {
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
            const isRed = part === "[EDIÇÃO PECULIAR]";

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
      const blob = await exportarParecerPDF({ 
        texto_final: generatedText,
        numeroProcesso: numProcesso || matricula,
        tipoCaso: tipoCaso,
        decisao: decisao 
      });
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
      const blob = await exportarParecerWord({ 
        texto_final: generatedText,
        numeroProcesso: numProcesso || matricula,
        tipoCaso: tipoCaso,
        decisao: decisao 
      });
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

  function limparTela() {
    if (!window.confirm("Tem certeza que deseja limpar todos os dados do processo?")) return;
    
    setStep("idle");
    setGeneratedText("");
    setIsRecurso(true);
    setHistoricoDefesa("sem_defesa");
    setMatricula("");
    setMorador("");
    setTipoManifestacao("Recurso Administrativo");
    setNumProcesso("");
    setNumAutoInfracao("");
    setDataEmissaoFatura("");
    setDataManifestacao("");
    setFuncionario("");
    setFuncionarioBusca("");
    setTipoCaso("leitura");
    setDecisao(null);
    setTipoServico("involuntario");
    setTipoCorte("cavalete");
    setDeferirMotivo(null);
    setFatoNovoStatus(null);
    setFaturaQuitada(null);
    setDataGeracaoAI("");
    setMesesSemAcesso("");
    setDataConstatacaoInfracao("");
    setProtServico("");
    setRecebedorCorreios("");
    setDataRecebimentoAR("");
    setDataAplicacaoSancao("");
    setDataDecisaoAnterior("");
    setFaturaReferencia("");
    setDataDefesa("");
    setProtDefesa("");
    setDataIndeferimento("");
    setProtIndeferimento("");
    setDataRecebimentoAI("");
    setTipoRecebimentoAI("Correios");
    setCanalResposta("email");
    setClienteEmail("");
    setClienteTelefone("");
    setAplicaIN83(true);
    setTemRestituicao(false);
    setStatusMulta426("aplicada");
    setTipoIndeferido("padrao");
    setProtContatoAtivo("");
    setFaturaAlterada(false);
    setCalcPrazo("15");
    setCalcCustomPrazo("");
    setCalcDataInicial("");
    setFoiMultado("nao");
  }

  return {
    step, setStep, copied, setCopied, reviewMode, setReviewMode, generatedText, setGeneratedText,
    textAreaRef, calculatorRef, showCalculator, setShowCalculator, funcSearchOpen, setFuncSearchOpen,
    guiaSansysOpen, setGuiaSansysOpen,
    isRecurso, setIsRecurso, historicoDefesa, setHistoricoDefesa, matricula, setMatricula,
    morador, setMorador, tipoManifestacao, setTipoManifestacao, numProcesso, setNumProcesso,
    numAutoInfracao, setNumAutoInfracao, dataEmissaoFatura, setDataEmissaoFatura,
    dataManifestacao, setDataManifestacao, funcionario, setFuncionario, funcionarioBusca, setFuncionarioBusca,
    tipoCaso, setTipoCaso, decisao, setDecisao, tipoServico, setTipoServico, tipoCorte, setTipoCorte,
    foiMultado, setFoiMultado, // <-- ADICIONADO AQUI!
    deferirMotivo, setDeferirMotivo, fatoNovoStatus, setFatoNovoStatus, faturaQuitada, setFaturaQuitada,
    dataGeracaoAI, setDataGeracaoAI, mesesSemAcesso, setMesesSemAcesso,
    dataConstatacaoInfracao, setDataConstatacaoInfracao, protServico, setProtServico,
    recebedorCorreios, setRecebedorCorreios, dataRecebimentoAR, setDataRecebimentoAR,
    dataAplicacaoSancao, setDataAplicacaoSancao, dataDecisaoAnterior, setDataDecisaoAnterior,
    faturaReferencia, setFaturaReferencia, dataDefesa, setDataDefesa, protDefesa, setProtDefesa,
    dataIndeferimento, setDataIndeferimento, protIndeferimento, setProtIndeferimento,
    dataRecebimentoAI, setDataRecebimentoAI, tipoRecebimentoAI, setTipoRecebimentoAI,
    canalResposta, setCanalResposta, clienteEmail, setClienteEmail, clienteTelefone, setClienteTelefone,
    aplicaIN83, setAplicaIN83, temRestituicao, setTemRestituicao, statusMulta426, setStatusMulta426,
    tipoIndeferido, setTipoIndeferido, protContatoAtivo, setProtContatoAtivo, faturaAlterada, setFaturaAlterada,
    calcPrazo, setCalcPrazo, calcCustomPrazo, setCalcCustomPrazo, calcDataInicial, setCalcDataInicial, calcDataFinal,
    diasUteisDif, isForaDoPrazo, filteredFuncionarios, funcionarioSelecionado,
    isLeitura, isServico, isCorte, isHd, isBypass, isClandestina, isPadronizada, isCadastral, isProrrogacao,
    showSessao3, hasDecisaoButtons, hasDefesaToggle, numSessao3, numSessao4, numSessao5,
    showDataGeracaoAI, showMesesSemAcesso, showDataConstatacao, showProtServico, showRecebedorAR,
    showDataRecebimentoAR, showDataAplicacaoSancao, showDataDecisaoAnterior, showFaturaReferencia,
    showDefesaCampos, showTipoRecebimentoAI, showDataRecebimentoAI,
    isDeferirIncomplete, isParcialIncomplete,
    handleTipoCasoChange, handleDecisaoChange, getParte1Text, getParte2Text,
    handleGenerateParecer, handleDownloadPDF, handleDownloadWord, handleCopy, renderFormattedPreview, stripBoldMarkers, limparTela
  };
}