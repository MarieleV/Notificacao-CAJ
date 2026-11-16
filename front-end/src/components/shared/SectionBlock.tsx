import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SectionBlockProps {
  /** Número do bloco (1, 2, 3...). Usado no padrão de UX "blocos lógicos numerados". */
  number?: number | string;
  /** Alternativa ao número: um ícone Lucide (ex: para cabeçalhos temáticos). */
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Conteúdo extra alinhado à direita do cabeçalho (ex: um seletor de período). */
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Bloco de seção padronizado ("1. Título", "2. Título"...).
 *
 * Antes, o mesmo padrão visual (card branco + cabeçalho + conteúdo) era implementado
 * de duas formas diferentes:
 *  - OuvidoriaManager, RespostaDefesaManager e NotificationDrafter usavam um círculo
 *    numerado (<span className="rounded-full bg-brand...">{n}</span>).
 *  - FineCalculator usava um ícone Lucide colorido no lugar do número.
 *
 * Este componente unifica os dois casos: passe `number` OU `icon`.
 */
export function SectionBlock({
  number,
  icon: Icon,
  title,
  description,
  headerAction,
  children,
  className = "",
}: SectionBlockProps) {
  return (
    <section className={`bg-white rounded-[10px] border border-gray-200 overflow-visible ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {number !== undefined && (
            <span className="w-7 h-7 mt-px rounded-full bg-brand-soft text-brand border border-brand-line text-xs font-semibold flex items-center justify-center flex-shrink-0">
              {number}
            </span>
          )}
          {Icon && (
            <span className="w-7 h-7 mt-px rounded-md bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
              <Icon size={16} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-ink font-semibold text-base leading-snug">{title}</h2>
            {description && <p className="text-ink-muted text-sm mt-0.5">{description}</p>}
          </div>
        </div>
        {headerAction && <div className="w-full md:w-auto">{headerAction}</div>}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}