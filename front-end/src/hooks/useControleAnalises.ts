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
  padronizada: "Sim" | "Não";
  statusCliente: string; // <-- NOVA COLUNA
  statusCAJ: string;     // <-- NOVA COLUNA
}

const PRAZOS_SERVICO: Record<string, number> = {
  "426": 90,
  "427": 15,
  "1010": 1,
  "3769": 1,
};

const CODIGOS_PADRONIZACAO = new Set([
  "14201", "14203", "14211", "14213", "14231", "14254", "14271",
  "14601", "14603", "14604", "14605", "14631", "14633", "14654",
  "14901", "14903", "14931"
]);

const SITUACOES_VALIDAS_989 = new Set(["Pendentes", "Encerrados - executados programados"]);

export function useControleAnalises() {
  const [loading, setLoading] = useState(false);
  const [fileModal, setFileModal] = useState<FileModalState | null>(null);
  
  // Nomes dos arquivos carregados
  const [fileNameOP, setFileNameOP] = useState<string>("");
  const [fileName989Cliente, setFileName989Cliente] = useState<string>("");
  const [fileName989CAJ, setFileName989CAJ] = useState<string>("");

  // Dados brutos
  const [dadosOP, setDadosOP] = useState<any[]>([]);
  const [dados989Cliente, setDados989Cliente] = useState<any[]>([]);
  const [dados989CAJ, setDados989CAJ] = useState<any[]>([]);

  // Tabela final processada
  const [resultados, setResultados] = useState<AnaliseProcessada[]>([]);
  
  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroFuncionario, setFiltroFuncionario] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("Todas");

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
        
        // range: 4 garante que todos os arquivos ignorem as 4 primeiras linhas
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
      // PROCV MÁGICO: Criamos "Dicionários" para buscar a situação instantaneamente
      const mapStatusCliente = new Map<string, string>();
      const mapStatusCAJ = new Map<string, string>();
      const matriculasPadronizadas = new Set<string>();

      // Função genérica para varrer os dois relatórios 989
      const registrar989 = (dados: any[], mapStatus: Map<string, string>) => {
        dados.forEach(row => {
          const mat = String(row["MATRICULA"] || row["Matrícula"] || row["Matricula"] || "").trim();
          const codigoRaw = String(row["CODIGO_SERVICO"] || row["Código"] || row["Codigo"] || row["Serviço Solicitado"] || "").trim();
          const situacao = String(row["SITUACAO_SERVICO"] || row["Situação"] || row["Situacao"] || "").trim();
          
          // Armazena a Situação para a coluna nova (Se a matrícula ainda não foi registrada)
          if (mat && !mapStatus.has(mat)) {
            mapStatus.set(mat, situacao || "—");
          }

          // Armazena na lista VIP de padronizadas (Lógica Antiga mantida)
          const codNumerico = codigoRaw.split("-")[0].trim().split(" ")[0]; 
          if (SITUACOES_VALIDAS_989.has(situacao) && CODIGOS_PADRONIZACAO.has(codNumerico)) {
            matriculasPadronizadas.add(mat);
          }
        });
      };

      // Processa as duas bases
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
        
        // Verifica na base de dados (PROCV)
        const padronizada = matriculasPadronizadas.has(matricula) ? "Sim" : "Não";
        const statusCliente = mapStatusCliente.get(matricula) || "—";
        const statusCAJ = mapStatusCAJ.get(matricula) || "—";

        processados.push({
          id: `${matricula}-${index}`,
          dataAbertura: dataAberturaLimpa,
          codigoServico,
          matricula,
          funcionario,
          diasTranscorridos,
          diasAtraso,
          situacao,
          padronizada,
          statusCliente, // <-- Adicionando à tabela
          statusCAJ      // <-- Adicionando à tabela
        });
      });

      processados.sort((a, b) => {
        if (a.situacao === "Vencida" && b.situacao !== "Vencida") return -1;
        if (b.situacao === "Vencida" && a.situacao !== "Vencida") return 1;
        return b.diasAtraso - a.diasAtraso;
      });

      setResultados(processados);
      setFileModal({ type: "success", message: `Processamento concluído! ${processados.length} análises verificadas.` });
      
    } catch (error) {
      console.error(error);
      setFileModal({ type: "error", message: "Erro ao processar os dados. Verifique o formato das colunas." });
    } finally {
      setLoading(false);
    }
  };

  const resultadosFiltrados = resultados.filter(r => {
    const matchGlobal = r.matricula.includes(searchTerm) || 
                        r.codigoServico.includes(searchTerm) || 
                        r.funcionario.toLowerCase().includes(searchTerm.toLowerCase());
    const codigosArray = filtroCodigo.split(",").map(c => c.trim()).filter(c => c !== "");
    const matchCodigo = codigosArray.length === 0 || codigosArray.includes(r.codigoServico);
    const matchFuncionario = filtroFuncionario === "" || r.funcionario.toLowerCase().includes(filtroFuncionario.toLowerCase());
    const matchSituacao = filtroSituacao === "Todas" || r.situacao === filtroSituacao;

    return matchGlobal && matchCodigo && matchFuncionario && matchSituacao;
  });

  return {
    loading, fileModal, setFileModal, 
    fileNameOP, fileName989Cliente, fileName989CAJ, // Retornando as novas variáveis
    dadosOP, dados989Cliente, dados989CAJ, 
    handleFileUpload, processarDados, 
    searchTerm, setSearchTerm, 
    filtroCodigo, setFiltroCodigo, 
    filtroFuncionario, setFiltroFuncionario, 
    filtroSituacao, setFiltroSituacao,
    resultadosFiltrados, resultados
  };
}