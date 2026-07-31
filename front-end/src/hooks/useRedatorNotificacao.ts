import { useState } from "react";
import * as XLSX from "xlsx";
import { FUNCIONARIOS, INFRACTION_CODES } from "../services/notificacoes";
import { gerarNotificacaoApi, exportarWordApi, exportarPdfApi } from "../services/api";

export type PenaltyVariant = "multa" | "multaCP";
export type FileModalType = "success" | "warning" | "error";

export interface FileModalState {
  type: FileModalType;
  message: string;
}

export function useRedatorNotificacao() {
  // Configurações e UI States
  const [apiKey, setApiKey] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Seleção de Códigos
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [penaltyVariant, setPenaltyVariant] = useState<PenaltyVariant>("multa");

  // Planilha e Arquivos
  const [excelData, setExcelData] = useState<any[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Formulário
  const [matricula, setMatricula] = useState("");
  const [matriculaBuscada, setMatriculaBuscada] = useState("");
  const [dataConstatacao, setDataConstatacao] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [autoInfracao, setAutoInfracao] = useState("");
  const [equipe, setEquipe] = useState("");
  
  // Funcionário
  const [funcionario, setFuncionario] = useState("");
  const [funcionarioBusca, setFuncionarioBusca] = useState("");
  const [funcSearchOpen, setFuncSearchOpen] = useState(false);

  // Dados do Cliente
  const [clienteData, setClienteData] = useState({
    nomeCliente: "",
    logradouro: "",
    bairro: "",
    cep: "",
    localizacao: "",
    categoriaTarifa: "",
    numeroHidrometro: ""
  });

  const [generatedText, setGeneratedText] = useState("");

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

  const funcionarioSelecionado = FUNCIONARIOS.find((f) => String(f.matricula) === funcionario);

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
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
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

        setExcelData(data);

        if (data.length === 0) {
          setFileModal({ type: "warning", message: "Aviso: A planilha parece estar vazia ou os dados não estão na primeira aba." });
        } else {
          setFileModal({ type: "success", message: `${data.length} registros carregados com sucesso! Agora é só buscar a matrícula.` });
        }
      } catch (error) {
        console.error("Erro ao ler a planilha:", error);
        setFileModal({
          type: "error",
          message: "Erro ao ler o arquivo. Se for um CSV com formatação estranha, abra no Excel, clique em 'Salvar Como -> Pasta de Trabalho do Excel (.xlsx)' e tente novamente.",
        });
      } finally {
        setFileLoading(false);
      }
    };

    reader.onerror = () => {
      setFileLoading(false);
      setFileModal({ type: "error", message: "Não foi possível ler o arquivo selecionado. Tente novamente." });
    };

    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleSearchMatricula = () => {
    if (!matricula) return;
    setMatriculaBuscada(matricula);

    const encontrado = excelData.find((row) => String(row["Matrícula"]) === matricula);

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
      alert("Matrícula não encontrada na planilha.");
      setClienteData({ nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "" });
    }
  };

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;
    if (!apiKey) {
      alert("Por favor, insira sua Chave de API do Gemini no topo da tela.");
      return;
    }
    if (camposObrigatoriosVazios) {
      alert("Por favor, preencha todos os Dados da Notificação (Matrícula, Data, Protocolo, Funcionário e Equipe).");
      return;
    }
    if (esqueceuDeBuscar) {
      alert("Você digitou/alterou a matrícula, mas esqueceu de clicar em 'Buscar'. Por favor, busque os dados antes de gerar o documento.");
      return;
    }

    setLoading(true);
    setStep("idle");

    const textosBase = selectedItems.map(item =>
      penaltyVariant === "multaCP" ? item.clauseMultaCP : item.clauseMulta
    );

    try {
      // Usando o serviço em vez do fetch direto
      const data = await gerarNotificacaoApi({
        api_key: apiKey,
        textos_base: textosBase,
        dataConstatacao,
        protocolo,
        funcionario,
        equipe
      });
      
      setGeneratedText(data.texto_gerado);
      setStep("generated");
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o documento. Verifique se o servidor está funcionando corretamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pequena função auxiliar para evitar repetir código de download (Opcional, mas recomendado)
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
    if (!autoInfracao.trim()) {
      alert("Por favor, informe o Nº do Auto de Infração antes de baixar o documento.");
      return;
    }
    try {
      // Usando o serviço em vez do fetch
      const blob = await exportarWordApi({
        texto_final: generatedText,
        protocolo,
        autoInfracao,
        matricula,
        ...clienteData
      });
      
      baixarArquivoBrowser(blob, `Notificacao_Extrajudicial_${new Date().toISOString().split("T")[0]}.docx`);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!autoInfracao.trim()) {
      alert("Por favor, informe o Nº do Auto de Infração antes de baixar o documento.");
      return;
    }
    try {
      // Usando o serviço em vez do fetch
      const blob = await exportarPdfApi({
        texto_final: generatedText,
        protocolo,
        autoInfracao,
        matricula,
        ...clienteData
      });
      
      baixarArquivoBrowser(blob, `Notificacao_Extrajudicial_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF. Verifique se a rota no back-end já foi criada.");
    }
  };


  return {
    // States
    apiKey, setApiKey, dropdownOpen, setDropdownOpen, searchTerm, setSearchTerm,
    reviewMode, setReviewMode, step, setStep, loading, copied,
    selectedCodes, penaltyVariant, setPenaltyVariant,
    excelData, fileLoading, fileModal, setFileModal, fileName,
    matricula, setMatricula, dataConstatacao, setDataConstatacao,
    protocolo, setProtocolo, autoInfracao, setAutoInfracao, equipe, setEquipe,
    funcionario, setFuncionario, funcionarioBusca, setFuncionarioBusca,
    funcSearchOpen, setFuncSearchOpen, clienteData, generatedText, setGeneratedText,
    
    // Computed States
    selectedItems, filteredCodes, filteredFuncionarios,
    funcionarioSelecionado, esqueceuDeBuscar, camposObrigatoriosVazios,
    
    // Handlers
    toggleCode, handleFileUpload, handleSearchMatricula,
    handleGenerate, handleCopy, handleDownload, handleDownloadPDF
  };
}