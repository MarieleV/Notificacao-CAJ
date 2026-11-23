import { apiFetch } from "./http";
import type { Perfil } from "./auth";

export interface UsuarioCadastro {
  id: number;
  usuario: string;
  nome: string;
  perfil: Perfil;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface NovoUsuarioPayload {
  usuario: string;
  nome: string;
  senha: string;
  perfil: Perfil;
}

export interface AtualizarUsuarioPayload {
  nome?: string;
  perfil?: Perfil;
  ativo?: boolean;
}

/** Faz a requisição e transforma respostas de erro em Error com a mensagem do backend. */
async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await apiFetch(path, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err instanceof TypeError) throw new Error("Não foi possível conectar ao servidor.");
    throw err;
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Erro ao comunicar com o servidor.");
  return data as T;
}

export async function listarUsuarios(): Promise<UsuarioCadastro[]> {
  const data = await request<{ usuarios: UsuarioCadastro[] }>("/usuarios", "GET");
  return data.usuarios;
}

export async function criarUsuario(payload: NovoUsuarioPayload): Promise<UsuarioCadastro> {
  const data = await request<{ usuario: UsuarioCadastro }>("/usuarios", "POST", payload);
  return data.usuario;
}

export async function atualizarUsuario(id: number, payload: AtualizarUsuarioPayload): Promise<UsuarioCadastro> {
  const data = await request<{ usuario: UsuarioCadastro }>(`/usuarios/${id}`, "PUT", payload);
  return data.usuario;
}

export async function redefinirSenhaUsuario(id: number, senha: string): Promise<void> {
  await request(`/usuarios/${id}/senha`, "PUT", { senha });
}

export async function excluirUsuario(id: number): Promise<void> {
  await request(`/usuarios/${id}`, "DELETE");
}

export async function trocarMinhaSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  await request("/auth/senha", "PUT", { senhaAtual, novaSenha });
}

// ── Chave do Gemini do usuário logado ─────────────────────────────────────────
// A chave fica cifrada no banco. A API nunca a devolve: só informa se existe e os 4 últimos caracteres.

export interface StatusChaveGemini {
  configurada: boolean;
  final: string | null;
  /** true quando há uma chave salva que o servidor não consegue mais ler (cadastre de novo). */
  ilegivel?: boolean;
}

/** Evento disparado quando a chave do usuário é salva ou removida, para as telas atualizarem o aviso. */
export const GEMINI_CHAVE_EVENT = "caj:gemini-chave-alterada";

export async function obterStatusChaveGemini(): Promise<StatusChaveGemini> {
  return request<StatusChaveGemini>("/auth/gemini", "GET");
}

export async function salvarChaveGemini(chave: string): Promise<StatusChaveGemini> {
  const status = await request<StatusChaveGemini>("/auth/gemini", "PUT", { chave });
  window.dispatchEvent(new Event(GEMINI_CHAVE_EVENT));
  return status;
}

export async function removerChaveGemini(): Promise<void> {
  await request("/auth/gemini", "DELETE");
  window.dispatchEvent(new Event(GEMINI_CHAVE_EVENT));
}
