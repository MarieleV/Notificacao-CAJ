import { useState } from "react";
import * as XLSX from "xlsx";
import { getBusinessDaysDifference } from "../utils/dates";

export type FileModalType = "success" | "warning" | "error";
export interface FileModalState { type: FileModalType; message: string; }

export interface AnaliseProcessada {
  id: string;
  dataAbertura: string;
  codigoServico: string;
  matricula: string;
  funcionario: string;
  diasTranscorridos: number;
  diasAtraso: number;
  situacao: "No Prazo" | "Vencida";
  statusCliente: string;
  statusCAJ: string;
  isPadronizado: boolean;
}

const PRAZOS_SERVICO: Record<string, number> = {
  "426": 90,
  "427": 15,
  "1010": 1,
  "3769": 1,
};

export function useControleAnalises() {
  const [loading, setLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  
  const [fileNameOP, setFileNameOP] = useState<string>("");
  const [fileName989Cliente, setFileName989Cliente] = useState<string>("");
  const [fileName989CAJ, setFileName989CAJ] = useState<string>("");

  const [dadosOP, setDadosOP] = useState<any[]>([]);
  const [dados989Cliente, setDados989Cliente] = useState<any[]>([]);
  const [dados989CAJ, setDados989CAJ] = useState<any[]>([]);

  const [resultados, setResultados] = useState<AnaliseProcessada[]>([]);
  
  // --- ESTADOS DE FILTRO E ORDENAÇÃO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroFuncionario, setFiltroFuncionario] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("Todas");
  const [filtroStatusCliente, setFiltroStatusCliente] = useState("");

  const [sortConfig, setSortConfig] = useState<{ key: keyof AnaliseProcessada | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: "OP" | "989_Cliente" | "989_CAJ") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    if (tipo === "OP") setFileNameOP(file.name);
    else if (tipo === "989_Cliente") setFileName989Cliente(file.name);
    else setFileName989CAJ(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false, range: 4 });

        if (tipo === "OP") setDadosOP(data);
        else if (tipo === "989_Cliente") setDados989Cliente(data);
        else setDados989CAJ(data);

      } catch (error) {
        console.error("Erro ao ler planilha:", error);
        setFileModal({ type: "error", message: "Erro ao ler o arquivo selecionado." });
      } finally {
        setLoading(false);
        e.target.value = ""; 
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processarDados = () => {
    if (dadosOP.length === 0) {
      setFileModal({ type: "warning", message: "Carregue o Relatório OP00002 primeiro." });
      return;
    }

    setLoading(true);

    try {
      const mapStatusCliente = new Map<string, string>();
      const mapStatusCAJ = new Map<string, string>();

      const registrar989 = (dados: any[], mapStatus: Map<string, string>) => {
        dados.forEach(row => {
          const mat = String(row["MATRICULA"] || row["Matrícula"] || row["Matricula"] || "").trim();
          const situacao = String(row["SITUACAO_SERVICO"] || row["Situação"] || row["Situacao"] || "").trim();
          
          if (mat && !mapStatus.has(mat)) {
            mapStatus.set(mat, situacao || "—");
          }
        });
      };

      registrar989(dados989Cliente, mapStatusCliente);
      registrar989(dados989CAJ, mapStatusCAJ);

      const hojeStr = new Date().toLocaleDateString("pt-BR");
      const processados: AnaliseProcessada[] = [];

      dadosOP.forEach((row, index) => {
        const dataAberturaRaw = String(row["Data de Solicitação"] || row["Data de Abertura"] || row["Data"] || ""); 
        const servicoRaw = String(row["Serviço Solicitado"] || row["Código"] || row["Serviço"] || "").trim();
        const matricula = String(row["Matrícula"] || row["Matricula"] || "").trim();
        const funcionarioRaw = String(row["Funcionário / Equipe"] || "").trim();

        const dataAberturaLimpa = dataAberturaRaw.split(" ")[0];
        const codigoServico = servicoRaw.split("-")[0].trim().split(" ")[0];
        const funcionario = funcionarioRaw.replace(/^\d+-/, "").trim();

        const prazoEsperado = PRAZOS_SERVICO[codigoServico];
        if (!prazoEsperado) return; 

        const diasTranscorridos = getBusinessDaysDifference(dataAberturaLimpa, hojeStr);
        const diasAtraso = diasTranscorridos > prazoEsperado ? diasTranscorridos - prazoEsperado : 0;
        const situacao = diasAtraso > 0 ? "Vencida" : "No Prazo";
        
        const statusCliente = mapStatusCliente.get(matricula) || "—";
        const statusCAJ = mapStatusCAJ.get(matricula) || "—";

        const statusClienteValidos = ["para reprogramar", "pendente", "programado", "postergada"];
        const isPadronizado = 
          statusClienteValidos.includes(statusCliente.toLowerCase()) && 
          statusCAJ.toLowerCase().includes("encerrado - executado");

        processados.push({
          id: `${matricula}-${index}`,
          dataAbertura: dataAberturaLimpa,
          codigoServico,
          matricula,
          funcionario,
          diasTranscorridos,
          diasAtraso,
          situacao,
          statusCliente,
          statusCAJ,
          isPadronizado
        });
      });

      processados.sort((a, b) => {
        if (a.situacao === "Vencida" && b.situacao !== "Vencida") return -1;
        if (b.situacao === "Vencida" && a.situacao !== "Vencida") return 1;
        return b.diasAtraso - a.diasAtraso;
      });

      setSortConfig({ key: null, direction: 'asc' });
      setResultados(processados);
      setFileModal({ type: "success", message: `Processamento concluído! ${processados.length} análises verificadas.` });
      
    } catch (error) {
      console.error(error);
      setFileModal({ type: "error", message: "Erro ao processar os dados. Verifique o formato das colunas." });
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key: keyof AnaliseProcessada) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- FUNÇÃO PARA LIMPAR A TELA SEM PERDER OS ARQUIVOS ---
  const limparTela = () => {
    setResultados([]); // Zera a tabela e os gráficos
    setSearchTerm("");
    setFiltroCodigo("");
    setFiltroFuncionario("");
    setFiltroSituacao("Todas");
    setFiltroStatusCliente("");
    setSortConfig({ key: null, direction: 'asc' });
    // Note que NÃO estamos apagando as variáveis dadosOP e dados989. 
    // Assim as planilhas continuam na memória!
  };

  const filtrados = resultados.filter(r => {
    const matchGlobal = r.matricula.includes(searchTerm) || 
                        r.codigoServico.includes(searchTerm) || 
                        r.funcionario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const codigosArray = filtroCodigo.split(",").map(c => c.trim()).filter(c => c !== "");
    const matchCodigo = codigosArray.length === 0 || codigosArray.includes(r.codigoServico);
    
    const matchFuncionario = filtroFuncionario === "" || r.funcionario.toLowerCase().includes(filtroFuncionario.toLowerCase());
    const matchSituacao = filtroSituacao === "Todas" || r.situacao === filtroSituacao;

    const matchStatusCliente = filtroStatusCliente === "" || r.statusCliente.toLowerCase().includes(filtroStatusCliente.toLowerCase());

    return matchGlobal && matchCodigo && matchFuncionario && matchSituacao && matchStatusCliente;
  });

  const resultadosFiltradosEOrdenados = [...filtrados].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    if (sortConfig.key === "dataAbertura") {
      const [dayA, monthA, yearA] = (aValue as string).split('/');
      const [dayB, monthB, yearB] = (bValue as string).split('/');
      aValue = new Date(`${yearA}-${monthA}-${dayA}`).getTime();
      bValue = new Date(`${yearB}-${monthB}-${dayB}`).getTime();
    } else if (sortConfig.key === "codigoServico" || sortConfig.key === "matricula" || sortConfig.key === "diasTranscorridos" || sortConfig.key === "diasAtraso") {
      aValue = Number(String(aValue).replace(/\D/g, ''));
      bValue = Number(String(bValue).replace(/\D/g, ''));
    } else if (sortConfig.key === "isPadronizado") {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return {
    loading, fileModal, setFileModal, 
    fileNameOP, fileName989Cliente, fileName989CAJ, 
    dadosOP, dados989Cliente, dados989CAJ, 
    handleFileUpload, processarDados, 
    searchTerm, setSearchTerm, 
    filtroCodigo, setFiltroCodigo, 
    filtroFuncionario, setFiltroFuncionario, 
    filtroSituacao, setFiltroSituacao,
    filtroStatusCliente, setFiltroStatusCliente, 
    requestSort, sortConfig, limparTela, // <-- EXPORTANDO O LIMPAR TELA
    resultadosFiltrados: resultadosFiltradosEOrdenados, 
    resultados
  };
}