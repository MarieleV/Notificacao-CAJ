import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useSessionStorage } from "./useSessionStorage"; 
import { FUNCIONARIOS } from "../utils/funcionarios";
import { INFRACTION_CODES } from "../services/notificacoes";
import { gerarNotificacaoApi, exportarWordApi, exportarPdfApi } from "../services/api";
import { kvGet, kvSet } from "../utils/kvStorage";

const BASE_CLIENTE_KEY = "baseCliente";
// Cache em módulo: sobrevive a remontagens do componente dentro da mesma sessão do app
let baseClienteCache: any[] = [];

export type PenaltyVariant = "multa" | "multaCP";
export type FileModalType = "success" | "warning" | "error";

export interface FileModalState {
  type: FileModalType;
  message: string;
}

export function useRedatorNotificacao() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  const [funcSearchOpen, setFuncSearchOpen] = useState(false);

  const [apiKey, setApiKey] = useSessionStorage("redator_apiKey", "");
  const [step, setStep] = useSessionStorage<"idle" | "generated">("redator_step", "idle");
  const [generatedText, setGeneratedText] = useSessionStorage("redator_generatedText", "");
  
  const [selectedCodes, setSelectedCodes] = useSessionStorage<string[]>("redator_selectedCodes", []);
  const [penaltyVariant, setPenaltyVariant] = useSessionStorage<PenaltyVariant>("redator_penaltyVariant", "multa");

  // Planilha 1: Base de Dados do Cliente
  // Os dados ficam em estado React (RAM) + cache de módulo + IndexedDB (persistência sem limite de 5MB).
  // O nome do arquivo continua no sessionStorage, mas é sincronizado com a existência real dos dados.
  const [excelData, setExcelDataState] = useState<any[]>(baseClienteCache);
  const [baseHydrated, setBaseHydrated] = useState<boolean>(baseClienteCache.length > 0);
  const [fileName, setFileName] = useSessionStorage<string>("redator_fileName", "");

  const setExcelData = (data: any[]) => {
    baseClienteCache = data;
    setExcelDataState(data);
    kvSet(BASE_CLIENTE_KEY, data).catch((e) =>
      console.warn("Não foi possível persistir a base de clientes:", e)
    );
  };

  // Reidrata a base ao montar (aba recarregada/descartada pelo Chrome, troca de tela, deploy novo...)
  useEffect(() => {
    if (baseClienteCache.length > 0) {
      setBaseHydrated(true);
      return;
    }
    let cancelled = false;
    kvGet<any[]>(BASE_CLIENTE_KEY)
      .then((saved) => {
        if (cancelled) return;
        if (saved && saved.length > 0) {
          baseClienteCache = saved;
          setExcelDataState(saved);
        } else {
          setFileName("");
        }
      })
      .catch((e) => console.warn("Erro ao ler a base de clientes salva:", e))
      .finally(() => {
        if (!cancelled) setBaseHydrated(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Planilha 2: Lote / Responsável (upload manual ou integração)
  const [excelDataResp, setExcelDataResp] = useSessionStorage<any[]>("redator_excelDataResp", []);
  const [fileNameResp, setFileNameResp] = useSessionStorage<string>("redator_fileNameResp", "");

  const [matricula, setMatricula] = useSessionStorage("redator_matricula", "");
  const [matriculaBuscada, setMatriculaBuscada] = useSessionStorage("redator_matriculaBuscada", "");
  const [dataConstatacao, setDataConstatacao] = useSessionStorage("redator_dataConstatacao", "");
  const [protocolo, setProtocolo] = useSessionStorage("redator_protocolo", "");
  const [autoInfracao, setAutoInfracao] = useSessionStorage("redator_autoInfracao", "");
  const [equipe, setEquipe] = useSessionStorage("redator_equipe", "");
  
  const [funcionario, setFuncionario] = useSessionStorage("redator_funcionario", "");
  const [funcionarioBusca, setFuncionarioBusca] = useSessionStorage("redator_funcionarioBusca", "");

  const [clienteData, setClienteData] = useSessionStorage("redator_clienteData", {
    nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: ""
  });

  const [filtroResponsavel, setFiltroResponsavel] = useSessionStorage("redator_filtroResponsavel", "");
  const [processedMatriculas, setProcessedMatriculas] = useSessionStorage<string[]>("redator_processedMatriculas", []);

  // COMPUTED STATES
  const selectedItems = INFRACTION_CODES.filter((c) => selectedCodes.includes(c.code));

  const filteredCodes = INFRACTION_CODES.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.title.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  const filteredFuncionarios = FUNCIONARIOS.filter((f) => {
    const term = funcionarioBusca.toLowerCase().trim();
    if (!term) return true;
    return f.nome.toLowerCase().includes(term) || String(f.matricula).includes(term);
  });

  const firstRowResp = excelDataResp[0] || {};
  const possibleKeysResp = Object.keys(firstRowResp);
  const keyResp = possibleKeysResp.find(k => /func|resp|equipe|agente|usuario|atendente/i.test(k)) || possibleKeysResp[0];
  const keyMatriculaResp = possibleKeysResp.find(k => /matr[ií]cula|matricula|mat/i.test(k)) || possibleKeysResp[1] || possibleKeysResp[0];

  const responsaveisList = Array.from(new Set(
    excelDataResp
      .map(row => String(row[keyResp] || "").trim())
      .filter(Boolean)
  )).sort();

  const casosResponsavel = filtroResponsavel && keyResp
    ? excelDataResp.filter(row => String(row[keyResp] || "").trim() === filtroResponsavel)
    : [];

  const totalCasos = casosResponsavel.length;
  const currentCasoIndex = casosResponsavel.findIndex(row => String(row[keyMatriculaResp] || row["Matrícula"] || "") === matricula);
  const isCurrentProcessed = processedMatriculas.includes(matricula);

  const funcionarioSelecionado = null; 
  const esqueceuDeBuscar = matricula.trim() !== "" && matricula !== matriculaBuscada;
  const camposObrigatoriosVazios = !matricula.trim() || !dataConstatacao.trim() || !protocolo.trim() || !funcionario.trim() || !equipe.trim();

  // ACTIONS
  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        // Mapeia e compacta apenas os campos essenciais
        const dataMapped = data.map((row: any) => {
          const getRowVal = (patterns: RegExp[]) => {
            for (const pattern of patterns) {
              const key = Object.keys(row).find(k => pattern.test(k));
              if (key && row[key] !== undefined && row[key] !== null) {
                return String(row[key]).trim();
              }
            }
            return "";
          };
          return {
            matricula: getRowVal([/matr[ií]cula|matricula|mat/i]),
            morador: getRowVal([/morador|cliente|nome|proprietario/i]),
            endereco: getRowVal([/endere[çc]o|logradouro|rua|avenida/i]),
            bairro: getRowVal([/bairro/i]),
            cep: getRowVal([/cep/i]),
            localizacao: getRowVal([/localiza[çc][ãa]o/i]),
            ativEconomica: getRowVal([/ativ.*econ[ôo]mica|categoria|tarifa/i]),
            numeroHidrometro: getRowVal([/n[úu]mero.*hidr[ôo]metro|hidrometro|medidor/i])
          };
        }).filter(item => item.matricula !== ""); // Remove linhas vazias

        // Atualiza RAM, cache de módulo e IndexedDB
        setExcelData(dataMapped);
        setBaseHydrated(true);
        setFileModal({ type: "success", message: `${dataMapped.length} registros de clientes carregados com sucesso!` });
      } catch (error) {
        setFileModal({ type: "error", message: "Erro ao ler a planilha de clientes." });
      } finally {
        setFileLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleFileUploadResp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setFileNameResp(file.name);
    setFiltroResponsavel("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        setExcelDataResp(data);
        setFileModal({ type: "success", message: `${data.length} registros carregados para lote!` });
      } catch (error) {
        setFileModal({ type: "error", message: "Erro ao ler a planilha de responsáveis." });
      } finally {
        setFileLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // IMPORTAÇÃO DIRETA DO CONTROLE DE ANÁLISES 
  const importarDoControleAnalises = () => {
    try {
      // 1. Tenta pegar os dados salvos da tela Controle de Análises
      const savedStr = localStorage.getItem("@ControleAnalises:state");
      if (!savedStr) {
        setFileModal({ type: "warning", message: "Nenhum dado salvo encontrado. Acesse a tela 'Controle de Análises' e processe as planilhas primeiro." });
        return;
      }
      
      const savedState = JSON.parse(savedStr);
      
      // 2. Tenta pegar os dados.
      let casosParaImportar = savedState.resultadosFiltrados || savedState.filtrados || savedState.dadosFiltrados || [];
      
      // Se não achar os filtrados, tenta pegar os originais como fallback.
      if (casosParaImportar.length === 0) {
          casosParaImportar = savedState.resultados || savedState.dadosOriginais || [];
      }

      // Se ainda assim estiver vazio...
      if (casosParaImportar.length === 0) {
        setFileModal({ type: "warning", message: "A tabela no 'Controle de Análises' está vazia ou todos os itens foram filtrados/removidos." });
        return;
      }

      // 3. Converte os dados filtrados para o formato que nosso Lote espera
      const dataMapped = casosParaImportar.map((item: any) => ({
        // Aceita variações comuns do nome da chave
        "Matrícula": item.matricula || item.Matrícula || item.Matricula || "",
        "Responsável": item.funcionario || item.responsavel || item.Funcionario || item.Responsavel || "",
        "Código": item.codigoServico || item.codigo || item.Codigo || "",
        "Status": item.situacao || item.status || item.Situacao || ""
      }));

      // 4. Salva no estado da Planilha 2 (Lotes)
      setExcelDataResp(dataMapped);
      setFileNameResp(`Importado: ${casosParaImportar.length} casos analisados`);
      setFiltroResponsavel("");
      setFileModal({ type: "success", message: `${casosParaImportar.length} casos puxados da tela de Controle de Análises com sucesso!` });
      
    } catch (error) {
      console.error("Erro ao importar do Controle:", error);
      setFileModal({ type: "error", message: "Erro ao tentar ler os dados. Tente processar novamente na tela de Controle de Análises." });
    }
  };

  const buscarMatricula = (mat: string) => {
    if (!mat) return;
    const matTrimmed = String(mat).trim();
    setMatriculaBuscada(matTrimmed);

    if (excelData.length === 0) {
      setFileModal({ 
        type: "warning", 
        message: baseHydrated
          ? "A 'Base de Dados do Cliente' (Planilha 1) não foi carregada. Faça o upload dela para que a busca automática por matrícula funcione."
          : "Carregando a 'Base de Dados do Cliente'... aguarde um instante e clique em 'Buscar' novamente."
      });
      return;
    }

    // Procura o registro na base otimizada
    const encontrado = excelData.find((row) => row.matricula === matTrimmed);

    if (encontrado) {
      setClienteData({
        nomeCliente: encontrado.morador,
        logradouro: encontrado.endereco,
        bairro: encontrado.bairro,
        cep: encontrado.cep,
        localizacao: encontrado.localizacao,
        categoriaTarifa: encontrado.ativEconomica,
        numeroHidrometro: encontrado.numeroHidrometro
      });
      // O card verde aparecerá automaticamente com base no estado atualizado!
    } else {
      setClienteData({ nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "" });
      setFileModal({ 
        type: "warning", 
        message: `A matrícula "${matTrimmed}" não foi encontrada na "Base de Dados do Cliente" (Planilha 1). Verifique se o arquivo correto foi carregado.` 
      });
    }
  };

  const handleSearchMatricula = () => buscarMatricula(matricula);

  const handleSelectResponsavel = (resp: string) => {
    setFiltroResponsavel(resp);
    if (resp) {
      const casos = excelDataResp.filter(row => String(row[keyResp] || "").trim() === resp);
      if (casos.length > 0) {
        const primeiraMat = String(casos[0][keyMatriculaResp] || casos[0]["Matrícula"] || "");
        setMatricula(primeiraMat);
        buscarMatricula(primeiraMat);
      }
    }
  };

  const navegarCaso = (direction: 'next' | 'prev') => {
    if (totalCasos === 0) return;
    let newIndex = currentCasoIndex;
    
    if (direction === 'next') {
      newIndex = (currentCasoIndex >= 0 && currentCasoIndex < totalCasos - 1) ? currentCasoIndex + 1 : 0;
    } else {
      newIndex = (currentCasoIndex > 0) ? currentCasoIndex - 1 : totalCasos - 1;
    }
    
    const rowData = casosResponsavel[newIndex];
    const novaMatricula = String(rowData[keyMatriculaResp] || rowData["Matrícula"] || "");
    setMatricula(novaMatricula);
    buscarMatricula(novaMatricula);
    setStep("idle");
  };

  const marcarComoProcessada = () => {
    if (matricula && !processedMatriculas.includes(matricula)) {
      setProcessedMatriculas(prev => [...prev, matricula]);
    }
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;
    if (!apiKey) return alert("Insira sua Chave de API do Gemini.");
    if (camposObrigatoriosVazios) return alert("Preencha todos os Dados da Notificação.");
    if (esqueceuDeBuscar && excelData.length > 0) return alert("Você alterou a matrícula, clique em 'Buscar' antes de gerar.");

    setLoading(true);
    setStep("idle");

    const textosBase = selectedItems.map(item => penaltyVariant === "multaCP" ? item.clauseMultaCP : item.clauseMulta);

    try {
      const data = await gerarNotificacaoApi({
        api_key: apiKey, textos_base: textosBase,
        dataConstatacao, protocolo, funcionario, equipe
      });
      setGeneratedText(data.texto_gerado);
      setStep("generated");
    } catch (error: any) {
      alert(`Falha ao gerar o documento. Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baixarArquivoBrowser = (blob: Blob, nomeArquivo: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!autoInfracao.trim()) return alert("Informe o Nº do Auto de Infração.");
    try {
      const blob = await exportarWordApi({
        texto_final: generatedText, protocolo, autoInfracao, matricula, ...clienteData
      });
      baixarArquivoBrowser(blob, `Notificacao_${matricula}.docx`);
      marcarComoProcessada();
    } catch (error) {
      alert("Erro ao baixar o arquivo Word.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!autoInfracao.trim()) return alert("Informe o Nº do Auto de Infração.");
    try {
      const blob = await exportarPdfApi({
        texto_final: generatedText, protocolo, autoInfracao, matricula, ...clienteData
      });
      baixarArquivoBrowser(blob, `Notificacao_${matricula}.pdf`);
      marcarComoProcessada();
    } catch (error) {
      alert("Erro ao baixar o arquivo PDF.");
    }
  };

  function limparTela() {
    if (!window.confirm("Deseja limpar o formulário? As planilhas continuarão carregadas.")) return;
    setStep("idle");
    setGeneratedText("");
    setSelectedCodes([]);
    setPenaltyVariant("multa");
    setMatricula("");
    setMatriculaBuscada("");
    setDataConstatacao("");
    setProtocolo("");
    setAutoInfracao("");
    setEquipe("");
    setFuncionario("");
    setFuncionarioBusca("");
    setFiltroResponsavel("");
    setClienteData({ nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "" });
  }

  return {
    apiKey, setApiKey, dropdownOpen, setDropdownOpen, searchTerm, setSearchTerm,
    reviewMode, setReviewMode, step, setStep, loading, copied,
    selectedCodes, penaltyVariant, setPenaltyVariant,
    excelData, baseHydrated, fileLoading, fileModal, setFileModal, fileName,
    
    excelDataResp, fileNameResp, handleFileUploadResp, importarDoControleAnalises,
    
    matricula, setMatricula, dataConstatacao, setDataConstatacao,
    protocolo, setProtocolo, autoInfracao, setAutoInfracao, equipe, setEquipe,
    funcionario, setFuncionario, funcionarioBusca, setFuncionarioBusca,
    funcSearchOpen, setFuncSearchOpen, clienteData, generatedText, setGeneratedText,
    
    filtroResponsavel, responsaveisList, handleSelectResponsavel, 
    casosResponsavel, currentCasoIndex, totalCasos, navegarCaso, isCurrentProcessed,
    
    selectedItems, filteredCodes, filteredFuncionarios,
    funcionarioSelecionado, esqueceuDeBuscar, camposObrigatoriosVazios,
    
    toggleCode, handleFileUpload, handleSearchMatricula,
    handleGenerate, handleCopy, handleDownload, handleDownloadPDF, limparTela
  };
}