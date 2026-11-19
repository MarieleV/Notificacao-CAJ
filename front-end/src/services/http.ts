import { API_BASE_URL, clearSession, getToken } from "./auth";

/**
 * fetch autenticado: prefixa a URL da API, envia o token JWT no header
 * Authorization e encerra a sessão automaticamente se o backend responder 401.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    clearSession();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  return response;
}

/**
 * Lança um Error com a mensagem enviada pela API no campo `detail`.
 * Se a resposta não trouxer `detail` (ou não for JSON), usa a mensagem padrão.
 */
export async function throwApiError(response: Response, fallback: string): Promise<never> {
  let detail: unknown;
  try {
    detail = (await response.json())?.detail;
  } catch {
    // resposta sem corpo JSON: mantém a mensagem padrão
  }
  throw new Error(typeof detail === "string" && detail.trim() ? detail : fallback);
}
