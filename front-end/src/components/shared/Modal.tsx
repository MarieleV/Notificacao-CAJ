import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { dialogClass, overlayClass } from "./ui";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal simples no padrão visual do sistema (fecha com Esc ou clicando fora). */
export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={overlayClass} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`${dialogClass} max-w-md`}>
        <div className="flex items-center justify-between pl-6 pr-4 h-14 border-b border-gray-100">
          <h2 className="text-ink text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-ink hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Classes de formulário reexportadas do kit de UI (mantidas aqui por compatibilidade). */
export { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "./ui";
