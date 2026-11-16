import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { trocarMinhaSenha } from "../services/usuarios";
import { inputClass, labelClass, Modal, primaryButtonClass, secondaryButtonClass } from "./shared/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Permite ao usuário logado trocar a própria senha. */
export function AlterarSenhaModal({ open, onClose }: Props) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function fechar() {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmacao("");
    setErro(null);
    setSucesso(false);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 8) return setErro("A nova senha deve ter no mínimo 8 caracteres.");
    if (novaSenha !== confirmacao) return setErro("A confirmação não confere com a nova senha.");

    setErro(null);
    setSalvando(true);
    try {
      await trocarMinhaSenha(senhaAtual, novaSenha);
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao alterar senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal open={open} title="Alterar minha senha" onClose={fechar}>
      {sucesso ? (
        <div className="space-y-4">
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Senha alterada com sucesso.
          </p>
          <div className="flex justify-end">
            <button onClick={fechar} className={primaryButtonClass}>Fechar</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="senha-atual" className={labelClass}>Senha atual</label>
            <input id="senha-atual" type="password" autoComplete="current-password" value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)} className={inputClass} autoFocus />
          </div>
          <div>
            <label htmlFor="nova-senha" className={labelClass}>Nova senha (mín. 8 caracteres)</label>
            <input id="nova-senha" type="password" autoComplete="new-password" value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="confirma-senha" className={labelClass}>Confirmar nova senha</label>
            <input id="confirma-senha" type="password" autoComplete="new-password" value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)} className={inputClass} />
          </div>

          {erro && <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{erro}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={fechar} className={secondaryButtonClass}>Cancelar</button>
            <button type="submit" disabled={salvando} className={primaryButtonClass}>
              {salvando && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
