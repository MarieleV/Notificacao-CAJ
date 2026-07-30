import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Sparkles, Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Loader2, Info, Key, Search, UserCheck,
} from "lucide-react";

import { DatePicker } from "../../components/shared/DatePicker";
import { SectionBlock } from "../../components/shared/SectionBlock";

// Importando os dados estáticos separados
import { FUNCIONARIOS, INFRACTION_CODES, CATEGORY_COLORS } from "../../services/notificacoes";

type PenaltyVariant = "multa" | "multaCP";

type FileModalType = "success" | "warning" | "error";
interface FileModalState {
  type: FileModalType;
  message: string;
}

export function RedatorNotificacao() {
  const [apiKey, setApiKey] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [excelData, setExcelData] = useState<any[]>([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const [matricula, setMatricula] = useState("");
  const [matriculaBuscada, setMatriculaBuscada] = useState("");
  const [dataConstatacao, setDataConstatacao] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [autoInfracao, setAutoInfracao] = useState("");
  const [equipe, setEquipe] = useState("");

  const [funcionario, setFuncionario] = useState("");
  const [funcionarioBusca, setFuncionarioBusca] = useState("");
  const [funcSearchOpen, setFuncSearchOpen] = useState(false);

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
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [penaltyVariant, setPenaltyVariant] = useState<PenaltyVariant>("multa");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedItems = INFRACTION_CODES.filter((c) =>
    selectedCodes.includes(c.code)
  );

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
    return (
      f.nome.toLowerCase().includes(term) ||
      String(f.matricula).includes(term)
    );
  });

  const funcionarioSelecionado = FUNCIONARIOS.find(
    (f) => String(f.matricula) === funcionario
  );

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
          setFileModal({
            type: "warning",
            message: "Aviso: A planilha parece estar vazia ou os dados não estão na primeira aba.",
          });
        } else {
          setFileModal({
            type: "success",
            message: `${data.length} registros carregados com sucesso! Agora é só buscar a matrícula.`,
          });
        }
      } catch (error) {
        console.error("Erro ao ler a planilha:", error);
        setFileModal({
          type: "error",
          message:
            "Erro ao ler o arquivo. Se for um CSV com formatação estranha, abra no Excel, clique em 'Salvar Como -> Pasta de Trabalho do Excel (.xlsx)' e tente novamente.",
        });
      } finally {
        setFileLoading(false);
      }
    };

    reader.onerror = () => {
      setFileLoading(false);
      setFileModal({
        type: "error",
        message: "Não foi possível ler o arquivo selecionado. Tente novamente.",
      });
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

  const esqueceuDeBuscar = matricula.trim() !== "" && matricula !== matriculaBuscada;

  const camposObrigatoriosVazios =
    !matricula.trim() ||
    !dataConstatacao.trim() ||
    !protocolo.trim() ||
    !funcionario.trim() ||
    !equipe.trim();

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
      const response = await fetch("https://notificacao-caj.vercel.app/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          textos_base: textosBase,
          dataConstatacao,
          protocolo,
          funcionario,
          equipe
        }),
      });

      if (!response.ok) throw new Error("Erro na comunicação com o servidor Python");

      const data = await response.json();
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

  const handleDownload = async () => {
    if (!autoInfracao.trim()) {
      alert("Por favor, informe o Nº do Auto de Infração antes de baixar o documento.");
      return;
    }

    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto_final: generatedText,
          protocolo,
          autoInfracao,
          matricula,
          ...clienteData
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar Word.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notificacao_Extrajudicial_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
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
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto_final: generatedText,
          protocolo,
          autoInfracao,
          matricula,
          ...clienteData
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notificacao_Extrajudicial_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF. Verifique se a rota no back-end já foi criada.");
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Overlay de carregamento da planilha */}
      {fileLoading && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-[220px]">
            <Loader2 size={32} className="animate-spin text-[#1a5fa8]" />
            <p className="text-sm font-medium text-gray-700 text-center">Carregando planilha…</p>
          </div>
        </div>
      )}

      {/* Modal central com o resultado do carregamento */}
      {fileModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center text-center gap-3">
            {fileModal.type === "success" && (
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={26} className="text-emerald-500" />
              </div>
            )}
            {fileModal.type === "warning" && (
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle size={26} className="text-amber-500" />
              </div>
            )}
            {fileModal.type === "error" && (
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={26} className="text-red-500" />
              </div>
            )}
            <p className="text-sm text-gray-700 leading-relaxed">{fileModal.message}</p>
            <button
              onClick={() => setFileModal(null)}
              className="mt-1 w-full py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-lg text-xs font-semibold transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Redigir Notificação Extrajudicial</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Assistente de redação jurídica com Inteligência Artificial</p>
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

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Bloco 1 — Seleção de Códigos */}
          <SectionBlock
            number={1}
            title="Seleção de Códigos de Infração"
            description="Selecione um ou mais códigos referentes ao caso do cliente"
          >
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#1a5fa8] hover:bg-[#f0f7ff] transition-all"
              >
                <span className="text-gray-500">
                  {selectedCodes.length === 0
                    ? "Clique para selecionar códigos de infração..."
                    : `${selectedCodes.length} código(s) selecionado(s)`}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar por código, título ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] transition-all"
                      />
                    </div>
                  </div>
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 px-2">Clique para selecionar/desmarcar</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {filteredCodes.length > 0 ? (
                      filteredCodes.map((item) => {
                        const selected = selectedCodes.includes(item.code);
                        return (
                          <button
                            key={item.code}
                            onClick={() => toggleCode(item.code)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#f0f7ff] transition-colors ${selected ? "bg-[#f0f7ff]" : ""}`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-[#1a5fa8] border-[#1a5fa8]" : "border-gray-300"}`}>
                              {selected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                                <span className="text-sm font-medium text-gray-800">{item.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${CATEGORY_COLORS[item.category]}`}>
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 truncate">{item.clauseMulta.substring(0, 90)}…</p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">
                        Nenhum código encontrado para "{searchTerm}".
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-1.5 bg-[#1a5fa8] text-white text-xs rounded-lg hover:bg-[#154d8a] transition-colors"
                    >
                      Confirmar Seleção
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center gap-1.5 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-2.5 py-1.5"
                  >
                    <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                    <span className="text-xs text-[#0b1e35]">{item.title}</span>
                    <button
                      onClick={() => toggleCode(item.code)}
                      className="text-[#4a7fa5] hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Tipo de penalidade
                </label>
              </div>

              <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPenaltyVariant("multa")}
                  className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    penaltyVariant === "multa"
                      ? "bg-[#1a5fa8] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  Apenas Multa
                </button>
                <button
                  type="button"
                  onClick={() => setPenaltyVariant("multaCP")}
                  className={`px-6 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    penaltyVariant === "multaCP"
                      ? "bg-[#1a5fa8] text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  Multa + Padronização
                </button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Info size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">Prévia das cláusulas selecionadas</p>
                </div>
                <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div key={item.code} className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-bold text-[#1a5fa8]">[{item.code}]</span>{" "}
                      {penaltyVariant === "multaCP" ? item.clauseMultaCP : item.clauseMulta}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionBlock>

          {/* Bloco 2 — Dados da Notificação */}
          <SectionBlock
            number={2}
            title="Dados da Notificação"
            description="Insira a Matrícula para buscar o cliente automaticamente"
          >
            {/* PAINEL DE PLANILHA */}
            <div className="mb-6 bg-[#f8fafe] border border-[#dce9f7] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[#1a5fa8] flex items-center gap-1.5 mb-1"><FileText size={14}/> Carregar Base de Dados</h3>
                <p className="text-[10px] text-gray-500">Faça o upload do Excel/CSV para habilitar a busca automática por Matrícula.</p>
              </div>
              <div className="w-full sm:w-auto">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  disabled={fileLoading}
                  className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#1a5fa8] file:text-white hover:file:bg-[#154d8a] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {fileName && (
                  <p className="mt-1.5 text-[11px] text-[#1a5fa8] flex items-center gap-1 truncate max-w-[260px]">
                    <FileText size={11} className="flex-shrink-0" />
                    <span className="truncate">{fileName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* CAMPOS */}
            <div className="mb-6">
              {/* Linha 1: Matrícula e Busca */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Matrícula</label>
                  <div className="flex gap-2">
                    <input
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      placeholder="Ex: 1298382-9"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                    <button
                      onClick={handleSearchMatricula}
                      disabled={excelData.length === 0}
                      title={excelData.length === 0 ? "Carregue a planilha primeiro" : "Buscar dados"}
                      className="px-4 py-2 bg-[#eef6ff] text-[#1a5fa8] border border-[#c3ddf8] rounded-lg text-xs font-semibold hover:bg-[#dce9f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              {/* Card de Confirmação */}
              {clienteData.nomeCliente && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
                  <div className="mt-0.5 text-emerald-600"><UserCheck size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Cliente localizado e dados importados com sucesso!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5"><strong>Nome:</strong> {clienteData.nomeCliente} | <strong>Endereço:</strong> {clienteData.logradouro} | <strong>Hidrômetro:</strong> {clienteData.numeroHidrometro}</p>
                  </div>
                </div>
              )}

              {/* Linha 2: Constatação, Protocolo, Funcionário, Equipe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Data Constatação</label>
                  <DatePicker
                    value={dataConstatacao}
                    onChange={setDataConstatacao}
                    placeholder="DD/MM/AAAA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Protocolo</label>
                  <input value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Ex: 12345678" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>

                {/* CAMPO DE FUNCIONÁRIO */}
                <div className="relative">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Funcionário</label>
                  <input
                    value={funcionario ? `Mat. ${funcionario}` : funcionarioBusca}
                    onChange={(e) => {
                      setFuncionario("");
                      setFuncionarioBusca(e.target.value);
                      setFuncSearchOpen(true);
                    }}
                    onFocus={() => {
                      if (funcionario) setFuncionarioBusca("");
                      setFuncSearchOpen(true);
                    }}
                    onBlur={() => setTimeout(() => setFuncSearchOpen(false), 200)}
                    placeholder="Pesquisar por nome..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]"
                  />
                  {funcionarioSelecionado && !funcSearchOpen && (
                    <p className="mt-1 text-[10px] text-gray-500 truncate">{funcionarioSelecionado.nome}</p>
                  )}
                  {funcSearchOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                      {filteredFuncionarios.map((f) => (
                        <div
                          key={f.matricula}
                          className="px-3 py-2 flex items-center justify-between gap-2 text-sm text-gray-700 hover:bg-[#f0f7ff] hover:text-[#1a5fa8] cursor-pointer transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFuncionario(String(f.matricula));
                            setFuncionarioBusca("");
                            setFuncSearchOpen(false);
                          }}
                        >
                          <span className="truncate">{f.nome}</span>
                          <span className="text-[10px] font-mono font-bold text-[#1a5fa8] flex-shrink-0">Mat. {f.matricula}</span>
                        </div>
                      ))}
                      {filteredFuncionarios.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">Nenhum funcionário encontrado</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Equipe</label>
                  <input value={equipe} onChange={(e) => setEquipe(e.target.value)} placeholder="Ex: Leiturista" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8]" />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedCodes.length === 0 || loading || esqueceuDeBuscar || camposObrigatoriosVazios}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  IA processando — redigindo notificação…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Consolidar e Redigir Texto
                </>
              )}
            </button>
            {(selectedCodes.length === 0 || esqueceuDeBuscar || camposObrigatoriosVazios) && (
              <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                <p className="text-xs">
                  {selectedCodes.length === 0
                    ? "Selecione ao menos um código de infração para habilitar a geração."
                    : esqueceuDeBuscar
                    ? "Você digitou uma Matrícula. Clique no botão 'Buscar' ao lado dela para confirmar os dados antes de gerar o texto."
                    : "Preencha todos os Dados da Notificação (Matrícula, Data, Protocolo, Funcionário e Equipe)."}
                </p>
              </div>
            )}
          </SectionBlock>

          {/* Bloco 3 — Revisão e Edição */}
          {step === "generated" && (
            <SectionBlock
              icon={CheckCircle2}
              title="Revisão e Edição do Texto"
              description="Clique no texto para personalizar qualquer detalhe necessário"
              className="animate-fadeIn !border-emerald-200"
              headerAction={
                <div className="flex items-center gap-3 mt-3 md:mt-0 w-full justify-between md:justify-end">
                  <span className="hidden md:inline-block text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    Gerado com sucesso!
                  </span>
                  <button
                    onClick={() => setReviewMode(reviewMode === "preview" ? "edit" : "preview")}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all bg-white"
                  >
                    {reviewMode === "preview" ? "Editar Texto" : "Modo Visualização"}
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
                  {generatedText}
                </div>
              ) : (
                <textarea
                  ref={textAreaRef}
                  autoFocus
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  onBlur={() => setReviewMode("preview")}
                  className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                  spellCheck={false}
                />
              )}
            </SectionBlock>
          )}

          {/* Bloco 4 — Exportação */}
          {step === "generated" && (
            <SectionBlock
              number={4}
              title="Exportação e Entrega"
              description="Informe o Nº do Auto e baixe o arquivo formatado em PDF ou Word"
              className="animate-fadeIn"
            >
              <div className="mb-6 bg-gray-50 p-4 border border-gray-100 rounded-xl">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Nº Auto Infração <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    value={autoInfracao}
                    onChange={(e) => setAutoInfracao(e.target.value)}
                    placeholder="Ex: 98765"
                    className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                  />
                  {!autoInfracao.trim() && (
                    <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                      <AlertCircle size={12} className="flex-shrink-0" />
                      Obrigatório preencher para habilitar os downloads
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!autoInfracao.trim()}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <FileText size={17} />
                  Baixar em PDF
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!autoInfracao.trim()}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0b1e35]"
                >
                  <Download size={17} />
                  Baixar .docx
                </button>
              </div>

              <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-3 py-2 flex items-start gap-2">
                <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4a7fa5]">
                  Os arquivos serão exportados com as variáveis embutidas. Se você subiu a planilha e buscou pela matrícula, elas serão preenchidas automaticamente; senão, seu ERP fará isso.
                </p>
              </div>
            </SectionBlock>
          )}
        </div>
      </div>
    </div>
  );
}