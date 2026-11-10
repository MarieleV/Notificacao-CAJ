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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1e35] px-4">
      <div className="w-full max-w-sm">
        {/* Cabeçalho */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-[#1a5fa8] flex items-center justify-center overflow-hidden mb-4 shadow-lg shadow-[#1a5fa8]/30">
            <img src="/logo.resolucao.boa.png" alt="Logo CAJ" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white text-xl font-semibold">Sistema CAJ</h1>
          <p className="text-[#6a9fc0] text-xs mt-1 text-center">
            Gestão de Notificações Judiciais e Multas de Consumo de Água
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#071527] border border-[#1a3a5c] rounded-2xl p-6 shadow-2xl space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="usuario" className="block text-xs font-medium text-[#6a9fc0] mb-1.5">
              Usuário
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7fa5]" />
              <input
                id="usuario"
                type="text"
                autoComplete="username"
                autoFocus
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full bg-[#0b1e35] border border-[#1a3a5c] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-[#3d6585] focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/30 transition"
                placeholder="Seu usuário"
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="block text-xs font-medium text-[#6a9fc0] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7fa5]" />
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-[#0b1e35] border border-[#1a3a5c] rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder:text-[#3d6585] focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/30 transition"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7fa5] hover:text-[#7ec8e3]"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && (
            <p role="alert" className="text-xs text-red-300 bg-red-900/30 border border-red-800/50 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-semibold transition shadow-md"
          >
            {carregando ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#3d6585] mt-6">Dep. Atendimento · Acesso restrito</p>
      </div>
    </div>
  );
}
