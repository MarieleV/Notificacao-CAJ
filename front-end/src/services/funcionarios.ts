import { apiFetch, throwApiError } from "./http";

/** Funcionário das buscas do Redator e da Ouvidoria. A lista vem da API, só para usuários logados (PA-14). */
export interface Funcionario {
  matricula: number;
  nome: string;
}

// Cache da página: a lista é buscada uma vez e reaproveitada pelas telas.
let cache: Promise<Funcionario[]> | null = null;

export function listarFuncionarios(): Promise<Funcionario[]> {
  if (!cache) {
    cache = (async () => {
      const response = await apiFetch("/funcionarios");
      if (!response.ok) await throwApiError(response, "Não foi possível carregar a lista de funcionários.");
      const data = await response.json();
      return (data.funcionarios || []) as Funcionario[];
    })();
    // Em caso de falha, permite tentar de novo na próxima vez.
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}
