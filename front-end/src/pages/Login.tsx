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
    <div className="min-h-screen grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-white">
      {/* Painel institucional */}
      <aside className="hidden md:flex flex-col justify-between bg-navy text-white px-12 py-10 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-brand flex items-center justify-center overflow-hidden">
            <img src="/logo.resolucao.boa.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">CAJ</p>
            <p className="text-[11px] text-navy-muted leading-tight">Sistema</p>
          </div>
        </div>

        <div className="max-w-sm">
          <h2 className="text-white text-2xl font-semibold leading-snug">
            Gestão de notificações judiciais e multas de consumo de água
          </h2>
          <p className="text-navy-text text-sm mt-3 leading-relaxed">
            Redação de notificações, retorno de defesas, controle de prazos e cálculo de multas em um só lugar.
          </p>
        </div>

        <p className="text-navy-muted text-xs">Acesso restrito a usuários autorizados.</p>
      </aside>

      {/* Formulário */}
      <main className="flex items-center justify-center bg-canvas md:bg-white px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-md bg-brand flex items-center justify-center overflow-hidden mb-4">
              <img src="/logo.resolucao.boa.png" alt="Logo CAJ" className="w-full h-full object-cover" />
            </div>
            <p className="text-ink-muted text-xs leading-relaxed">
              Gestão de Notificações Judiciais e Multas de Consumo de Água
            </p>
          </div>

          <h1 className="text-ink text-2xl font-semibold">Entrar no sistema</h1>
          <p className="text-ink-muted text-sm mt-1">Use o usuário e a senha cadastrados pelo administrador.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
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

          <p className="text-xs text-ink-muted mt-8 pt-6 border-t border-gray-200">
            Esqueceu a senha? Procure um administrador do sistema.
          </p>
        </div>
      </main>
    </div>
  );
}
