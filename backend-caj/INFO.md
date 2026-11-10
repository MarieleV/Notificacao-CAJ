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

### Autenticação (JWT)

Todas as rotas da API, exceto `POST /api/auth/login`, exigem o header `Authorization: Bearer <token>`.

1. Copie `.env.example` para `.env` (na Vercel, cadastre as mesmas variáveis em *Settings → Environment Variables*).
2. Gere um `JWT_SECRET` aleatório:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
3. Gere o hash da senha de cada usuário e adicione-o em `AUTH_USERS`:
   ```bash
   npm run hash -- "senhaDoUsuario"
   ```
   ```env
   AUTH_USERS=[{"usuario":"maria","nome":"Maria Silva","senhaHash":"$2b$10$..."}]
   ```

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/login` | POST | Recebe `{ usuario, senha }` e retorna `{ token, usuario }` |
| `/api/auth/me` | GET | Retorna o usuário do token (protegida) |

O token expira conforme `JWT_EXPIRES_IN` (padrão `8h`); o front-end desloga automaticamente ao expirar ou ao receber `401`.
