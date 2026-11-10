export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || "https://notificacao-caj.vercel.app/api";

const TOKEN_KEY = "caj_auth_token";
const USER_KEY = "caj_auth_user";

/** Evento disparado quando a sessão é encerrada (logout ou token inválido/expirado). */
export const AUTH_LOGOUT_EVENT = "caj:auth-logout";

export interface Usuario {
  usuario: string;
  nome: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  const token = safeGet(TOKEN_KEY);
  if (!token || isTokenExpired(token)) return null;
  return token;
}

export function getStoredUser(): Usuario | null {
  if (!getToken()) return null;
  try {
    const raw = safeGet(USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

function saveSession({ token, usuario }: LoginResponse) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  } catch {
    /* armazenamento indisponível: a sessão dura só enquanto a página estiver aberta */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

/** Lê o "exp" do JWT (sem validar a assinatura — isso é papel do backend). */
export function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json);
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  return exp === null || Date.now() >= exp;
}

export async function loginApi(usuario: string, senha: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Falha ao realizar login.");
  }

  saveSession(data as LoginResponse);
  return data as LoginResponse;
}
