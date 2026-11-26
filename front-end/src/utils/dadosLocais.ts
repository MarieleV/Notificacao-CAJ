// Regras dos dados de trabalho guardados no navegador (PA-12).
//
// - Validade: o estado do Controle de Análises (localStorage) e a base de clientes
//   (IndexedDB) têm dados pessoais. São descartados quando ficam mais de 7 dias sem
//   ser atualizados, e apagados quando o usuário clica em "Sair" (AuthContext).
// - Falha ao salvar: quando o navegador recusa a gravação (em geral, espaço cheio),
//   o aviso aparece na tela (Layout), e não só no console.

/** Tempo máximo, sem atualização, que os dados de trabalho ficam guardados no navegador. */
export const VALIDADE_DADOS_LOCAIS_MS = 7 * 24 * 60 * 60 * 1000;

/** Verdadeiro se o registro não tem data de gravação ou passou da validade. */
export function estaExpirado(salvoEm: unknown, agora: number = Date.now()): boolean {
  return typeof salvoEm !== "number" || agora - salvoEm > VALIDADE_DADOS_LOCAIS_MS;
}

/** Evento disparado quando o navegador não consegue gravar dados de trabalho. */
export const FALHA_AO_SALVAR_EVENT = "caj:falha-ao-salvar";

/**
 * Registra no console e avisa a tela de que a gravação falhou.
 * `onde` descreve o que não foi salvo (ex.: "o Controle de Análises").
 */
export function avisarFalhaAoSalvar(onde: string, error: unknown): void {
  console.warn(`Não foi possível salvar ${onde} no navegador:`, error);
  try {
    window.dispatchEvent(new CustomEvent<string>(FALHA_AO_SALVAR_EVENT, { detail: onde }));
  } catch {
    /* ambiente sem window (testes): só o console */
  }
}
