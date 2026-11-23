<div align="center">
  <img src="https://img.icons8.com/fluency/96/water.png" alt="Ícone de Água" width="80"/>

  <h1>CAJ Sistema</h1>
  <h3>Sistema de Gestão Administrativa, Jurídica e Financeira</h3>

  <p>
    <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge" alt="Status: Em Desenvolvimento" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini" />
  </p>

  <p>
    <b><a href="https://notificacao-caj-7ncb.vercel.app">🔗 Acessar a aplicação</a></b>
  </p>
</div>

<!-- AJUSTE: confirme que você tem autorização da CAJ para divulgar o projeto e que o link público
     não expõe dados internos. -->

> 🔐 O acesso exige usuário e senha. As contas são criadas por um administrador do sistema.

---

Plataforma *full-stack* desenvolvida para a **Companhia Águas de Joinville (CAJ)**, com foco em automatizar processos internos, calcular valores de forma determinística e redigir pareceres e notificações extrajudiciais com apoio de IA. A aplicação foi construída com base nas resoluções da ARIS (Agência Reguladora) e busca reduzir o trabalho manual dos setores de Fiscalização, Atendimento e Ouvidoria.

<!-- AJUSTE: adicione 2 ou 3 prints das telas principais (ex.: Calculadora de Faturamento e Redator Inteligente)
     em uma seção "Telas". Se houver dados reais, use dados fictícios ou desfoque as informações. -->

<div align="center">

### 📑 Sumário

[Módulos Principais](#-módulos-principais) • [Diferenciais de UX e Engenharia](#-diferenciais-de-ux-e-engenharia) • [Tecnologias Utilizadas](#%EF%B8%8F-tecnologias-utilizadas) • [Estrutura do Projeto](#-estrutura-do-projeto) • [Como Rodar Localmente](#-como-rodar-o-projeto-localmente)

</div>

---

## 🚀 Módulos Principais

O sistema é dividido em 5 frentes de operação, além da gestão de usuários:

| Módulo | Descrição |
| :--- | :--- |
| ✨ **Redator Inteligente (IA)** | Integração com o **Gemini 2.5 Flash** para consolidar infrações e redigir notificações extrajudiciais (Autos de Infração), com base no Artigo 144 da Resolução ARIS nº 019/2019. Busca os dados do cliente numa planilha carregada no navegador, trabalha em lote com os casos do Controle de Análises e exporta em Word e PDF. |
| 🛡️ **Retorno de Defesa** | Módulo de *fast-track* para análise de defesas prévias e geração de respostas padronizadas, inserindo dinamicamente o número da defesa e o fundamento do indeferimento. Permite trabalhar em lote por matrícula. |
| 🧮 **Tabela de Multas** | Calculadora de diferenças de faturamento de água e esgoto: compara, mês a mês, os valores corretos (calculados fora do sistema e digitados) com os cobrados, apura a diferença a cobrar ou a restituir e gera os laudos de apuração. |
| ⏱️ **Análises Vencidas** | Cruza os relatórios OP00002, 989 Cliente e 989 CAJ do Sansys para mostrar as análises vencidas, os dias de atraso em dias úteis e os casos já padronizados. |
| ⚖️ **Ouvidoria e Recursos** | Árvore de decisão para análise de recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Geração automática de minutas com base na decisão de mérito (Deferido, Indeferido, Parcial), considerando as regras de negócio vigentes (IN 83/2025, Fatos Novos, LA Padronizada). Emissão de guias de encerramento no sistema Sansys. |
| 👥 **Usuários** (administradores) | Cadastro de usuários, perfis (administrador ou usuário), ativação e redefinição de senha. Cada usuário pode trocar a própria senha. |

---

## ⚡ Diferenciais de UX e Engenharia

A aplicação foi desenhada para aumentar a produtividade do analista:

- **Sessão persistente (anti-F5):** formulários, textos gerados e lotes de casos ficam no *Session Storage* por meio de hooks customizados; a base de clientes fica no IndexedDB e o resultado do Controle de Análises no *Local Storage*. Ao recarregar a página ou navegar entre módulos, o trabalho em andamento é preservado.
- **Trabalho em lote:** os casos filtrados no Controle de Análises podem ser importados no Redator, no Retorno de Defesa e na Tabela de Multas, com navegação caso a caso por responsável.
- **Interações de planilha (drag-to-fill):** as tabelas de cálculo permitem "arrastar" valores como no Excel para replicá-los em lote, e a navegação entre campos funciona com a tecla `Enter`.
- **Geração dinâmica de documentos:** serviços do back-end construídos com `docx` e `pdfkit` recebem requisições JSON do front-end e devolvem documentos oficiais gerados em tempo real (incluindo logo, quadros do AR e destaques em vermelho e negrito).
- **Calculadora de dias úteis:** ferramenta flutuante nas telas de Retorno de Defesa e Ouvidoria, que calcula datas-limite descontando fins de semana, feriados e emendas cadastrados.
- **Acesso controlado:** login com token JWT, senhas guardadas com hash (bcrypt) e perfis de usuário e administrador. Desativar um usuário bloqueia o acesso na hora.

---

## 🛠️ Tecnologias Utilizadas

| 🎨 Front-end (Client-Side) | ⚙️ Back-end (Server-Side) |
| :--- | :--- |
| **React 18 (TypeScript) + Vite** <br> *Framework reativo e build tool* | **Node.js + Express** <br> *Ambiente de execução e servidor HTTP* |
| **React Router v7** <br> *Roteamento para SPA* | **@google/generative-ai** <br> *SDK oficial de integração com o Gemini* |
| **Tailwind CSS v4** <br> *Estilização utilitária no JSX* | **PDFKit** <br> *Geração e desenho de PDFs* |
| **Lucide React** <br> *Biblioteca de ícones* | **Docx** <br> *Construção programática de arquivos Word* |
| **XLSX** <br> *Leitura e extração de dados de planilhas* | **PostgreSQL (Supabase) + pg** <br> *Cadastro de usuários* |
| **Fetch API** <br> *Comunicação com a API* | **jsonwebtoken + bcryptjs** <br> *Autenticação (JWT) e hash de senhas* |

> O front-end é escrito em TypeScript. O back-end está em JavaScript (Node.js).

---

## 📂 Estrutura do Projeto

O repositório é um monorepo com dois projetos independentes (front-end e back-end), o que permite deploys separados:

```text
📦 Notificacao-CAJ
 ┣ 📂 front-end
 ┃ ┣ 📂 public           # Logo da CAJ
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components     # Layout, guardas de rota e componentes compartilhados (UI)
 ┃ ┃ ┣ 📂 contexts       # Sessão do usuário logado (AuthContext)
 ┃ ┃ ┣ 📂 hooks          # Lógica de cada tela e persistência (useSessionStorage)
 ┃ ┃ ┣ 📂 pages          # Telas dos módulos, login e gestão de usuários
 ┃ ┃ ┣ 📂 routes         # Rotas da SPA (públicas, protegidas e de administrador)
 ┃ ┃ ┣ 📂 services       # Comunicação com a API (fetch) e bibliotecas de textos
 ┃ ┃ ┣ 📂 styles         # Tailwind e tokens visuais
 ┃ ┃ ┗ 📂 utils          # Datas e dias úteis, máscaras de moeda (BRL) e IndexedDB
 ┃ ┣ 📜 .env.example
 ┃ ┗ 📜 package.json
 ┃
 ┗ 📂 backend-caj
   ┣ 📂 public           # Assets estáticos de uso interno (logo dos documentos)
   ┣ 📂 scripts          # criar-admin.js (cria a tabela e o primeiro administrador)
   ┣ 📂 src
   ┃ ┣ 📂 controllers    # Camada HTTP e validação de payload
   ┃ ┣ 📂 db             # Conexão com o Postgres e schema da tabela de usuários
   ┃ ┣ 📂 middlewares    # Autenticação (JWT) e checagem de administrador
   ┃ ┣ 📂 routes         # Rotas Express (/api/*)
   ┃ ┣ 📂 services       # Regras de negócio (IA, documentos, usuários, autenticação)
   ┃ ┣ 📂 utils          # Tratamento de dados brutos
   ┃ ┗ 📜 index.js       # Entrypoint da API e configuração de CORS
   ┣ 📜 .env.example
   ┣ 📜 vercel.json
   ┗ 📜 package.json
```

---

## 💻 Como Rodar o Projeto Localmente

**Pré-requisitos:** Node.js, NPM, um banco PostgreSQL (o projeto usa o [Supabase](https://supabase.com)) e uma chave de API do [Google AI Studio](https://aistudio.google.com/) para o módulo de IA.

**1. Clone o repositório:**

```bash
git clone https://github.com/MarieleV/Notificacao-CAJ.git
cd Notificacao-CAJ
```

**2. Back-end:**

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
```

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

**3. Front-end** (em outro terminal):

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

> A chave do Gemini não vai no `.env`: cada usuário a informa no topo da tela **Redigir Notificação**, e ela fica guardada só enquanto a aba estiver aberta.

---

> ⚠️ Nunca versione os arquivos `.env`. `DATABASE_URL` e `JWT_SECRET` devem ficar apenas no `.env` local e nas variáveis de ambiente da Vercel.

---

## 📄 Licença

Distribuído sob a licença BSD 3-Clause. Veja o arquivo [LICENSE](./LICENSE).
