import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Alert, Button, inputClass, labelClass } from "../components/shared/ui";

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

  const fieldClass = `${inputClass.replace("h-10", "h-11")} pl-10`;

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-[14px] shadow-sm overflow-hidden">
          {/* Cabeçalho */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-md bg-brand flex items-center justify-center overflow-hidden mb-4">
              <img src="/logo.resolucao.boa.png" alt="Logo CAJ" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-ink text-xl font-semibold">Acesso ao Sistema CAJ</h1>
            <p className="text-ink-muted text-xs mt-1 leading-relaxed">
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
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="usuario"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={fieldClass}
                  placeholder="ex.: maria.silva"
                  aria-invalid={!!erro && !usuario.trim()}
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className={labelClass}>
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={`${fieldClass} pr-11`}
                  placeholder="Sua senha"
                  aria-invalid={!!erro && !senha}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-brand hover:bg-gray-100 transition-colors"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && <Alert tone="danger">{erro}</Alert>}

            <Button type="submit" size="lg" loading={carregando} icon={LogIn} className="w-full">
              {carregando ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          Acesso restrito a usuários autorizados.
        </p>
        <p className="text-center text-xs text-ink-muted mt-1">
          Esqueceu a senha? Procure um administrador do sistema.
        </p>
      </div>
    </main>
  );
}
