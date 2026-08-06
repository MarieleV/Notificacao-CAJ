import { useState } from "react";
import { useSessionStorage } from "./useSessionStorage"; // <-- Importando o hook
import { calculateEndDate } from "../utils/dates";
import { DEFESAS_TEMPLATES, exportarParecerWord, exportarParecerPDF } from "../services/defesas";

export function useRespostaDefesa() {
  // 1. Estados da Interface (Efêmeros)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // 2. Estados dos Dados (Persistidos)
  const [step, setStep] = useSessionStorage<"idle" | "generated">("defesa_step", "idle");
  const [selectedCodes, setSelectedCodes] = useSessionStorage<string[]>("defesa_selectedCodes", []);
  const [defesaAI, setDefesaAI] = useSessionStorage("defesa_defesaAI", "");
  const [motivoIndeferimento, setMotivoIndeferimento] = useSessionStorage("defesa_motivoIndeferimento", "");
  const [generatedText, setGeneratedText] = useSessionStorage("defesa_generatedText", "");

  // 3. Estados da Calculadora (Persistidos)
  const [calcPrazo, setCalcPrazo] = useSessionStorage<string>("defesa_calcPrazo", "15");
  const [calcCustomPrazo, setCalcCustomPrazo] = useSessionStorage<string>("defesa_calcCustomPrazo", "");
  const [calcDataInicial, setCalcDataInicial] = useSessionStorage<string>("defesa_calcDataInicial", "");

  // --- LÓGICA DERIVADA (Cálculos e Filtros) ---
  const durationNum = calcPrazo === "X" ? parseInt(calcCustomPrazo || "0", 10) : parseInt(calcPrazo, 10);
  const calcDataFinal = calculateEndDate(calcDataInicial, durationNum);

  const selectedItems = DEFESAS_TEMPLATES.filter((c) => selectedCodes.includes(c.code));
  
  const filteredCodes = DEFESAS_TEMPLATES.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.title.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  const camposObrigatoriosVazios = !defesaAI.trim();

  // --- AÇÕES (Handlers) ---
  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => (prev.includes(code) ? [] : [code]));
  };

  const handleGenerate = () => {
    if (selectedItems.length === 0) return;
    if (camposObrigatoriosVazios) {
      alert("Por favor, preencha o Nº da Defesa A.I.");
      return;
    }

    const finalTexts = selectedItems.map((item) => {
      let result = item.text.replace(/{DEFESA_AI}/g, defesaAI);
      if (motivoIndeferimento.trim() !== "") {
        result = result.replace(
          /\[descrever aqui o fundamento específico para a decisão\]/g,
          motivoIndeferimento
        );
      }
      return result;
    });

    setGeneratedText(finalTexts.join("\n\n---------------------------\n\n"));
    setStep("generated");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (blob: Blob, ext: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resposta_Defesa_${new Date().toISOString().split("T")[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadWord = async () => {
    try {
      const blob = await exportarParecerWord({ texto_final: generatedText, protocolo: defesaAI, autoInfracao: "", matricula: "" });
      downloadFile(blob, "docx");
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await exportarParecerPDF({ texto_final: generatedText, protocolo: defesaAI, autoInfracao: "", matricula: "" });
      downloadFile(blob, "pdf");
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF.");
    }
  };

  function limparTela() {
    if (!window.confirm("Tem certeza que deseja limpar a tela?")) return;
    
    setStep("idle");
    setSelectedCodes([]);
    setDefesaAI("");
    setMotivoIndeferimento("");
    setGeneratedText("");
    setCalcPrazo("15");
    setCalcCustomPrazo("");
    setCalcDataInicial("");
  }

  return {
    // Estados expostos para a UI
    dropdownOpen, setDropdownOpen,
    searchTerm, setSearchTerm,
    step, reviewMode, setReviewMode, copied,
    defesaAI, setDefesaAI,
    motivoIndeferimento, setMotivoIndeferimento,
    generatedText, setGeneratedText,
    showCalculator, setShowCalculator,
    calcPrazo, setCalcPrazo,
    calcCustomPrazo, setCalcCustomPrazo,
    calcDataInicial, setCalcDataInicial,
    calcDataFinal,
    selectedCodes, selectedItems, filteredCodes, camposObrigatoriosVazios,
    // Ações expostas
    toggleCode, handleGenerate, handleCopy, handleDownloadWord, handleDownloadPDF, limparTela
  };
}