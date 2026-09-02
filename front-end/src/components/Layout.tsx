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
  Clock // <-- Ícone novo importado para a nova tela
} from "lucide-react";
import { ElementType } from "react";

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
        `flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-300 group overflow-hidden ${
          isCollapsed ? "px-0 justify-center" : "px-3"
        } ${
          isActive
            ? "bg-[#1a5fa8] text-white shadow-lg shadow-[#1a5fa8]/20"
            : "text-[#6a9fc0] hover:bg-[#0f2a45] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            size={18} 
            className={`flex-shrink-0 transition-colors ${isActive ? "text-[#7ec8e3]" : "text-[#4a7fa5] group-hover:text-[#7ec8e3]"}`} 
          />
          
          {/* O texto some suavemente quando isCollapsed for true */}
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0 whitespace-nowrap animate-fadeIn">
                <p className="font-medium leading-none">{title}</p>
                <p className="text-[10px] mt-0.5 opacity-70 truncate">{subtitle}</p>
              </div>
              <ChevronRight size={12} className="opacity-60 flex-shrink-0" />
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#0b1e35] overflow-hidden">
      
      {/* Sidebar - A largura muda entre w-20 e w-64 suavemente */}
      <aside 
        className={`relative flex-shrink-0 bg-[#071527] border-r border-[#1a3a5c] flex flex-col transition-all duration-300 z-20 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        
        {/* Botão de Toggle Flutuante */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-8 bg-[#1a5fa8] text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-[#071527] hover:bg-[#154d8a] transition-all z-50 focus:outline-none"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo / Header */}
        <div className={`p-6 border-b border-[#1a3a5c] flex flex-col ${isCollapsed ? "items-center px-2" : ""}`}>
          <div className={`flex items-center gap-3 mb-1 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-lg bg-[#1a5fa8] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src="/logo.resolucao.boa.png" 
                alt="Logo CAJ" 
                className="w-full h-full object-cover" 
              />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap animate-fadeIn">
                <p className="text-white font-semibold text-sm leading-tight">CAJ</p>
                <p className="text-[10px] text-[#4a7fa5] uppercase tracking-widest font-medium leading-none">Sistema</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-[#3d6585] text-[10px] mt-2 leading-tight animate-fadeIn">
              Gestão de Notificações Judiciais e Multas de Consumo de Água
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-1 overflow-hidden ${isCollapsed ? "px-3" : "px-4"}`}>
          {!isCollapsed ? (
            <p className="text-[#2d5070] text-[10px] uppercase tracking-widest font-medium px-2 mb-3 animate-fadeIn whitespace-nowrap">
              Módulos
            </p>
          ) : (
            <div className="h-4 border-b border-[#1a3a5c]/50 mb-3 mx-2"></div>
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

        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-[#1a3a5c] ${isCollapsed ? "flex justify-center px-2" : ""}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${!isCollapsed ? "px-2" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-[#1a3a5c] flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-[#4a7fa5]" />
            </div>
            {!isCollapsed && (
              <div className="whitespace-nowrap animate-fadeIn">
                <p className="text-white text-xs font-medium leading-none">Dep. Atendimento</p>
                <p className="text-[#4a7fa5] text-[10px] mt-0.5">Notificações & Multas</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#f0f4f8] relative z-10">
        <Outlet />
      </main>
    </div>
  );
}