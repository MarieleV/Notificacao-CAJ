import { useState } from "react";
import { Outlet, NavLink } from "react-router";
import { 
  MessageSquareReply, 
  FileText, 
  Calculator, 
  Scale, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  Clock, // <-- Ícone novo importado para a nova tela
  LogOut,
  Users,
  KeyRound,
  Sparkles
} from "lucide-react";
import { ElementType } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AlterarSenhaModal } from "./AlterarSenhaModal";
import { ChaveGeminiModal } from "./ChaveGeminiModal";

// Subcomponente para evitar repetição de código (DRY)
interface NavItemProps {
  to: string;
  icon: ElementType;
  title: string;
  subtitle: string;
  end?: boolean;
  isCollapsed: boolean;
}

function NavItem({ to, icon: Icon, title, subtitle, end = false, isCollapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={isCollapsed ? title : undefined} // Mostra o nome ao passar o mouse se estiver minimizado
      className={({ isActive }) =>
        `relative flex items-center gap-3 h-11 rounded-md text-sm transition-colors group overflow-hidden ${
          isCollapsed ? "px-0 justify-center" : "px-3"
        } ${
          isActive
            ? "bg-navy-raised text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-navy-accent"
            : "text-navy-text hover:bg-white/5 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            size={18} 
            className={`flex-shrink-0 transition-colors ${isActive ? "text-navy-accent" : "text-navy-muted group-hover:text-navy-accent"}`} 
          />
          
          {/* O texto some suavemente quando isCollapsed for true */}
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 whitespace-nowrap animate-fadeIn">
                <p className="font-medium leading-tight">{title}</p>
                <p className={`text-[11px] leading-tight mt-0.5 truncate ${isActive ? "text-navy-text" : "text-navy-muted"}`}>{subtitle}</p>
              </div>
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const [senhaModalAberto, setSenhaModalAberto] = useState(false);
  const [geminiModalAberto, setGeminiModalAberto] = useState(false);

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      
      {/* Sidebar - A largura muda entre w-20 e w-64 suavemente */}
      <aside 
        className={`relative flex-shrink-0 bg-navy border-r border-navy-line flex flex-col transition-all duration-300 z-20 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        
        {/* Botão de Toggle Flutuante */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3.5 top-8 bg-brand text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-navy hover:bg-brand-hover transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo / Header */}
        <div className={`p-6 border-b border-navy-line flex flex-col ${isCollapsed ? "items-center px-2" : ""}`}>
          <div className={`flex items-center gap-3 mb-1 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-md bg-brand flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="/logo.resolucao.boa.png" 
                alt="Logo CAJ" 
                className="w-full h-full object-cover" 
              />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap animate-fadeIn">
                <p className="text-white font-semibold text-sm leading-tight">CAJ</p>
                <p className="text-[11px] text-navy-muted font-medium leading-tight">Sistema</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-navy-muted text-[11px] mt-3 leading-snug animate-fadeIn">
              Gestão de Notificações Extrajudiciais e Multas de Consumo de Água
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-1 overflow-hidden ${isCollapsed ? "px-3" : "px-4"}`}>
          {!isCollapsed ? (
            <p className="text-navy-muted text-xs font-medium px-3 mb-2 animate-fadeIn whitespace-nowrap">
              Módulos
            </p>
          ) : (
            <div className="h-4 border-b border-navy-line/50 mb-3 mx-2"></div>
          )}

          <NavItem 
            to="/" 
            end 
            icon={FileText} 
            title="Redigir Notificação" 
            subtitle="Assistente de IA" 
            isCollapsed={isCollapsed}
          />
          
          <NavItem 
            to="/resposta-defesa" 
            icon={MessageSquareReply} 
            title="Retorno de Defesa" 
            subtitle="Pareceres de Resposta" 
            isCollapsed={isCollapsed}
          />
          
          <NavItem 
            to="/multas" 
            icon={Calculator} 
            title="Tabela de Multas" 
            subtitle="Cálculo e Referência" 
            isCollapsed={isCollapsed}
          />

          <NavItem 
            to="/controle-analises" 
            icon={Clock} 
            title="Análises Vencidas" 
            subtitle="Controle de Prazos" 
            isCollapsed={isCollapsed}
          />
          
          <NavItem 
            to="/ouvidoria" 
            icon={Scale} 
            title="Ouvidoria e Recursos" 
            subtitle="Análise de Processos"
            isCollapsed={isCollapsed}
          />

          {isAdmin && (
            <>
              {!isCollapsed ? (
                <p className="text-navy-muted text-xs font-medium px-3 pt-5 mb-2 animate-fadeIn whitespace-nowrap">
                  Administração
                </p>
              ) : (
                <div className="h-4 border-b border-navy-line/50 mb-3 mx-2"></div>
              )}
              <NavItem
                to="/usuarios"
                icon={Users}
                title="Usuários"
                subtitle="Cadastro e Acessos"
                isCollapsed={isCollapsed}
              />
            </>
          )}

        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-navy-line flex gap-2 ${isCollapsed ? "flex-col items-center px-2" : "items-center"}`}>
          <div className={`flex items-center gap-3 overflow-hidden flex-1 min-w-0 ${!isCollapsed ? "px-2" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-navy-line flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-navy-muted" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap animate-fadeIn min-w-0">
                <p className="text-white text-xs font-medium leading-none truncate">{user?.nome ?? "Dep. Atendimento"}</p>
                <p className="text-navy-muted text-[11px] mt-0.5">{isAdmin ? "Administrador" : "Dep. Atendimento"}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setGeminiModalAberto(true)}
            title="Minha chave do Gemini"
            aria-label="Minha chave do Gemini"
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-navy-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={() => setSenhaModalAberto(true)}
            title="Alterar minha senha"
            aria-label="Alterar minha senha"
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-navy-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <KeyRound size={16} />
          </button>
          <button
            onClick={logout}
            title="Sair"
            aria-label="Sair"
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-navy-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-canvas relative z-10">
        <Outlet />
      </main>

      <AlterarSenhaModal open={senhaModalAberto} onClose={() => setSenhaModalAberto(false)} />
      <ChaveGeminiModal open={geminiModalAberto} onClose={() => setGeminiModalAberto(false)} />
    </div>
  );
}