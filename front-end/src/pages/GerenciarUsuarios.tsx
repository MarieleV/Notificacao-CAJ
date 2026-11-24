import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  Loader2,
  Pencil,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import type { Perfil } from "../services/auth";
import {
  atualizarUsuario,
  criarUsuario,
  excluirUsuario,
  listarUsuarios,
  redefinirSenhaUsuario,
  UsuarioCadastro,
} from "../services/usuarios";
import { Modal } from "../components/shared/Modal";
import { Alert, Badge, Button, EmptyState, hintClass, inputClass, labelClass, PageHeader, table } from "../components/shared/ui";

type ModalState =
  | { tipo: "novo" }
  | { tipo: "editar"; usuario: UsuarioCadastro }
  | { tipo: "senha"; usuario: UsuarioCadastro }
  | { tipo: "excluir"; usuario: UsuarioCadastro }
  | null;

function ErroMsg({ erro }: { erro: string | null }) {
  if (!erro) return null;
  return (
    <Alert tone="danger">{erro}</Alert>
  );
}

/* ----------------------------- Formulário novo/editar ----------------------------- */

function UsuarioForm({
  usuario,
  souEu,
  onSalvo,
  onCancelar,
}: {
  usuario?: UsuarioCadastro;
  souEu: boolean;
  onSalvo: (msg: string) => void;
  onCancelar: () => void;
}) {
  const editando = !!usuario;
  const [login, setLogin] = useState(usuario?.usuario ?? "");
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [perfil, setPerfil] = useState<Perfil>(usuario?.perfil ?? "usuario");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return setErro("Informe o nome.");
    if (!editando) {
      if (!login.trim()) return setErro("Informe o usuário (login).");
      if (senha.length < 8) return setErro("A senha deve ter no mínimo 8 caracteres.");
      if (senha !== confirmacao) return setErro("A confirmação não confere com a senha.");
    }

    setErro(null);
    setSalvando(true);
    try {
      if (editando) {
        await atualizarUsuario(usuario.id, { nome: nome.trim(), perfil });
        onSalvo(`Usuário "${nome.trim()}" atualizado.`);
      } else {
        await criarUsuario({ usuario: login.trim().toLowerCase(), nome: nome.trim(), senha, perfil });
        onSalvo(`Usuário "${nome.trim()}" criado.`);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="u-nome" className={labelClass}>Nome completo</label>
        <input id="u-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} autoFocus />
      </div>
      <div>
        <label htmlFor="u-login" className={labelClass}>Usuário (login)</label>
        <input
          id="u-login"
          value={login}
          onChange={(e) => setLogin(e.target.value.toLowerCase().replace(/\s/g, ""))}
          className={inputClass}
          disabled={editando}
          placeholder="ex.: maria.silva"
          autoComplete="off"
        />
        {!editando && (
          <p className={hintClass}>Letras minúsculas, números, ponto, hífen ou sublinhado.</p>
        )}
      </div>
      <div>
        <label htmlFor="u-perfil" className={labelClass}>Perfil</label>
        <select
          id="u-perfil"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as Perfil)}
          className={inputClass}
          disabled={souEu}
        >
          <option value="usuario">Usuário — acessa os módulos do sistema</option>
          <option value="admin">Administrador — também gerencia usuários</option>
        </select>
        {souEu && <p className={hintClass}>Você não pode alterar o seu próprio perfil.</p>}
      </div>
      {!editando && (
        <>
          <div>
            <label htmlFor="u-senha" className={labelClass}>Senha inicial</label>
            <input id="u-senha" type="password" autoComplete="new-password" value={senha}
              onChange={(e) => setSenha(e.target.value)} className={inputClass} aria-describedby="u-senha-dica" />
            <p id="u-senha-dica" className={hintClass}>Mínimo de 8 caracteres.</p>
          </div>
          <div>
            <label htmlFor="u-confirma" className={labelClass}>Confirmar senha</label>
            <input id="u-confirma" type="password" autoComplete="new-password" value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)} className={inputClass} />
          </div>
        </>
      )}

      <ErroMsg erro={erro} />

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" loading={salvando}>
          {editando ? "Salvar alterações" : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}

/* ----------------------------- Redefinir senha ----------------------------- */

function RedefinirSenhaForm({
  usuario,
  onSalvo,
  onCancelar,
}: {
  usuario: UsuarioCadastro;
  onSalvo: (msg: string) => void;
  onCancelar: () => void;
}) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setErro("A senha deve ter no mínimo 8 caracteres.");
    if (senha !== confirmacao) return setErro("A confirmação não confere com a senha.");
    setErro(null);
    setSalvando(true);
    try {
      await redefinirSenhaUsuario(usuario.id, senha);
      onSalvo(`Senha de "${usuario.nome}" redefinida.`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao redefinir senha.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-body leading-relaxed">
        Defina uma nova senha para <strong>{usuario.nome}</strong> ({usuario.usuario}) e repasse a ela.
      </p>
      <div>
        <label htmlFor="r-senha" className={labelClass}>Nova senha</label>
        <input id="r-senha" type="password" autoComplete="new-password" value={senha}
          onChange={(e) => setSenha(e.target.value)} className={inputClass} autoFocus aria-describedby="r-senha-dica" />
        <p id="r-senha-dica" className={hintClass}>Mínimo de 8 caracteres.</p>
      </div>
      <div>
        <label htmlFor="r-confirma" className={labelClass}>Confirmar nova senha</label>
        <input id="r-confirma" type="password" autoComplete="new-password" value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)} className={inputClass} />
      </div>
      <ErroMsg erro={erro} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" loading={salvando}>Redefinir senha</Button>
      </div>
    </form>
  );
}

/* ----------------------------- Confirmar exclusão ----------------------------- */

function ExcluirConfirmacao({
  usuario,
  onSalvo,
  onCancelar,
}: {
  usuario: UsuarioCadastro;
  onSalvo: (msg: string) => void;
  onCancelar: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    try {
      await excluirUsuario(usuario.id);
      onSalvo(`Usuário "${usuario.nome}" excluído.`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir usuário.");
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-body leading-relaxed">
        Tem certeza que deseja excluir <strong>{usuario.nome}</strong> ({usuario.usuario})? Essa ação não pode ser
        desfeita. Se quiser apenas bloquear o acesso temporariamente, use <em>Desativar</em>.
      </p>
      <ErroMsg erro={erro} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancelar}>Cancelar</Button>
        <Button variant="danger" icon={Trash2} loading={excluindo} onClick={confirmar}>
          Excluir usuário
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- Página ----------------------------- */

export function GerenciarUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioCadastro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [alternandoId, setAlternandoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar usuários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 4000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => u.nome.toLowerCase().includes(q) || u.usuario.includes(q));
  }, [usuarios, busca]);

  const fecharModal = useCallback(() => setModal(null), []);

  function aposSalvar(msg: string) {
    setModal(null);
    setAviso(msg);
    carregar();
  }

  async function alternarAtivo(u: UsuarioCadastro) {
    setAlternandoId(u.id);
    try {
      await atualizarUsuario(u.id, { ativo: !u.ativo });
      setAviso(`Usuário "${u.nome}" ${u.ativo ? "desativado" : "reativado"}.`);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao alterar status.");
    } finally {
      setAlternandoId(null);
    }
  }

  const tituloModal =
    modal?.tipo === "novo" ? "Novo usuário"
    : modal?.tipo === "editar" ? "Editar usuário"
    : modal?.tipo === "senha" ? "Redefinir senha"
    : modal?.tipo === "excluir" ? "Excluir usuário"
    : "";

  const acaoClass =
    "w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-brand hover:bg-brand-soft transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <PageHeader
        icon={Users}
        title="Usuários"
        description="Cadastre quem pode acessar o sistema e defina os perfis de acesso."
        actions={<Button icon={UserPlus} onClick={() => setModal({ tipo: "novo" })}>Novo usuário</Button>}
      />

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="px-8 py-8 max-w-[1200px] mx-auto space-y-4">
          {/* Barra de busca */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                aria-label="Buscar usuário por nome ou login"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou login"
                className={`${inputClass} pl-9`}
              />
            </div>
            <Button variant="secondary" onClick={carregar} title="Atualizar lista" disabled={carregando}>
              <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />
              Atualizar
            </Button>
          </div>

          {aviso && (
            <Alert tone="success">{aviso}</Alert>
          )}
          {erro && (
            <Alert tone="danger">{erro}</Alert>
          )}

          {/* Tabela */}
          <div className={`bg-white rounded-[10px] border border-gray-200 ${table.wrapper}`}>
            <table className={table.table}>
              <thead className={table.thead}>
                <tr>
                  <th className={table.th}>Nome</th>
                  <th className={table.th}>Login</th>
                  <th className={table.th}>Perfil</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th}>Criado em</th>
                  <th className={`${table.th} text-right`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {carregando && usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-ink-muted" role="status">
                      <Loader2 size={20} className="animate-spin inline mr-2 text-brand" /> Carregando usuários…
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Users}
                        title="Nenhum usuário encontrado"
                        description={busca ? "Nenhum nome ou login corresponde à busca." : "Cadastre o primeiro usuário para liberar o acesso ao sistema."}
                      />
                    </td>
                  </tr>
                ) : (
                  filtrados.map((u) => {
                    const souEu = u.id === user?.id;
                    return (
                      <tr key={u.id} className={`${table.tr} ${!u.ativo ? "opacity-60" : ""}`}>
                        <td className={`${table.td} font-medium text-ink`}>
                          {u.nome}
                          {souEu && <span className="ml-2 text-xs text-ink-muted font-normal">(você)</span>}
                        </td>
                        <td className={`${table.td} font-mono text-xs`}>{u.usuario}</td>
                        <td className={table.td}>
                          {u.perfil === "admin" ? (
                            <Badge tone="brand" icon={ShieldCheck}>Admin</Badge>
                          ) : (
                            <Badge>Usuário</Badge>
                          )}
                        </td>
                        <td className={table.td}>
                          <Badge tone={u.ativo ? "success" : "danger"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                        </td>
                        <td className={`${table.td} text-xs`}>
                          {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                        <td className={table.td}>
                          <div className="flex justify-end gap-1">
                            <button title="Editar" aria-label={`Editar ${u.nome}`} onClick={() => setModal({ tipo: "editar", usuario: u })} className={acaoClass}>
                              <Pencil size={15} />
                            </button>
                            <button title="Redefinir senha" aria-label={`Redefinir senha de ${u.nome}`} onClick={() => setModal({ tipo: "senha", usuario: u })} className={acaoClass}>
                              <KeyRound size={15} />
                            </button>
                            <button
                              title={souEu ? "Você não pode desativar sua própria conta" : u.ativo ? "Desativar" : "Reativar"}
                              aria-label={`${u.ativo ? "Desativar" : "Reativar"} ${u.nome}`}
                              onClick={() => alternarAtivo(u)}
                              disabled={souEu || alternandoId === u.id}
                              className={acaoClass}
                            >
                              {alternandoId === u.id ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                            </button>
                            <button
                              title={souEu ? "Você não pode excluir sua própria conta" : "Excluir"}
                              aria-label={`Excluir ${u.nome}`}
                              onClick={() => setModal({ tipo: "excluir", usuario: u })}
                              disabled={souEu}
                              className={`${acaoClass} hover:!text-danger hover:!bg-danger-soft`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!modal} title={tituloModal} onClose={fecharModal}>
        {modal?.tipo === "novo" && <UsuarioForm souEu={false} onSalvo={aposSalvar} onCancelar={fecharModal} />}
        {modal?.tipo === "editar" && (
          <UsuarioForm usuario={modal.usuario} souEu={modal.usuario.id === user?.id} onSalvo={aposSalvar} onCancelar={fecharModal} />
        )}
        {modal?.tipo === "senha" && <RedefinirSenhaForm usuario={modal.usuario} onSalvo={aposSalvar} onCancelar={fecharModal} />}
        {modal?.tipo === "excluir" && <ExcluirConfirmacao usuario={modal.usuario} onSalvo={aposSalvar} onCancelar={fecharModal} />}
      </Modal>
    </div>
  );
}
