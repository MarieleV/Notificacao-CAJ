// front-end/src/hooks/useFiltroMatriculaLote.ts
// Filtro de Matrícula reutilizável (mesmo comportamento da tela Redigir Notificação):
// - puxa os casos filtrados da tela Controle de Análises;
// - permite trabalhar em lote por responsável, navegando caso a caso;
// - busca os dados do cliente na "Base de Dados do Cliente" carregada na tela de Notificação.
import { useEffect, useState } from "react";
import { useSessionStorage } from "./useSessionStorage";
import { kvGet } from "../utils/kvStorage";

const BASE_CLIENTE_KEY = "baseCliente";
const CONTROLE_ANALISES_KEY = "@ControleAnalises:state";

export type FiltroModalType = "success" | "warning" | "error";

export interface FiltroModalState {
  type: FiltroModalType;
  message: string;
}

export interface ClienteLocalizado {
  nomeCliente: string;
  logradouro: string;
  bairro: string;
  cep: string;
  localizacao: string;
  categoriaTarifa: string;
  numeroHidrometro: string;
}

const CLIENTE_VAZIO: ClienteLocalizado = {
  nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "",
};

interface CasoLote {
  uniqueId: string;
  "Matrícula": string;
  "Responsável": string;
  "Código": string;
  "Status": string;
}

/**
 * @param prefixo prefixo das chaves do sessionStorage (ex.: "calc", "defesa"),
 *                para que cada tela mantenha seu próprio filtro.
 */
export function useFiltroMatriculaLote(prefixo: string) {
  const [modal, setModal] = useState<FiltroModalState | null>(null);

  const [casos, setCasos] = useSessionStorage<CasoLote[]>(`${prefixo}_loteCasos`, []);
  const [origemCasos, setOrigemCasos] = useSessionStorage<string>(`${prefixo}_loteOrigem`, "");
  const [filtroResponsavel, setFiltroResponsavel] = useSessionStorage(`${prefixo}_filtroResponsavel`, "");
  const [matricula, setMatricula] = useSessionStorage(`${prefixo}_matricula`, "");
  const [clienteData, setClienteData] = useSessionStorage<ClienteLocalizado>(`${prefixo}_clienteData`, CLIENTE_VAZIO);

  // Base de clientes (somente leitura): é carregada na tela Redigir Notificação e persistida no IndexedDB.
  const [baseCliente, setBaseCliente] = useState<any[]>([]);
  const [baseHydrated, setBaseHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    kvGet<any[]>(BASE_CLIENTE_KEY)
      .then((saved) => {
        if (!cancelled && saved && saved.length > 0) setBaseCliente(saved);
      })
      .catch((e) => console.warn("Erro ao ler a base de clientes salva:", e))
      .finally(() => {
        if (!cancelled) setBaseHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Derivados ───────────────────────────────────────────────────────────
  const responsaveisList = Array.from(
    new Set(casos.map((row) => String(row["Responsável"] || "").trim()).filter(Boolean))
  ).sort();

  const casosResponsavel = filtroResponsavel
    ? casos.filter((row) => String(row["Responsável"] || "").trim() === filtroResponsavel)
    : [];

  const totalCasos = casosResponsavel.length;
  const currentCasoIndex = casosResponsavel.findIndex((row) => String(row["Matrícula"] || "") === matricula);

  // ── Ações ───────────────────────────────────────────────────────────────
  const importarDoControleAnalises = () => {
    try {
      const savedStr = localStorage.getItem(CONTROLE_ANALISES_KEY);
      if (!savedStr) {
        setModal({ type: "warning", message: "Nenhum dado salvo encontrado. Acesse a tela 'Controle de Análises' e processe as planilhas primeiro." });
        return;
      }

      const savedState = JSON.parse(savedStr);
      let casosParaImportar = savedState.resultadosFiltrados || savedState.filtrados || savedState.dadosFiltrados || [];
      if (casosParaImportar.length === 0) {
        casosParaImportar = savedState.resultados || savedState.dadosOriginais || [];
      }

      if (casosParaImportar.length === 0) {
        setModal({ type: "warning", message: "A tabela no 'Controle de Análises' está vazia ou todos os itens foram filtrados/removidos." });
        return;
      }

      const dataMapped: CasoLote[] = casosParaImportar.map((item: any, i: number) => ({
        uniqueId: `import-${Date.now()}-${i}`,
        "Matrícula": String(item.matricula || item.Matrícula || item.Matricula || ""),
        "Responsável": String(item.funcionario || item.responsavel || item.Funcionario || item.Responsavel || ""),
        "Código": String(item.codigoServico || item.codigo || item.Codigo || ""),
        "Status": String(item.situacao || item.status || item.Situacao || ""),
      }));

      setCasos(dataMapped);
      setOrigemCasos(`Importado: ${casosParaImportar.length} casos analisados`);
      setFiltroResponsavel("");
      setModal({ type: "success", message: `${casosParaImportar.length} casos puxados da tela de Controle de Análises com sucesso!` });
    } catch (error) {
      console.error("Erro ao importar do Controle:", error);
      setModal({ type: "error", message: "Erro ao tentar ler os dados. Tente processar novamente na tela de Controle de Análises." });
    }
  };

  const buscarMatricula = (mat: string) => {
    const matTrimmed = String(mat || "").trim();
    if (!matTrimmed) return;

    if (baseCliente.length === 0) {
      setClienteData(CLIENTE_VAZIO);
      setModal({
        type: "warning",
        message: baseHydrated
          ? "A 'Base de Dados do Cliente' ainda não foi carregada. Faça o upload dela na tela 'Redigir Notificação' para que a busca por matrícula funcione."
          : "Carregando a 'Base de Dados do Cliente'... aguarde um instante e clique em 'Buscar' novamente.",
      });
      return;
    }

    const encontrado = baseCliente.find((row) => row.matricula === matTrimmed);
    if (encontrado) {
      setClienteData({
        nomeCliente: encontrado.morador,
        logradouro: encontrado.endereco,
        bairro: encontrado.bairro,
        cep: encontrado.cep,
        localizacao: encontrado.localizacao,
        categoriaTarifa: encontrado.ativEconomica,
        numeroHidrometro: encontrado.numeroHidrometro,
      });
    } else {
      setClienteData(CLIENTE_VAZIO);
      setModal({
        type: "warning",
        message: `A matrícula "${matTrimmed}" não foi encontrada na "Base de Dados do Cliente". Verifique se o arquivo correto foi carregado na tela 'Redigir Notificação'.`,
      });
    }
  };

  const handleSearchMatricula = () => buscarMatricula(matricula);

  const alterarMatricula = (valor: string) => {
    setMatricula(valor);
    // Evita exibir dados de um cliente que não corresponde mais à matrícula digitada.
    if (clienteData.nomeCliente) setClienteData(CLIENTE_VAZIO);
  };

  const irParaMatricula = (mat: string) => {
    setMatricula(mat);
    if (baseCliente.length > 0) buscarMatricula(mat);
    else setClienteData(CLIENTE_VAZIO);
  };

  const handleSelectResponsavel = (resp: string) => {
    setFiltroResponsavel(resp);
    if (!resp) return;
    const primeiro = casos.find((row) => String(row["Responsável"] || "").trim() === resp);
    if (primeiro) irParaMatricula(String(primeiro["Matrícula"] || ""));
  };

  const navegarCaso = (direction: "next" | "prev") => {
    if (totalCasos === 0) return;
    let newIndex: number;
    if (direction === "next") {
      newIndex = currentCasoIndex >= 0 && currentCasoIndex < totalCasos - 1 ? currentCasoIndex + 1 : 0;
    } else {
      newIndex = currentCasoIndex > 0 ? currentCasoIndex - 1 : totalCasos - 1;
    }
    irParaMatricula(String(casosResponsavel[newIndex]["Matrícula"] || ""));
  };

  /** Limpa matrícula/responsável/cliente, mantendo os casos importados (igual à tela de Notificação). */
  const limparFiltro = () => {
    setMatricula("");
    setFiltroResponsavel("");
    setClienteData(CLIENTE_VAZIO);
  };

  return {
    modal, setModal,
    casos, origemCasos, importarDoControleAnalises,
    baseCliente, baseHydrated,
    filtroResponsavel, responsaveisList, handleSelectResponsavel,
    casosResponsavel, totalCasos, currentCasoIndex, navegarCaso,
    matricula, setMatricula: alterarMatricula, handleSearchMatricula,
    clienteData,
    limparFiltro,
  };
}

export type FiltroMatriculaLote = ReturnType<typeof useFiltroMatriculaLote>;
