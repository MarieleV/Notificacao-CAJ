// Regras de filtro e ordenação do Controle de Análises, compartilhadas entre a tela
// e as importações de casos (Redator, Retorno de Defesa e Tabela de Multas).
// A lista filtrada não é gravada no localStorage: ela é recalculada a partir de
// `resultados` e dos filtros salvos (PA-12).

import { parseFullDate } from "./dates";
import { estaExpirado } from "./dadosLocais";

export const CONTROLE_ANALISES_KEY = "@ControleAnalises:state";

export interface AnaliseProcessada {
  id: string;
  dataAbertura: string;
  codigoServico: string;
  matricula: string;
  funcionario: string;
  diasTranscorridos: number;
  diasAtraso: number;
  /** "Data inválida": a data de abertura não pôde ser lida (DD/MM/AAAA); o prazo não foi calculado (PA-05). */
  situacao: "No Prazo" | "Vencida" | "Data inválida";
  statusCliente: string;
  statusCAJ: string;
  isPadronizado: boolean;
  situacaoOS: string;
}

export interface FiltrosControle {
  searchTerm: string;
  filtroCodigo: string;
  filtroFuncionario: string;
  filtroSituacao: string;
  filtroStatusCliente: string;
  filtroPadronizadoAtivo: boolean;
  filtroSituacaoOS: string[];
}

export interface SortConfig {
  key: keyof AnaliseProcessada | null;
  direction: "asc" | "desc";
}

export function filtrarAnalises(resultados: AnaliseProcessada[], f: FiltrosControle): AnaliseProcessada[] {
  return resultados.filter((r) => {
    const matchGlobal = r.matricula.includes(f.searchTerm) ||
                        r.codigoServico.includes(f.searchTerm) ||
                        r.funcionario.toLowerCase().includes(f.searchTerm.toLowerCase());

    const matchCodigo = f.filtroCodigo === "Todos" || r.codigoServico === f.filtroCodigo;
    const matchFuncionario = f.filtroFuncionario === "" || r.funcionario.toLowerCase().includes(f.filtroFuncionario.toLowerCase());
    const matchSituacao = f.filtroSituacao === "Todas" || r.situacao === f.filtroSituacao;
    const matchStatusCliente = f.filtroStatusCliente === "Todos" || r.statusCliente.toLowerCase() === f.filtroStatusCliente.toLowerCase();

    // Com o botão "Padronizado" ativo, exige que r.isPadronizado seja true
    const matchPadronizado = !f.filtroPadronizadoAtivo || r.isPadronizado;

    const matchSituacaoOS = f.filtroSituacaoOS.length === 0 || f.filtroSituacaoOS.some((opt) => r.situacaoOS.toLowerCase().includes(opt.toLowerCase()));

    return matchGlobal && matchCodigo && matchFuncionario && matchSituacao && matchStatusCliente && matchPadronizado && matchSituacaoOS;
  });
}

export function ordenarAnalises(lista: AnaliseProcessada[], sortConfig: SortConfig): AnaliseProcessada[] {
  return [...lista].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue: any = a[sortConfig.key];
    let bValue: any = b[sortConfig.key];

    if (sortConfig.key === "dataAbertura") {
      aValue = parseFullDate(String(aValue))?.getTime() ?? NaN;
      bValue = parseFullDate(String(bValue))?.getTime() ?? NaN;
      // Datas ilegíveis vão para o fim da lista, em qualquer direção (PA-05).
      const aInvalida = Number.isNaN(aValue);
      const bInvalida = Number.isNaN(bValue);
      if (aInvalida || bInvalida) return aInvalida === bInvalida ? 0 : aInvalida ? 1 : -1;
    } else if (sortConfig.key === "codigoServico" || sortConfig.key === "matricula" || sortConfig.key === "diasTranscorridos" || sortConfig.key === "diasAtraso") {
      aValue = Number(String(aValue).replace(/\D/g, ""));
      bValue = Number(String(bValue).replace(/\D/g, ""));
    } else if (sortConfig.key === "isPadronizado") {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
}

/** Valores padrão dos filtros: os mesmos que a tela usa quando nada foi salvo. */
export function filtrosDoEstadoSalvo(saved: any): FiltrosControle {
  return {
    searchTerm: saved?.searchTerm || "",
    filtroCodigo: saved?.filtroCodigo || "Todos",
    filtroFuncionario: saved?.filtroFuncionario || "",
    filtroSituacao: saved?.filtroSituacao || "Todas",
    filtroStatusCliente: saved?.filtroStatusCliente || "Todos",
    filtroPadronizadoAtivo: saved?.filtroPadronizadoAtivo || false,
    filtroSituacaoOS: saved?.filtroSituacaoOS || [],
  };
}

export function sortConfigDoEstadoSalvo(saved: any): SortConfig {
  return saved?.sortConfig || { key: null, direction: "asc" };
}

/**
 * Lê o estado salvo pelo Controle de Análises. Devolve `null` se não houver nada salvo,
 * se o conteúdo estiver corrompido ou se tiver mais de 7 dias sem atualização; nos dois
 * últimos casos, apaga o que estava salvo (PA-12).
 */
export function lerEstadoSalvoControle(): any | null {
  try {
    const savedStr = localStorage.getItem(CONTROLE_ANALISES_KEY);
    if (!savedStr) return null;
    const saved = JSON.parse(savedStr);
    if (estaExpirado(saved?.salvoEm)) {
      localStorage.removeItem(CONTROLE_ANALISES_KEY);
      return null;
    }
    return saved;
  } catch (error) {
    console.warn("Estado salvo do Controle de Análises ilegível; descartado.", error);
    try { localStorage.removeItem(CONTROLE_ANALISES_KEY); } catch { /* ignora */ }
    return null;
  }
}

/** Caso de um lote de trabalho por responsável (Redator, Retorno de Defesa e Tabela de Multas). */
export interface CasoLote {
  uniqueId: string;
  "Matrícula": string;
  "Responsável": string;
  "Código": string;
  "Status": string;
}

export type ResultadoImportacao =
  | { ok: true; casos: CasoLote[]; origem: string; mensagem: string }
  | { ok: false; tipo: "warning" | "error"; mensagem: string };

/**
 * Importa os casos do Controle de Análises como lote de trabalho (PA-13).
 * Usado pelo Redator e pelo filtro de matrícula (Retorno de Defesa e Tabela de Multas),
 * que antes repetiam esta conversão.
 */
export function importarCasosDoControleAnalises(): ResultadoImportacao {
  try {
    const analises = lerCasosDoControleAnalises();
    if (!analises) {
      return { ok: false, tipo: "warning", mensagem: "Nenhum dado salvo encontrado. Acesse a tela 'Controle de Análises' e processe as planilhas primeiro." };
    }
    if (analises.length === 0) {
      return { ok: false, tipo: "warning", mensagem: "A tabela no 'Controle de Análises' está vazia ou todos os itens foram filtrados/removidos." };
    }

    const agora = Date.now();
    const casos: CasoLote[] = analises.map((a, i) => ({
      uniqueId: `import-${agora}-${i}`,
      "Matrícula": String(a.matricula ?? ""),
      "Responsável": String(a.funcionario ?? ""),
      "Código": String(a.codigoServico ?? ""),
      "Status": String(a.situacao ?? ""),
    }));

    return {
      ok: true,
      casos,
      origem: `Importado: ${casos.length} casos analisados`,
      mensagem: `${casos.length} casos puxados da tela de Controle de Análises com sucesso!`,
    };
  } catch (error) {
    console.error("Erro ao importar do Controle:", error);
    return { ok: false, tipo: "error", mensagem: "Erro ao tentar ler os dados. Tente processar novamente na tela de Controle de Análises." };
  }
}

/**
 * Lê o estado salvo pelo Controle de Análises e devolve os casos a importar:
 * a lista filtrada e ordenada como está na tela; se ela estiver vazia, todos os resultados.
 * Devolve `null` quando não há nada salvo.
 */
export function lerCasosDoControleAnalises(): AnaliseProcessada[] | null {
  const saved = lerEstadoSalvoControle();
  if (!saved) return null;

  const resultados: AnaliseProcessada[] = saved.resultados || [];
  const filtrados = ordenarAnalises(filtrarAnalises(resultados, filtrosDoEstadoSalvo(saved)), sortConfigDoEstadoSalvo(saved));

  return filtrados.length > 0 ? filtrados : resultados;
}
