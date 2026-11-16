import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
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
import {
  inputClass,
  labelClass,
  Modal,
  primaryButtonClass,
  secondaryButtonClass,
} from "../components/shared/Modal";

type ModalState =
  | { tipo: "novo" }
  | { tipo: "editar"; usuario: UsuarioCadastro }
  | { tipo: "senha"; usuario: UsuarioCadastro }
  | { tipo: "excluir"; usuario: UsuarioCadastro }
  | null;

function ErroMsg({ erro }: { erro: string | null }) {
  if (!erro) return null;
  return (
    <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {erro}
    </p>
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
          <p className="text-[11px] text-gray-400 mt-1">Letras minúsculas, números, ponto, hífen ou sublinhado.</p>
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
        {souEu && <p className="text-[11px] text-gray-400 mt-1">Você não pode alterar o seu próprio perfil.</p>}
      </div>
      {!editando && (
        <>
          <div>
            <label htmlFor="u-senha" className={labelClass}>Senha inicial (mín. 8 caracteres)</label>
            <input id="u-senha" type="password" autoComplete="new-password" value={senha}
              onChange={(e) => setSenha(e.target.value)} className={inputClass} />
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
        <button type="button" onClick={onCancelar} className={secondaryButtonClass}>Cancelar</button>
        <button type="submit" disabled={salvando} className={primaryButtonClass}>
          {salvando && <Loader2 size={14} className="animate-spin" />}
          {editando ? "Salvar alterações" : "Criar usuário"}
        </button>
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
      <p className="text-sm text-gray-600">
        Defina uma nova senha para <strong>{usuario.nome}</strong> ({usuario.usuario}) e repasse a ela.
      </p>
      <div>
        <label htmlFor="r-senha" className={labelClass}>Nova senha (mín. 8 caracteres)</label>
        <input id="r-senha" type="password" autoComplete="new-password" value={senha}
          onChange={(e) => setSenha(e.target.value)} className={inputClass} autoFocus />
      </div>
      <div>
        <label htmlFor="r-confirma" className={labelClass}>Confirmar nova senha</label>
        <input id="r-confirma" type="password" autoComplete="new-password" value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)} className={inputClass} />
      </div>
      <ErroMsg erro={erro} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className={secondaryButtonClass}>Cancelar</button>
        <button type="submit" disabled={salvando} className={primaryButtonClass}>
          {salvando && <Loader2 size={14} className="animate-spin" />}
          Redefinir senha
        </button>
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
      <p className="text-sm text-gray-600">
        Tem certeza que deseja excluir <strong>{usuario.nome}</strong> ({usuario.usuario})? Essa ação não pode ser
        desfeita. Se quiser apenas bloquear o acesso temporariamente, use <em>Desativar</em>.
      </p>
      <ErroMsg erro={erro} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className={secondaryButtonClass}>Cancelar</button>
        <button
          onClick={confirmar}
          disabled={excluindo}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
          {excluindo && <Loader2 size={14} className="animate-spin" />}
          Excluir
        </button>
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
    "p-1.5 rounded-lg text-gray-400 hover:text-[#1a5fa8] hover:bg-blue-50 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Gestão de Usuários</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Cadastre quem pode acessar o sistema e defina os perfis de acesso.</p>
        </div>
        <button onClick={() => setModal({ tipo: "novo" })} className={primaryButtonClass}>
          <UserPlus size={16} />
          Novo usuário
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#f4f7f9] custom-scrollbar">
        <div className="p-8 max-w-[1200px] mx-auto space-y-4">
          {/* Barra de busca */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou login"
                className={`${inputClass} pl-9 bg-white`}
              />
            </div>
            <button onClick={carregar} title="Atualizar lista" className={`${secondaryButtonClass} flex items-center gap-2`}>
              <RefreshCw size={14} className={carregando ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          {aviso && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 animate-fadeIn">
              {aviso}
            </p>
          )}
          {erro && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <AlertCircle size={16} /> {erro}
            </div>
          )}

          {/* Tabela */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Login</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Criado em</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carregando && usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      <Loader2 size={20} className="animate-spin inline mr-2" /> Carregando usuários...
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">Nenhum usuário encontrado.</td>
                  </tr>
                ) : (
                  filtrados.map((u) => {
                    const souEu = u.id === user?.id;
                    return (
                      <tr key={u.id} className={`hover:bg-gray-50/60 ${!u.ativo ? "opacity-60" : ""}`}>
                        <td className="px-4 py-3 font-medium text-[#0b1e35]">
                          {u.nome}
                          {souEu && <span className="ml-2 text-[10px] text-gray-400 font-normal">(você)</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.usuario}</td>
                        <td className="px-4 py-3">
                          {u.perfil === "admin" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1a5fa8] border border-blue-200">
                              <ShieldCheck size={12} /> Admin
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                              Usuário
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              u.ativo
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {u.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button title="Editar" onClick={() => setModal({ tipo: "editar", usuario: u })} className={acaoClass}>
                              <Pencil size={15} />
                            </button>
                            <button title="Redefinir senha" onClick={() => setModal({ tipo: "senha", usuario: u })} className={acaoClass}>
                              <KeyRound size={15} />
                            </button>
                            <button
                              title={souEu ? "Você não pode desativar sua própria conta" : u.ativo ? "Desativar" : "Reativar"}
                              onClick={() => alternarAtivo(u)}
                              disabled={souEu || alternandoId === u.id}
                              className={acaoClass}
                            >
                              {alternandoId === u.id ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                            </button>
                            <button
                              title={souEu ? "Você não pode excluir sua própria conta" : "Excluir"}
                              onClick={() => setModal({ tipo: "excluir", usuario: u })}
                              disabled={souEu}
                              className={`${acaoClass} hover:!text-red-600 hover:!bg-red-50`}
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
