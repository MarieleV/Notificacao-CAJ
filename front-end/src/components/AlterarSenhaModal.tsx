import { FormEvent, useState } from "react";
import { trocarMinhaSenha } from "../services/usuarios";
import { Modal } from "./shared/Modal";
import { Alert, Button, hintClass, inputClass, labelClass } from "./shared/ui";

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
          <Alert tone="success">Senha alterada. Use a nova senha no próximo acesso.</Alert>
          <div className="flex justify-end">
            <Button onClick={fechar}>Fechar</Button>
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
            <label htmlFor="nova-senha" className={labelClass}>Nova senha</label>
            <input id="nova-senha" type="password" autoComplete="new-password" value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)} className={inputClass} aria-describedby="nova-senha-dica" />
            <p id="nova-senha-dica" className={hintClass}>Mínimo de 8 caracteres.</p>
          </div>
          <div>
            <label htmlFor="confirma-senha" className={labelClass}>Confirmar nova senha</label>
            <input id="confirma-senha" type="password" autoComplete="new-password" value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)} className={inputClass} />
          </div>

          {erro && <Alert tone="danger">{erro}</Alert>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={fechar}>Cancelar</Button>
            <Button type="submit" loading={salvando}>Salvar nova senha</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
