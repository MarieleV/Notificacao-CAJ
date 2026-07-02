import { useState, useRef } from "react";
import {
  Sparkles, Copy, Download, CheckCircle2,
  Loader2, Info, Key, Scale, FileCheck, FileX, Clock, Wrench, FileText, HelpCircle
} from "lucide-react";

type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
type DefesaType = "com_defesa" | "sem_defesa";
type TipoCasoType = "leitura" | "servico" | "servico_voluntario" | "servico_involuntario" | "lacre" | "corte_cavalete" | "corte_ramal" | "hd" | "bypass" | "clandestina";

// Ajuste para o endereço real do seu backend (ex: variável de ambiente)
const API_URL = "http://localhost:3000";

// Função auxiliar para mascarar a data (DD/MM/AAAA)
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

export function OuvidoriaManager() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [generatedText, setGeneratedText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // --- ESTADOS DOS CAMPOS DO PROCESSO ---
  const [matricula, setMatricula] = useState("");
  const [morador, setMorador] = useState("");
  const [tipoManifestacao, setTipoManifestacao] = useState("Recurso Administrativo");
  const [numProcesso, setNumProcesso] = useState("");
  const [numAutoInfracao, setNumAutoInfracao] = useState("");

  // --- CONFIGURAÇÃO DO CASO ---
  const [tipoCaso, setTipoCaso] = useState<TipoCasoType>("bypass");
  const [historicoDefesa, setHistoricoDefesa] = useState<DefesaType>("com_defesa");
  const [decisao, setDecisao] = useState<DecisaoType>(null);

  // --- VARIÁVEIS DOS TEMPLATES ---
  const [dataGeracaoAI, setDataGeracaoAI] = useState("");
  const [recebedorCorreios, setRecebedorCorreios] = useState("");
  const [dataRecebimentoAR, setDataRecebimentoAR] = useState("");
  const [dataAplicacaoSancao, setDataAplicacaoSancao] = useState("");

  // Específicos de Leitura
  const [mesesSemAcesso, setMesesSemAcesso] = useState("");
  // Específicos de Serviço / Lacre / Corte / Clandestina / Bypass / HD
  const [dataConstatacaoInfracao, setDataConstatacaoInfracao] = useState("");
  const [protServico, setProtServico] = useState("");

  // Específicos para Veredictos de Corte (Cavalete e Ramal)
  const [dataTitularDesde, setDataTitularDesde] = useState("");
  const [protTitularidade, setProtTitularidade] = useState("");

  // Histórico de Defesa
  const [dataDefesa, setDataDefesa] = useState("");
  const [protDefesa, setProtDefesa] = useState("");
  const [dataIndeferimento, setDataIndeferimento] = useState("");
  const [protIndeferimento, setProtIndeferimento] = useState("");

  // Decisão
  const [protPadronizacao, setProtPadronizacao] = useState("");
  const [dataDecisaoAnterior, setDataDecisaoAnterior] = useState("");
  const [faturaReferencia, setFaturaReferencia] = useState("");

  const handleGenerateParecer = async () => {
    if (!matricula || !numProcesso || !decisao) {
      alert("Por favor, preencha a Matrícula, o Número do Processo e selecione uma Decisão de Mérito.");
      return;
    }
    if (!apiKey) {
      alert("Por favor, insira sua Chave de API do Gemini no topo da tela.");
      return;
    }

    setLoading(true);
    setStep("idle");

    let textoObjeto = "";
    switch (tipoCaso) {
      case "leitura": textoObjeto = "Multa por Impossibilidade de acesso para leituras e Não padronização obrigatória da ligação de água"; break;
      case "servico": textoObjeto = "Multa por Impossibilidade de execução de serviços de manutenção ao cavalete/hidrômetro e Não padronização obrigatória da ligação de água"; break;
      case "servico_voluntario": textoObjeto = "Multa por Impedimento voluntário de execução de serviços de manutenção ao cavalete/hidrômetro e Não padronização obrigatória da ligação de água"; break;
      case "servico_involuntario": textoObjeto = "Multa por Impedimento involuntário de execução de serviços de manutenção ao cavalete/hidrômetro e Não padronização obrigatória da ligação de água"; break;
      case "lacre": textoObjeto = "Multa por Violação do Lacre Cavalete"; break;
      case "corte_cavalete": textoObjeto = (decisao === "indeferir") ? "Multa por Violação do corte cavalete e Não padronização obrigatória da ligação de água" : "Multa por Violação do corte cavalete;"; break;
      case "corte_ramal": textoObjeto = (decisao === "indeferir") ? "Multa por Violação do corte ramal e Não padronização obrigatória da ligação de água" : "Multa por Violação do corte ramal"; break;
      case "hd": textoObjeto = "Multa por Danificação, inversão ou supressão do hidrômetro e Padronização obrigatória da ligação de água"; break;
      case "bypass": textoObjeto = "Multa por derivação do ramal predial antes do hidrômetro (by-pass) e Revisão do faturamento de água e esgoto"; break;
      case "clandestina": textoObjeto = "Multa por Ligação clandestina de água e Revisão do faturamento de água"; break;
    }

    // Objeto único com todos os dados necessários para o backend montar o prompt
    const dadosAnalise = {
      origem: tipoManifestacao,
      tipoCaso: tipoCaso.toUpperCase(),
      tipoCasoRaw: tipoCaso, // usado nas checagens condicionais (ex: clandestina vs bypass)
      decisaoSelecionada: decisao.toUpperCase(),
      historicoDefesa: historicoDefesa === "com_defesa" ? "COM_APRESENTACAO_DE_DEFESA" : "SEM_APRESENTACAO_DE_DEFESA",
      dadosTemplate: {
        morador: morador || "[NOME COMPLETO DO MORADOR]",
        matricula,
        numProcesso,
        numAutoInfracao,
        textoObjeto,
        dataGeracaoAI: dataGeracaoAI || "[DATA GERACAO AI]",
        mesesSemAcesso: mesesSemAcesso || "[MESES SEM ACESSO]",
        dataConstatacaoInfracao: dataConstatacaoInfracao || "[DATA DA CONSTATAÇÃO/IMPEDIMENTO]",
        protServico: protServico || "[PROTOCOLO DA CONSTATAÇÃO/SERVIÇO]",
        recebedorCorreios: recebedorCorreios || "[NOME RECEBEDOR CORREIOS]",
        dataRecebimentoAR: dataRecebimentoAR || "[DATA RECEBIMENTO AR]",
        dataTitularDesde: dataTitularDesde || "[DATA TITULAR RESPONSAVEL]",
        protTitularidade: protTitularidade || "[PROTOCOLO TITULARIDADE]",
        dataDefesa: dataDefesa || "[DATA DA DEFESA]",
        protDefesa: protDefesa || "[PROTOCOLO DEFESA]",
        dataIndeferimento: dataIndeferimento || "[DATA INDEFERIMENTO]",
        protIndeferimento: protIndeferimento || "[PROTOCOLO INDEFERIMENTO]",
        dataAplicacaoSancao: dataAplicacaoSancao || "[DATA APLICACAO SANCAO]",
        protPadronizacao: protPadronizacao || "[PROTOCOLO PADRONIZACAO]",
        dataDecisaoAnterior: dataDecisaoAnterior || "[DATA DECISAO ANTERIOR]",
        faturaReferencia: faturaReferencia || "[FATURA COMPETENCIA REF]"
      }
    };

    try {
      const response = await fetch(`${API_URL}/api/gerar_parecer_ouvidoria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          dadosAnalise,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro de conexão com o servidor.");
      }

      const data = await response.json();
      if (!data.texto_gerado) throw new Error("O servidor não retornou o texto esperado.");

      setGeneratedText(data.texto_gerado);
      setStep("generated");
    } catch (error) {
      console.error(error);
      alert(`Falha ao gerar o parecer. Erro: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Parecer_${tipoManifestacao}_${tipoCaso}_Proc_${numProcesso || matricula}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar IDÊNTICO À NOTIFICAÇÃO */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Análise de Processos e Ouvidoria</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Gestão de Pareceres Automatizados — Resolução 019/2019-ARIS</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-[#1a5fa8] transition-colors">
            <Key size={14} className="text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-gray-700 w-48"
            />
          </div>
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
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Qual foi o Fato Gerador?</label>
              <select
                value={tipoCaso}
                onChange={(e) => setTipoCaso(e.target.value as TipoCasoType)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] focus:bg-[#eef6ff] transition-all cursor-pointer"
              >
                <option value="bypass">By-pass (Derivação Clandestina)</option>
                <option value="hd">Danificação / Retirada / Inversão do HD</option>
                <option value="leitura">Impedimento de Leituras</option>
                <option value="servico">Impedimento de Serviços (Geral)</option>
                <option value="servico_involuntario">Impedimento Involuntário de Serviços</option>
                <option value="servico_voluntario">Impedimento Voluntário de Serviços</option>
                <option value="clandestina">Ligação Clandestina de Água/Esgoto</option>
                <option value="corte_cavalete">Violação de Corte no Cavalete</option>
                <option value="corte_ramal">Violação de Corte no Ramal</option>
                <option value="lacre">Violação de Lacre do Cavalete/HD</option>
              </select>
            </div>
          </div>

          {/* SESSÃO 3: VEREDICTO DE MÉRITO E DEFESA */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
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

              {/* ===== MÓDULO EXCLUSIVO QUE SÓ APARECE APÓS ESCOLHER UMA DECISÃO ===== */}
              {decisao && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn space-y-6">

                  {/* CASOS DE CORTE INDEFERIDO (Pede histórico de titularidade) */}
                  {["corte_cavalete", "corte_ramal"].includes(tipoCaso) && decisao === "indeferir" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50/40 border border-amber-200 rounded-xl">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Titular Responsável Desde</label>
                        <input value={dataTitularDesde} onChange={(e) => setDataTitularDesde(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:border-amber-600 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Protocolo da Titularidade</label>
                        <input value={protTitularidade} onChange={(e) => setProtTitularidade(e.target.value)} placeholder="Ex: 9876543" className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:border-amber-600 bg-white" />
                      </div>
                    </div>
                  )}

                  {/* SELETOR DE HISTÓRICO DE DEFESA - COMPACTO (Estilo Toggle) */}
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

                  {/* CAMPOS DINÂMICOS DA DEFESA */}
                  {historicoDefesa === "com_defesa" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#f8fafe] border border-[#c3ddf8] rounded-xl animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider mb-1">Data Protocolo Defesa</label>
                        <input value={dataDefesa} onChange={(e) => setDataDefesa(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider mb-1">Nº Prot. Defesa</label>
                        <input value={protDefesa} onChange={(e) => setProtDefesa(e.target.value)} placeholder="Ex: Prot. Defesa" className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider mb-1">Data Indeferimento</label>
                        <input value={dataIndeferimento} onChange={(e) => setDataIndeferimento(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider mb-1">Nº Prot. Indeferimento</label>
                        <input value={protIndeferimento} onChange={(e) => setProtIndeferimento(e.target.value)} placeholder="Ex: Prot. Indeferimento" className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* SESSÃO 4: REQUISITOS VARIÁVEIS DA IRREGULARIDADE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Variáveis e Datas da Irregularidade</h2>
                <p className="text-gray-500 text-xs">Insira os marcos temporais cronológicos exigidos pelas lacunas do modelo</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Geração A.I.</label>
                  <input value={dataGeracaoAI} onChange={(e) => setDataGeracaoAI(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>

                {tipoCaso === "leitura" && (
                  <div>
                    <label className="block text-[10px] font-bold text-[#1a5fa8] uppercase tracking-wider mb-1">Meses sem acesso</label>
                    <input value={mesesSemAcesso} onChange={(e) => setMesesSemAcesso(e.target.value)} placeholder="Ex: Jan/2026 a Mar/2026" className="w-full px-3 py-2 border border-[#c3ddf8] rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] bg-[#eef6ff]" />
                  </div>
                )}

                {["servico", "servico_voluntario", "servico_involuntario", "lacre", "corte_cavalete", "corte_ramal", "hd", "bypass", "clandestina"].includes(tipoCaso) && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Data Constatação/Imped.</label>
                      <input value={dataConstatacaoInfracao} onChange={(e) => setDataConstatacaoInfracao(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 bg-amber-50/30" />
                    </div>
                    {tipoCaso !== "lacre" && (
                      <div>
                        <label className="block text-[10px] font-bold text-amber-600 tracking-wider uppercase mb-1">Nº Prot. Origem/Fiscaliz.</label>
                        <input value={protServico} onChange={(e) => setProtServico(e.target.value)} placeholder="Ex: 1234567" className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 bg-amber-50/30" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Recebedor do A.I. (AR)</label>
                  <input value={recebedorCorreios} onChange={(e) => setRecebedorCorreios(e.target.value)} placeholder="Nome de quem assinou o AR" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data de Recebimento AR</label>
                  <input value={dataRecebimentoAR} onChange={(e) => setDataRecebimentoAR(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Aplicação Sanções</label>
                  <input value={dataAplicacaoSancao} onChange={(e) => setDataAplicacaoSancao(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Nº Prot. Exec. Padronização</label>
                  <input value={protPadronizacao} onChange={(e) => setProtPadronizacao(e.target.value)} placeholder="Obrigatório p/ Deferidos" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Data Decisão Anterior (Ratificar)</label>
                  <input value={dataDecisaoAnterior} onChange={(e) => setDataDecisaoAnterior(maskDate(e.target.value))} placeholder="DD/MM/AAAA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fatura de Competência Corrigida</label>
                  <input value={faturaReferencia} onChange={(e) => setFaturaReferencia(e.target.value)} placeholder="Ex: MM/AAAA" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO DISPARADOR DE GERAÇÃO */}
          <button
            onClick={handleGenerateParecer}
            disabled={loading || !decisao || !matricula}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Formatando Parecer Diretamente na IA...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Emitir Minuta de Parecer Oficial
              </>
            )}
          </button>

          {/* ÁREA DE EXIBIÇÃO DA MINUTA GERADA */}
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
                <span className="text-[10px] bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-1 rounded-full font-medium">
                  Gerado com sucesso
                </span>
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
                  <p className="text-gray-500 text-xs">Copie para a área de transferência ou baixe o arquivo de texto formatado</p>
                </div>
              </div>
              <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-[#1a5fa8] text-[#1a5fa8] rounded-xl font-semibold text-sm hover:bg-[#eef6ff] transition-all"
                >
                  {copied ? "Copiado para Área de Transferência!" : "Copiar Texto"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Download size={16} /> Exportar Parecer (.txt)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}