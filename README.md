<h1 align="center">CAJ Sistema</h1>

<p align="center">
  Sistema de Gestão Administrativa, Jurídica e Financeira para a Companhia Águas de Joinville.
</p>

<p align="center">
  <a href="https://notificacao-caj-7ncb.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Demo%20Online-334155?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo online" />
  </a>
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-475569?style=for-the-badge" alt="Status: em desenvolvimento" />
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/Licen%C3%A7a-BSD%203--Clause-64748B?style=for-the-badge" alt="Licença BSD 3-Clause" />
  </a>
</p>

<!-- AJUSTE: confirme que você tem autorização da CAJ para divulgar o projeto e que o link público
     não expõe dados internos. -->

<p align="center"><sub>🔐 O acesso exige usuário e senha. As contas são criadas por um administrador do sistema.</sub></p>

---

<p align="center">
Plataforma <i>full-stack</i> desenvolvida para a <b>Companhia Águas de Joinville (CAJ)</b>, com foco em automatizar processos internos, calcular valores de forma determinística e redigir pareceres e notificações extrajudiciais com apoio de IA. A aplicação foi construída com base nas resoluções da ARIS (Agência Reguladora) e busca reduzir o trabalho manual dos setores de Fiscalização, Atendimento e Ouvidoria.
</p>

<p align="center">
  <a href="#-módulos-principais">Módulos</a> ·
  <a href="#-diferenciais-de-ux-e-engenharia">Diferenciais</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-estrutura-do-projeto">Estrutura</a> ·
  <a href="#-como-rodar-localmente">Como rodar</a>
</p>

<!-- AJUSTE: adicione 2 ou 3 prints das telas principais (ex.: Calculadora de Faturamento e Redator Inteligente)
     em uma seção "Telas". Se houver dados reais, use dados fictícios ou desfoque as informações. -->

---

##  → Módulos Principais

<table align="center" width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3>Redator Inteligente (IA)</h3>
      <p>Integração com o <b>Google Gemini</b> (modelo padrão gemini-3.8-flash) para consolidar infrações e redigir notificações extrajudiciais (Autos de Infração) com base no Artigo 144 da Resolução ARIS nº 019/2019. Busca os dados do cliente numa planilha lida no navegador, trabalha em lote com os casos do Controle de Análises e exporta em Word e PDF.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Retorno de Defesa</h3>
      <p>Módulo <i>fast-track</i> para análise de defesas prévias e geração de respostas padronizadas, com inserção dinâmica do número da defesa e do fundamento do indeferimento. Permite trabalhar em lote por matrícula.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Tabela de Multas</h3>
      <p>Calculadora de diferenças de faturamento de água e esgoto: compara, mês a mês, os valores corretos (calculados fora do sistema e digitados) com os cobrados, apura a diferença a cobrar ou a restituir e gera os laudos de apuração.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Análises Vencidas</h3>
      <p>Cruza os relatórios OP00002, 989 Cliente e 989 CAJ do Sansys para mostrar as análises vencidas, os dias de atraso em dias úteis e os casos já padronizados.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Ouvidoria e Recursos</h3>
      <p>Árvore de decisão para análise de recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Gera minutas a partir da decisão de mérito (Deferido, Indeferido, Parcial), considerando as regras vigentes (IN 83/2025, Fatos Novos, LA Padronizada), e emite guias de encerramento no sistema Sansys.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Usuários (administradores)</h3>
      <p>Cadastro de usuários, perfis (administrador ou usuário), ativação e redefinição de senha. Cada usuário pode trocar a própria senha.</p>
    </td>
  </tr>
</table>

<br/>

##  → Diferenciais de UX e Engenharia

- **Sessão persistente (anti-F5):** formulários, textos gerados e lotes de casos ficam no *Session Storage* por meio de hooks customizados; a base de clientes fica no IndexedDB e o resultado do Controle de Análises no *Local Storage*. Ao recarregar a página ou trocar de módulo, o trabalho em andamento é preservado.
- **Trabalho em lote:** os casos filtrados no Controle de Análises podem ser importados no Redator, no Retorno de Defesa e na Tabela de Multas, com navegação caso a caso por responsável.
- **Interações de planilha (drag-to-fill):** as tabelas de cálculo permitem arrastar valores como no Excel, e a navegação entre campos funciona com `Enter`.
- **Geração dinâmica de documentos:** serviços com `docx` e `pdfkit` recebem JSON do front-end e devolvem documentos oficiais em tempo real (com logo, quadros do AR e destaques em vermelho e negrito).
- **Calculadora de dias úteis:** ferramenta flutuante nas telas de Retorno de Defesa e Ouvidoria, que calcula datas-limite descontando fins de semana, feriados e emendas cadastrados.
- **Acesso controlado:** login com token JWT, senhas guardadas com hash (bcrypt) e perfis de usuário e administrador. Desativar um usuário bloqueia o acesso na hora.

<br/>

##  → Tech Stack

<div align="center">
  <table align="center" cellspacing="10" cellpadding="10">
    <!-- Front-end -->
    <tr>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/typescript/CBD5E1" width="40" height="40" alt="TypeScript"/><br/>TypeScript
      </td>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/react/CBD5E1" width="40" height="40" alt="React"/><br/>React 18
      </td>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/vite/CBD5E1" width="40" height="40" alt="Vite"/><br/>Vite
      </td>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/reactrouter/CBD5E1" width="40" height="40" alt="React Router"/><br/>React Router v7
      </td>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/tailwindcss/CBD5E1" width="40" height="40" alt="Tailwind CSS"/><br/>Tailwind v4
      </td>
      <td align="center" width="16%">
        <img src="https://cdn.simpleicons.org/lucide/CBD5E1" width="40" height="40" alt="Lucide"/><br/>Lucide
      </td>
    </tr>
    <!-- Back-end & IA -->
    <tr>
      <td align="center">
        <img src="https://cdn.simpleicons.org/javascript/CBD5E1" width="40" height="40" alt="JavaScript"/><br/>JavaScript
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/nodedotjs/CBD5E1" width="40" height="40" alt="Node.js"/><br/>Node.js
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/express/CBD5E1" width="40" height="40" alt="Express"/><br/>Express
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/googlegemini/CBD5E1" width="40" height="40" alt="Google Gemini"/><br/>Gemini
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/supabase/CBD5E1" width="40" height="40" alt="Supabase"/><br/>Supabase
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/vercel/CBD5E1" width="40" height="40" alt="Vercel"/><br/>Vercel
      </td>
    </tr>
  </table>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/PDFKit-334155?style=flat-square" alt="PDFKit" />
  <img src="https://img.shields.io/badge/Docx-334155?style=flat-square" alt="Docx" />
  <img src="https://img.shields.io/badge/XLSX-334155?style=flat-square" alt="XLSX" />
  <img src="https://img.shields.io/badge/@google%2Fgenerative--ai-334155?style=flat-square" alt="@google/generative-ai" />
  <img src="https://img.shields.io/badge/PostgreSQL%20(pg)-334155?style=flat-square" alt="PostgreSQL (pg)" />
  <img src="https://img.shields.io/badge/JWT-334155?style=flat-square" alt="JWT" />
  <img src="https://img.shields.io/badge/bcryptjs-334155?style=flat-square" alt="bcryptjs" />
</p>

<p align="center"><sub>O front-end é escrito em TypeScript. O back-end está em JavaScript (Node.js).</sub></p>

<br/>

##  → Estrutura do Projeto

Monorepo com dois projetos independentes (front-end e back-end), o que permite deploys separados:

```text
Notificacao-CAJ
├── front-end
│   ├── public             # Logo da CAJ
│   ├── src
│   │   ├── components     # Layout, guardas de rota e componentes compartilhados (UI)
│   │   ├── contexts       # Sessão do usuário logado (AuthContext)
│   │   ├── hooks          # Lógica de cada tela e persistência (useSessionStorage)
│   │   ├── pages          # Telas dos módulos, login e gestão de usuários
│   │   ├── routes         # Rotas da SPA (públicas, protegidas e de administrador)
│   │   ├── services       # Comunicação com a API (fetch) e bibliotecas de textos
│   │   ├── styles         # Tailwind e tokens visuais
│   │   └── utils          # Datas e dias úteis, máscaras de moeda (BRL) e IndexedDB
│   ├── .env.example
│   └── package.json
│
└── backend-caj
    ├── public             # Assets estáticos de uso interno (logo dos documentos)
    ├── scripts            # criar-admin.js (cria a tabela e o primeiro administrador)
    ├── src
    │   ├── controllers    # Camada HTTP e validação de payload
    │   ├── db             # Conexão com o Postgres e schema da tabela de usuários
    │   ├── middlewares    # Autenticação (JWT) e checagem de administrador
    │   ├── routes         # Rotas Express (/api/*)
    │   ├── services       # Regras de negócio (IA, documentos, usuários, autenticação)
    │   ├── utils          # Tratamento de dados brutos
    │   └── index.js       # Entrypoint da API e configuração de CORS
    ├── .env.example
    ├── vercel.json
    └── package.json
```

<br/>

##  → Como Rodar Localmente

**Pré-requisitos:** Node.js, NPM, um banco PostgreSQL (o projeto usa o [Supabase](https://supabase.com)) e uma chave de API do [Google AI Studio](https://aistudio.google.com/) para o módulo de IA.

**1. Clone o repositório**

```bash
git clone https://github.com/MarieleV/Notificacao-CAJ.git
cd Notificacao-CAJ
```

**2. Back-end**

```bash
cd backend-caj
npm install
```

Copie o `.env.example` para `.env` na pasta `backend-caj` e preencha:

```env
PORT=3000
JWT_SECRET=um-segredo-aleatorio-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=8h
DATABASE_URL=postgresql://usuario:senha@host:6543/postgres
ENCRYPTION_KEY=64-caracteres-hexadecimais
GEMINI_MODEL=
GEMINI_MODEL_RESERVA=
CORS_ORIGINS=
```

Para gerar a `ENCRYPTION_KEY`, que cifra a chave do Gemini de cada usuário no banco:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`GEMINI_MODEL` e `GEMINI_MODEL_RESERVA` são opcionais. Se ficarem vazias, a geração usa o `gemini-3.8-flash` e, quando ele estiver sobrecarregado ou sem cota, o `gemini-3.5-flash-lite`. Quando o Google aposentar algum deles, basta trocar o valor aqui e na Vercel.

`CORS_ORIGINS` aceita URLs separadas por vírgula. Se ficar vazia, a API aceita o front-end publicado e o `http://localhost:5173`.

Para gerar um `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Crie a tabela de usuários e o primeiro administrador (só na primeira vez):

```bash
npm run criar-admin -- admin "Nome do Administrador" "SenhaForte123"
```

Inicie a API (porta 3000 por padrão):

```bash
npm run dev     # com recarga automática
# ou
npm start
```

Mais detalhes sobre autenticação, perfis e rotas estão em [`backend-caj/INFO.md`](./backend-caj/INFO.md).

**3. Front-end** (em outro terminal)

```bash
cd front-end
npm install
```

Por padrão, o front-end chama a API publicada. Para usar a API local, crie um `.env` na pasta `front-end` (veja o `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`. Entre com o administrador criado no passo 2.

> [!NOTE]
> Cada usuário cadastra a própria chave do Gemini em **Minha chave do Gemini** (ícone ✨ no rodapé da barra lateral). Ela fica cifrada no banco e não volta para o navegador.

> [!WARNING]
> Nunca versione os arquivos `.env`. `DATABASE_URL`, `JWT_SECRET` e `ENCRYPTION_KEY` devem ficar apenas no `.env` local e nas variáveis de ambiente da Vercel.

<p align="center">
  <a href="https://github.com/MarieleV">
    <img src="https://img.shields.io/badge/Mariele%20Vieira-334155?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/mariele-vieira" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-475569?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:silvamariele797@gmail.com">
    <img src="https://img.shields.io/badge/E--mail-64748B?style=for-the-badge&logo=gmail&logoColor=white" alt="E-mail" />
  </a>
</p>
