import { useState } from "react";
import * as XLSX from "xlsx";
import { useSessionStorage } from "./useSessionStorage"; 
import { FUNCIONARIOS } from "../utils/funcionarios";
import { INFRACTION_CODES } from "../services/notificacoes";
import { gerarNotificacaoApi, exportarWordApi, exportarPdfApi } from "../services/api";

export type PenaltyVariant = "multa" | "multaCP";
export type FileModalType = "success" | "warning" | "error";

export interface FileModalState {
  type: FileModalType;
  message: string;
}

export function useRedatorNotificacao() {
  // =========================================================================
  // UI States (Efêmeros)
  // =========================================================================
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  const [funcSearchOpen, setFuncSearchOpen] = useState(false);

  // =========================================================================
  // Business States (Persistidos no Session Storage)
  // =========================================================================
  const [apiKey, setApiKey] = useSessionStorage("redator_apiKey", "");
  const [step, setStep] = useSessionStorage<"idle" | "generated">("redator_step", "idle");
  const [generatedText, setGeneratedText] = useSessionStorage("redator_generatedText", "");
  
  const [selectedCodes, setSelectedCodes] = useSessionStorage<string[]>("redator_selectedCodes", []);
  const [penaltyVariant, setPenaltyVariant] = useSessionStorage<PenaltyVariant>("redator_penaltyVariant", "multa");

  // Planilha 1: Base de Dados do Cliente (Antiga)
  const [excelData, setExcelData] = useSessionStorage<any[]>("redator_excelData", []);
  const [fileName, setFileName] = useSessionStorage<string>("redator_fileName", "");

  // Planilha 2: Lote / Responsável (Nova e Opcional)
  const [excelDataResp, setExcelDataResp] = useSessionStorage<any[]>("redator_excelDataResp", []);
  const [fileNameResp, setFileNameResp] = useSessionStorage<string>("redator_fileNameResp", "");

  // Formulário
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

  // Estados de Lote e Processados
  const [filtroResponsavel, setFiltroResponsavel] = useSessionStorage("redator_filtroResponsavel", "");
  const [processedMatriculas, setProcessedMatriculas] = useSessionStorage<string[]>("redator_processedMatriculas", []);

  // =========================================================================
  // DADOS DERIVADOS (Computed State)
  // =========================================================================

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

  // Lógica da Planilha 2 (Responsáveis e Lotes)
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

  const camposObrigatoriosVazios =
    !matricula.trim() ||
    !dataConstatacao.trim() ||
    !protocolo.trim() ||
    !funcionario.trim() ||
    !equipe.trim();

  // =========================================================================
  // AÇÕES E FUNÇÕES (Handlers)
  // =========================================================================

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  };

  // Upload da Planilha 1 (Clientes)
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

        setExcelData(data);
        setFileModal({ type: "success", message: `${data.length} registros de clientes carregados com sucesso!` });
      } catch (error) {
        setFileModal({ type: "error", message: "Erro ao ler a planilha de clientes." });
      } finally {
        setFileLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // Upload da Planilha 2 (Responsáveis / Lote)
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
        setFileModal({ type: "success", message: `${data.length} registros de responsáveis carregados para lote!` });
      } catch (error) {
        setFileModal({ type: "error", message: "Erro ao ler a planilha de responsáveis." });
      } finally {
        setFileLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const buscarMatricula = (mat: string) => {
    if (!mat) return;
    setMatriculaBuscada(mat);

    const encontrado = excelData.find((row) => String(row["Matrícula"]) === mat);

    if (encontrado) {
      setClienteData({
        nomeCliente: encontrado["Morador"] || "",
        logradouro: encontrado["Endereço"] || "",
        bairro: encontrado["Bairro"] || "",
        cep: encontrado["CEP"] || "",
        localizacao: encontrado["Localização"] || "",
        categoriaTarifa: encontrado["Ativ. Econômica"] || "",
        numeroHidrometro: encontrado["Numero Hidrometro"] || ""
      });
    } else {
      setClienteData({ nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "" });
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
    excelData, fileLoading, fileModal, setFileModal, fileName,
    excelDataResp, fileNameResp, handleFileUploadResp,
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