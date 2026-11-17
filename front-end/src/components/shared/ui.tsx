import type { ButtonHTMLAttributes, ElementType, ReactNode } from "react";
import { useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";

/*
 * ─── Kit de UI do Sistema CAJ ───────────────────────────────────────────────
 * Componentes puramente visuais (sem regra de negócio). Use-os nas telas para
 * manter botões, campos, badges, alertas e cabeçalhos idênticos em todo o sistema.
 * Os tokens de cor (brand, ink, success, warning, danger...) vêm de styles/theme.css.
 */

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

/* ─────────────────────────── Classes de formulário ─────────────────────────── */

/** Campo de texto/select padrão (altura 40px, raio 6px). */
export const inputClass =
  "w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-sm text-ink placeholder:text-gray-400 " +
  "transition-colors hover:border-gray-400 focus:outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 " +
  "disabled:bg-gray-100 disabled:text-ink-muted disabled:cursor-not-allowed " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

/** Área de texto padrão (mesmo visual do input, altura livre). */
export const textareaClass = inputClass.replace("h-10 ", "") + " py-2.5 leading-relaxed";

/** Label padrão: 12px, peso médio, em caixa normal. */
export const labelClass = "block text-xs font-medium text-ink-body mb-1.5";

/** Texto de ajuda abaixo do campo. */
export const hintClass = "text-xs text-ink-muted mt-1.5";

/** Mensagem de erro de validação abaixo do campo. */
export const fieldErrorClass = "flex items-center gap-1 text-xs text-danger mt-1.5";

/* ─────────────────────────────── Botões ─────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "ghost-danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap select-none " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-55";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-xs hover:bg-brand-hover active:bg-navy-raised",
  secondary: "bg-white text-ink-body border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
  danger: "bg-danger text-white shadow-xs hover:bg-danger-hover",
  ghost: "text-ink-muted hover:text-ink hover:bg-gray-100",
  "ghost-danger": "text-ink-muted border border-gray-200 hover:text-danger hover:bg-danger-soft hover:border-danger-line",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

/** Gera as classes de botão — útil quando o elemento não é um <button> (ex.: <label>, <a>). */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], extra);
}

export const primaryButtonClass = buttonClass("primary");
export const secondaryButtonClass = buttonClass("secondary");
export const dangerButtonClass = buttonClass("danger");

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Mostra spinner e desabilita o botão. */
  loading?: boolean;
  icon?: ElementType;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  disabled,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconSize = size === "sm" ? 14 : 16;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading ? <Loader2 size={iconSize} className="animate-spin" /> : Icon ? <Icon size={iconSize} /> : null}
      {children}
    </button>
  );
}

/* ─────────────────────────────── Badges ─────────────────────────────── */

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const badgeTones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  brand: "bg-brand-soft text-brand border-brand-line",
  success: "bg-success-soft text-success border-success-line",
  warning: "bg-warning-soft text-warning border-warning-line",
  danger: "bg-danger-soft text-danger border-danger-line",
};

export function badgeClass(tone: Tone = "neutral", extra = "") {
  return cx(
    "inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[11px] font-semibold leading-none whitespace-nowrap",
    badgeTones[tone],
    extra,
  );
}

export function Badge({ tone = "neutral", icon: Icon, children, className = "" }: {
  tone?: Tone;
  icon?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={badgeClass(tone, className)}>
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

/* ─────────────────────────────── Alertas ─────────────────────────────── */

const alertTones: Record<Exclude<Tone, "neutral">, { box: string; icon: ElementType }> = {
  brand: { box: "bg-brand-soft border-brand-line text-brand", icon: Info },
  success: { box: "bg-success-soft border-success-line text-success", icon: CheckCircle2 },
  warning: { box: "bg-warning-soft border-warning-line text-warning", icon: AlertTriangle },
  danger: { box: "bg-danger-soft border-danger-line text-danger", icon: AlertCircle },
};

/** Mensagem dentro do fluxo da página/formulário (validação, sucesso, aviso). */
export function Alert({ tone = "danger", children, className = "" }: {
  tone?: Exclude<Tone, "neutral">;
  children: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = alertTones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("flex items-start gap-2 border rounded-md px-3 py-2.5 text-sm leading-snug animate-fadeIn", box, className)}
    >
      <Icon size={16} className="flex-shrink-0 mt-px" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ───────────────────────────── Cabeçalho de página ───────────────────────────── */

/** Cabeçalho fixo no topo de cada módulo: ícone, título, descrição e ações à direita. */
export function PageHeader({ icon: Icon, title, description, actions }: {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 min-h-[72px] py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 flex-shrink-0 relative z-30">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center flex-shrink-0">
            <Icon size={18} />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-ink text-xl font-semibold leading-tight truncate">{title}</h1>
          {description && <p className="text-ink-muted text-sm mt-0.5 truncate">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </header>
  );
}

/* ─────────────────────────────── Tabelas ─────────────────────────────── */

/** Classes padrão para tabelas de dados (cabeçalho, linhas e células). */
export const table = {
  wrapper: "overflow-x-auto custom-scrollbar",
  table: "w-full text-[13px] border-collapse",
  thead: "bg-gray-50 border-b border-gray-200",
  th: "px-4 h-10 text-left text-[11px] font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap",
  tr: "border-b border-gray-100 last:border-0 transition-colors hover:bg-brand-subtle",
  td: "px-4 py-3 text-ink-body align-middle",
};

/* ─────────────────────────── Modais de feedback ─────────────────────────── */

export type FeedbackType = "success" | "warning" | "error";

const feedbackStyles: Record<FeedbackType, { icon: ElementType; ring: string; title: string }> = {
  success: { icon: CheckCircle2, ring: "bg-success-soft text-success", title: "Concluído" },
  warning: { icon: AlertTriangle, ring: "bg-warning-soft text-warning", title: "Atenção" },
  error: { icon: AlertCircle, ring: "bg-danger-soft text-danger", title: "Não foi possível concluir" },
};

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export const overlayClass =
  "fixed inset-0 z-[100] bg-navy/45 backdrop-blur-[2px] flex items-center justify-center px-4 animate-fadeIn";
export const dialogClass = "bg-white rounded-[14px] shadow-2xl w-full animate-scaleIn";

/** Resultado de uma operação (importação, envio, geração de arquivo). */
export function FeedbackModal({ type, message, title, buttonLabel = "Entendi", onClose }: {
  type: FeedbackType;
  message: ReactNode;
  title?: string;
  buttonLabel?: string;
  onClose: () => void;
}) {
  useEscape(true, onClose);
  const s = feedbackStyles[type];
  const Icon = s.icon;
  return (
    <div className={overlayClass} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="feedback-title" className={cx(dialogClass, "max-w-sm p-6 text-center")}>
        <span className={cx("mx-auto w-12 h-12 rounded-full flex items-center justify-center", s.ring)}>
          <Icon size={24} />
        </span>
        <h2 id="feedback-title" className="mt-4 text-base font-semibold text-ink">{title ?? s.title}</h2>
        <p className="mt-1.5 text-sm text-ink-body leading-relaxed">{message}</p>
        <Button className="mt-6 w-full" onClick={onClose} autoFocus>{buttonLabel}</Button>
      </div>
    </div>
  );
}

/** Overlay de carregamento bloqueante (ex.: leitura de planilha). */
export function LoadingOverlay({ visible, message = "Carregando…" }: { visible: boolean; message?: ReactNode }) {
  if (!visible) return null;
  return (
    <div className={overlayClass} role="status" aria-live="polite">
      <div className={cx(dialogClass, "max-w-[240px] px-8 py-6 flex flex-col items-center gap-3")}>
        <Loader2 size={28} className="animate-spin text-brand" />
        <p className="text-sm font-medium text-ink-body text-center">{message}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Estado vazio ─────────────────────────── */

export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <span className="w-11 h-11 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
          <Icon size={20} />
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
