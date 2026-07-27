import { Outlet, NavLink } from "react-router";
import { 
  MessageSquareReply, 
  FileText, 
  Calculator, 
  Scale, 
  ChevronRight, 
  Building2 
} from "lucide-react";
import { ElementType } from "react";

// Subcomponente para evitar repetição de código (DRY)
interface NavItemProps {
  to: string;
  icon: ElementType;
  title: string;
  subtitle: string;
  end?: boolean;
}

function NavItem({ to, icon: Icon, title, subtitle, end = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
          isActive
            ? "bg-[#1a5fa8] text-white shadow-lg shadow-[#1a5fa8]/20"
            : "text-[#6a9fc0] hover:bg-[#0f2a45] hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            size={16} 
            className={isActive ? "text-[#7ec8e3]" : "text-[#4a7fa5] group-hover:text-[#7ec8e3]"} 
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium leading-none">{title}</p>
            <p className="text-[10px] mt-0.5 opacity-70 truncate">{subtitle}</p>
          </div>
          {isActive && <ChevronRight size={12} className="opacity-60" />}
        </>
      )}
    </NavLink>
  );
}

export function Layout() {
  return (
    <div className="flex h-screen bg-[#0b1e35] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#071527] border-r border-[#1a3a5c] flex flex-col">
        
        {/* Logo / Header */}
        <div className="p-6 border-b border-[#1a3a5c]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-[#1a5fa8] flex items-center justify-center">
              <img 
                src="/logo.resolucao.boa.jpg" 
                alt="Logo CAJ" 
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5"
              />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">CAJ</p>
              <p className="text-[10px] text-[#4a7fa5] uppercase tracking-widest font-medium leading-none">Sistema</p>
            </div>
          </div>
          <p className="text-[#3d6585] text-[10px] mt-2 leading-tight">Gestão de Notificações Judiciais e Multas de Consumo de Água</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[#2d5070] text-[10px] uppercase tracking-widest font-medium px-2 mb-3">Módulos</p>

          <NavItem 
            to="/" 
            end 
            icon={FileText} 
            title="Redigir Notificação" 
            subtitle="Assistente de IA" 
          />
          
          <NavItem 
            to="/resposta-defesa" 
            icon={MessageSquareReply} 
            title="Retorno de Defesa" 
            subtitle="Pareceres de Resposta" 
          />
          
          <NavItem 
            to="/multas" 
            icon={Calculator} 
            title="Tabela de Multas" 
            subtitle="Cálculo e Referência" 
          />
          
          <NavItem 
            to="/ouvidoria" 
            icon={Scale} 
            title="Ouvidoria e Recursos" 
            subtitle="Análise de Processos" 
          />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1a3a5c]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#1a3a5c] flex items-center justify-center">
              <Building2 size={14} className="text-[#4a7fa5]" />
            </div>
            <div>
              <p className="text-white text-xs font-medium leading-none">Dep. Atendimento</p>
              <p className="text-[#4a7fa5] text-[10px] mt-0.5">Notificações & Multas</p>
            </div>
          </div>
          <div className="mt-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[#4a7fa5] text-[10px]">IA conectada | Gemini Pro</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#f0f4f8]">
        <Outlet />
      </main>
    </div>
  );
}