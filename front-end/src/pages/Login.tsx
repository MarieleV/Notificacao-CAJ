import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, Lock, LogIn, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: string } | null)?.from || "/";

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (isAuthenticated) return <Navigate to={destino} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!usuario.trim() || !senha) {
      setErro("Informe usuário e senha.");
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      await login(usuario.trim(), senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao realizar login.");
    } finally {
      setCarregando(false);
    }
  }

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all";
  const labelClass = "block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-xl bg-[#1a5fa8] flex items-center justify-center overflow-hidden mb-4 shadow-lg shadow-[#1a5fa8]/30">
              <img src="/logo.resolucao.boa.png" alt="Logo CAJ" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-[#0b1e35] font-semibold text-lg">Acesso ao Sistema CAJ</h1>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Gestão de Notificações Judiciais e Multas de Consumo de Água
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5" noValidate>
            <div>
              <label htmlFor="usuario" className={labelClass}>
                Usuário
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="usuario"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={inputClass}
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className={labelClass}>
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`${inputClass} pr-11`}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-[#1a5fa8] transition-colors"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
            >
              {carregando ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6">
          Acesso restrito a usuários autorizados
        </p>
        <p className="text-center text-[11px] text-gray-400 mt-1">
          Esqueceu a senha? Procure um administrador do sistema.
        </p>
      </div>
    </div>
  );
}
