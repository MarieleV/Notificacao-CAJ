import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import {
  AUTH_LOGOUT_EVENT,
  clearSession,
  getStoredUser,
  getToken,
  getTokenExpiration,
  loginApi,
  Usuario,
} from "../services/auth";
import { kvClear } from "../utils/kvStorage";
import { CONTROLE_ANALISES_KEY } from "../utils/controleAnalises";

/** Apaga o Controle de Análises, a base de clientes e os formulários e lotes das telas. */
async function apagarDadosDeTrabalho(): Promise<void> {
  try {
    localStorage.removeItem(CONTROLE_ANALISES_KEY);
  } catch { /* ignora */ }
  try {
    sessionStorage.clear();
  } catch { /* ignora */ }
  try {
    await kvClear();
  } catch (error) {
    console.warn("Não foi possível apagar a base de clientes do navegador:", error);
  }
}

interface AuthContextValue {
  user: Usuario | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => getStoredUser());

  // Sessão encerrada em qualquer lugar (401 da API, logout, outra aba).
  useEffect(() => {
    const onLogout = () => setUser(null);
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Desloga automaticamente quando o token expirar.
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    const exp = token ? getTokenExpiration(token) : null;
    if (!exp) {
      clearSession();
      return;
    }
    const timer = window.setTimeout(clearSession, Math.min(Math.max(exp - Date.now(), 0), 2 ** 31 - 1));
    return () => window.clearTimeout(timer);
  }, [user]);

  const login = useCallback(async (usuario: string, senha: string) => {
    const result = await loginApi(usuario, senha);
    setUser(result.usuario);
  }, []);

  // "Sair" apaga também os dados de trabalho guardados no navegador, que têm dados
  // pessoais (PA-12), e recarrega a página para zerar o que ficou na memória.
  // A expiração automática do token (8h) não apaga nada: só pede login de novo.
  const logout = useCallback(async () => {
    await apagarDadosDeTrabalho();
    clearSession();
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin: user?.perfil === "admin", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
}
