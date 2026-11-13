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
     não expõe dados internos. Se houver login, mencione aqui como obter acesso de demonstração. -->

---

<p align="center">
Plataforma <i>full-stack</i> desenvolvida para a <b>Companhia Águas de Joinville (CAJ)</b>, com foco em automatizar processos internos, calcular valores de forma determinística e redigir pareceres e notificações extrajudiciais com apoio de IA. A aplicação foi construída com base nas resoluções da ARIS (Agência Reguladora) e busca reduzir o trabalho manual dos setores de Fiscalização e Ouvidoria.
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
      <h3>Gestão de Processos e Ouvidoria</h3>
      <p>Árvore de decisão para análise de recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Gera minutas jurídicas a partir da decisão de mérito (Deferido, Indeferido, Parcial), considerando as regras vigentes (IN 83/2025, Fatos Novos, LA Padronizada), e emite guias de encerramento no sistema Sansys.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Calculadora de Faturamento</h3>
      <p>Motor de cálculo que cruza o volume irregular estimado com o volume faturado. Aceita múltiplos meses, apura a diferença a cobrar ou restituir ao cliente e gera laudos de água e esgoto com base no fator K1.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Redator Inteligente (IA)</h3>
      <p>Integração com o <b>Gemini 2.5 Flash</b> para consolidar infrações e redigir notificações extrajudiciais com base no Artigo 144 da ARIS. Processa lotes a partir de planilhas <code>.xlsx</code>/<code>.csv</code> lidas diretamente no navegador.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Resposta a Defesas</h3>
      <p>Módulo <i>fast-track</i> para análise de defesas prévias e geração de respostas padronizadas, com inserção dinâmica de variáveis de protocolo e fundamentos de indeferimento.</p>
    </td>
  </tr>
</table>

<br/>

##  → Diferenciais de UX e Engenharia

- **Sessão persistente (anti-F5):** *Session Storage* com hooks customizados preserva dados, planilhas importadas, matrizes e textos gerados ao recarregar a página ou trocar de módulo.
- **Interações de planilha (drag-to-fill):** as tabelas de cálculo permitem arrastar valores como no Excel, e a navegação entre campos funciona com `Enter`.
- **Geração dinâmica de documentos:** serviços com `docx` e `pdfkit` recebem JSON do front-end e devolvem documentos oficiais em tempo real (com imagens, tabelas de AR e destaques em vermelho e negrito).
- **Calculadora de prazos global:** ferramenta flutuante, disponível em todas as telas, que calcula datas-limite (15, 30, 45, 60 e 90 dias) excluindo fins de semana.

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
        <img src="https://cdn.simpleicons.org/vercel/CBD5E1" width="40" height="40" alt="Vercel"/><br/>Vercel
      </td>
      <td align="center">
        <img src="https://cdn.simpleicons.org/git/CBD5E1" width="40" height="40" alt="Git"/><br/>Git
      </td>
    </tr>
  </table>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/PDFKit-334155?style=flat-square" alt="PDFKit" />
  <img src="https://img.shields.io/badge/Docx-334155?style=flat-square" alt="Docx" />
  <img src="https://img.shields.io/badge/XLSX-334155?style=flat-square" alt="XLSX" />
  <img src="https://img.shields.io/badge/date--fns-334155?style=flat-square" alt="date-fns" />
  <img src="https://img.shields.io/badge/@google%2Fgenerative--ai-334155?style=flat-square" alt="@google/generative-ai" />
</p>

<p align="center"><sub>O front-end é escrito em TypeScript. O back-end está em JavaScript (Node.js).</sub></p>

<br/>

##  → Estrutura do Projeto

Monorepo com dois projetos independentes (front-end e back-end), o que permite deploys separados:

```text
Notificacao-CAJ
├── front-end
│   ├── src
│   │   ├── components     # Componentes de apresentação (UI)
│   │   ├── hooks          # Lógica reutilizável e sessão temporária (useSessionStorage)
│   │   ├── pages          # Páginas e orquestração dos módulos
│   │   ├── services       # Comunicação assíncrona (Fetch/Axios) com a API
│   │   └── utils          # Funções matemáticas, máscaras de moeda (BRL) e datas
│   └── package.json
│
└── backend-caj
    ├── public             # Assets estáticos de uso interno (logo da CAJ)
    ├── src
    │   ├── controllers    # Camada HTTP e sanitização de payload
    │   ├── routes         # Rotas Express (/api/*)
    │   ├── services       # Regras de negócio (IA, calculadora, arquivos)
    │   └── utils          # Tratamento de dados brutos
    ├── index.js           # Entrypoint da API e configuração de CORS
    └── package.json
```

<br/>

##  → Como Rodar Localmente

<!-- AJUSTE: confira os scripts dos package.json, o nome das variáveis de ambiente
     e a porta da API. Crie também um arquivo .env.example sem valores reais. -->

**Pré-requisitos:** Node.js, NPM e uma chave de API do [Google AI Studio](https://aistudio.google.com/) para o módulo de IA.

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

Crie um arquivo `.env` na pasta `backend-caj`:

```env
GEMINI_API_KEY=sua_chave_aqui
PORT=3000
```

Inicie a API:

```bash
npm start
```

**3. Front-end** (em outro terminal)

```bash
cd front-end
npm install
npm run dev
```

> [!WARNING]
> Nunca versione o arquivo `.env`. A chave do Gemini deve ficar apenas no back-end.

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
