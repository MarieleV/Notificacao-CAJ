import { FormEvent, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  StatusChaveGemini,
  obterStatusChaveGemini,
  removerChaveGemini,
  salvarChaveGemini,
} from "../services/usuarios";
import { Modal } from "./shared/Modal";
import { Alert, Badge, Button, hintClass, inputClass, labelClass } from "./shared/ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Cadastro da chave do Gemini do próprio usuário.
 * A chave é enviada uma vez ao servidor, que a guarda cifrada no banco; ela não fica salva no navegador
 * e nunca é devolvida pela API (só os 4 últimos caracteres, para conferência).
 */
export function ChaveGeminiModal({ open, onClose }: Props) {
  const [status, setStatus] = useState<StatusChaveGemini | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [chave, setChave] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    obterStatusChaveGemini()
      .then((s) => !cancelado && setStatus(s))
      .catch((err) => !cancelado && setErro(err instanceof Error ? err.message : "Erro ao consultar a chave."))
      .finally(() => !cancelado && setCarregando(false));
    return () => {
      cancelado = true;
    };
  }, [open]);

  function fechar() {
    setChave("");
    setErro(null);
    setSucesso(null);
    setStatus(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!chave.trim()) return setErro("Cole a chave do Gemini.");
    setErro(null);
    setSucesso(null);
    setSalvando(true);
    try {
      setStatus(await salvarChaveGemini(chave.trim()));
      setChave("");
      setSucesso("Chave salva. Ela já será usada na próxima notificação gerada.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar a chave.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover() {
    if (!window.confirm("Remover sua chave do Gemini? Você não conseguirá gerar notificações com IA até cadastrar outra.")) return;
    setErro(null);
    setSucesso(null);
    setRemovendo(true);
    try {
      await removerChaveGemini();
      setStatus({ configurada: false, final: null });
      setSucesso("Chave removida.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover a chave.");
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <Modal open={open} title="Minha chave do Gemini" onClose={fechar}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-ink-body">Situação</span>
          {carregando || !status ? (
            <span className="text-xs text-ink-muted">Consultando…</span>
          ) : status.configurada ? (
            <Badge tone="success">Cadastrada · termina em {status.final}</Badge>
          ) : (
            <Badge tone="warning">Não cadastrada</Badge>
          )}
        </div>

        {status?.ilegivel && (
          <Alert tone="warning">A chave salva não pôde ser lida pelo servidor. Cadastre-a novamente.</Alert>
        )}

        <div>
          <label htmlFor="chave-gemini" className={labelClass}>
            {status?.configurada ? "Nova chave (substitui a atual)" : "Chave da API do Gemini"}
          </label>
          <input
            id="chave-gemini"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            className={inputClass}
            placeholder="Cole aqui a chave"
            aria-describedby="chave-gemini-dica"
            autoFocus
          />
          <p id="chave-gemini-dica" className={hintClass}>
            Crie a chave no{" "}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand hover:underline inline-flex items-center gap-0.5">
              Google AI Studio <ExternalLink size={11} />
            </a>
            . Ela fica guardada de forma cifrada no servidor e não é exibida de novo.
          </p>
        </div>

        {erro && <Alert tone="danger">{erro}</Alert>}
        {sucesso && <Alert tone="success">{sucesso}</Alert>}

        <div className="flex items-center justify-between gap-2 pt-2">
          {status?.configurada ? (
            <Button variant="ghost-danger" onClick={handleRemover} loading={removendo}>Remover chave</Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fechar}>Fechar</Button>
            <Button type="submit" loading={salvando} disabled={!chave.trim()}>Salvar chave</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
