### Configuração do Ambiente Back-end

Para inicializar a configuração do ambiente de desenvolvimento, acesse o diretório raiz do back-end via terminal e execute os comandos descritos a seguir:

```bash
# Instalação de todas as dependências do projeto
npm install

# Inicialização do servidor 
npm run start

```

Por padrão, a API estará acessível através do endereço `http://localhost:3000` (a porta pode ser redefinida conforme a configuração do ambiente).

> **Nota:** Recomenda-se a verificação dos scripts definidos no arquivo `package.json` para certificar-se dos comandos exatos de inicialização e build do projeto.

### Autenticação (JWT) e usuários

Todas as rotas da API, exceto `POST /api/auth/login`, exigem o header `Authorization: Bearer <token>`.
Os usuários ficam na tabela `usuarios` de um banco Postgres no **Supabase**.

#### Configuração inicial (uma única vez)

1. Crie um projeto em [supabase.com](https://supabase.com) e copie a connection string em
   *Project Settings → Database → Connection string → **Transaction pooler*** (porta 6543).
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
3. Crie a tabela e o primeiro administrador:
   ```bash
   npm run criar-admin -- admin "Nome do Administrador" "SenhaForte123"
   ```
   (Se o usuário já existir, ele é promovido a admin, reativado e tem a senha redefinida — útil caso o admin perca o acesso.)
4. Na Vercel, cadastre `DATABASE_URL`, `JWT_SECRET` e `JWT_EXPIRES_IN` em *Settings → Environment Variables*.

Depois disso, o admin entra no sistema e cadastra os demais usuários pela tela **Usuários** (menu Administração).

#### Perfis

| Perfil | Pode |
|--------|------|
| `usuario` | Usar todos os módulos e trocar a própria senha |
| `admin` | Tudo acima + criar, editar, desativar, excluir usuários e redefinir senhas |

Um admin não pode rebaixar, desativar ou excluir a própria conta (garante que sempre exista um admin ativo).
Desativações e mudanças de perfil valem na hora — o token do usuário deixa de funcionar imediatamente.

#### Rotas

| Rota | Método | Acesso | Descrição |
|------|--------|--------|-----------|
| `/api/auth/login` | POST | público | `{ usuario, senha }` → `{ token, usuario }` |
| `/api/auth/me` | GET | logado | Dados do usuário do token |
| `/api/auth/senha` | PUT | logado | `{ senhaAtual, novaSenha }` — troca a própria senha |
| `/api/usuarios` | GET | admin | Lista usuários |
| `/api/usuarios` | POST | admin | `{ usuario, nome, senha, perfil }` — cria usuário |
| `/api/usuarios/:id` | PUT | admin | `{ nome?, perfil?, ativo? }` — edita usuário |
| `/api/usuarios/:id/senha` | PUT | admin | `{ senha }` — redefine a senha |
| `/api/usuarios/:id` | DELETE | admin | Exclui usuário |

O token expira conforme `JWT_EXPIRES_IN` (padrão `8h`); o front-end desloga automaticamente ao expirar ou ao receber `401`.
