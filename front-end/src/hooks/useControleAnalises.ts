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
  const [fileName989, setFileName989] = useState<string>("");

  // Dados brutos
  const [dadosOP, setDadosOP] = useState<any[]>([]);
  const [dados989, setDados989] = useState<any[]>([]);

  // Tabela final processada
  const [resultados, setResultados] = useState<AnaliseProcessada[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: "OP" | "989") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    if (tipo === "OP") setFileNameOP(file.name);
    else setFileName989(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // raw: false força datas a virem formatadas como string (útil para extrair DD/MM/YYYY)
        // range: 4 faz a leitura ignorar as 4 primeiras linhas (cabeçalho sujo) e usar a linha 5 como título das colunas
        const data = XLSX.utils.sheet_to_json(ws, { defval: "", raw: false, range: 4 });

        if (tipo === "OP") setDadosOP(data);
        else setDados989(data);

      } catch (error) {
        console.error("Erro ao ler planilha:", error);
        setFileModal({ type: "error", message: "Erro ao ler o arquivo selecionado." });
      } finally {
        setLoading(false);
        e.target.value = ""; // Reseta o input
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
      // 1. Mapear as matrículas padronizadas baseadas no Relatório 989
      const matriculasPadronizadas = new Set<string>();
      
      dados989.forEach(row => {
        const mat = String(row["Matrícula"] || row["Matricula"] || "").trim();
        const codigoRaw = String(row["Código"] || row["Codigo"] || row["Serviço Solicitado"] || "").trim();
        const situacao = String(row["Situação"] || row["Situacao"] || "").trim();

        // ETL 989: Extrai apenas os números do código caso venha algo como "14201 - Instalação..."
        const codNumerico = codigoRaw.split("-")[0].trim().split(" ")[0]; 

        if (SITUACOES_VALIDAS_989.has(situacao) && CODIGOS_PADRONIZACAO.has(codNumerico)) {
          matriculasPadronizadas.add(mat);
        }
      });

      // Pega a data de hoje no formato DD/MM/AAAA para o cálculo
      const hojeStr = new Date().toLocaleDateString("pt-BR");

      // 2. Processar OP00002 e fazer os cálculos
      const processados: AnaliseProcessada[] = [];

      dadosOP.forEach((row, index) => {
        // --- PROCESSO DE ETL (EXTRAÇÃO E LIMPEZA) ---
        
        // A. Puxar os dados brutos lidando com as variações de nomes dos cabeçalhos
        const dataAberturaRaw = String(row["Data de Solicitação"] || row["Data de Abertura"] || row["Data"] || ""); 
        const servicoRaw = String(row["Serviço Solicitado"] || row["Código"] || row["Serviço"] || "").trim();
        const matricula = String(row["Matrícula"] || row["Matricula"] || "").trim();
        const funcionarioRaw = String(row["Funcionário / Equipe"] || row["Usuário Solicitante"] || row["Nome do Proprietário"] || "").trim();

        // B. Transformação 1: Limpar a data. De "01/07/2025 09:30:39" para "01/07/2025"
        const dataAberturaLimpa = dataAberturaRaw.split(" ")[0];

        // C. Transformação 2: Limpar o serviço. De "426 - CFC - Análise..." para "426"
        const codigoServico = servicoRaw.split("-")[0].trim().split(" ")[0];

        // D. Transformação 3: Limpar nome do funcionário (remover "1-" caso venha "1-Administrador")
        const funcionario = funcionarioRaw.replace(/^\d+-/, "").trim();

        // ---------------------------------------------

        // Se o código numérico limpo não for um dos monitorados, ignora e vai para o próximo
        const prazoEsperado = PRAZOS_SERVICO[codigoServico];
        if (!prazoEsperado) return; 

        // Regra de Negócio: Cálculo de atraso com dias úteis
        const diasTranscorridos = getBusinessDaysDifference(dataAberturaLimpa, hojeStr);
        const diasAtraso = diasTranscorridos > prazoEsperado ? diasTranscorridos - prazoEsperado : 0;
        const situacao = diasAtraso > 0 ? "Vencida" : "No Prazo";
        
        // Verifica se a matrícula bateu com o relatório 989
        const padronizada = matriculasPadronizadas.has(matricula) ? "Sim" : "Não";

        processados.push({
          id: `${matricula}-${index}`,
          dataAbertura: dataAberturaLimpa,
          codigoServico,
          matricula,
          funcionario,
          diasTranscorridos,
          diasAtraso,
          situacao,
          padronizada
        });
      });

      // Ordenar: Vencidos primeiro, depois por atraso (maior pro menor)
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

  const resultadosFiltrados = resultados.filter(r => 
    r.matricula.includes(searchTerm) || 
    r.codigoServico.includes(searchTerm) || 
    r.funcionario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    loading, fileModal, setFileModal, 
    fileNameOP, fileName989, 
    dadosOP, dados989, 
    handleFileUpload, processarDados, 
    searchTerm, setSearchTerm, resultadosFiltrados, resultados
  };
}