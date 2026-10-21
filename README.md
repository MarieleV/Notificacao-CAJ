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
     não expõe dados internos. Se houver login, mencione aqui como obter acesso de demonstração. -->

---

Plataforma *full-stack* desenvolvida para a **Companhia Águas de Joinville (CAJ)**, com foco em automatizar processos internos, calcular valores de forma determinística e redigir pareceres e notificações extrajudiciais com apoio de IA. A aplicação foi construída com base nas resoluções da ARIS (Agência Reguladora) e busca reduzir o trabalho manual dos setores de Fiscalização e Ouvidoria.

<!-- AJUSTE: adicione 2 ou 3 prints das telas principais (ex.: Calculadora de Faturamento e Redator Inteligente)
     em uma seção "Telas". Se houver dados reais, use dados fictícios ou desfoque as informações. -->

<div align="center">

### 📑 Sumário

[Módulos Principais](#-módulos-principais) • [Diferenciais de UX e Engenharia](#-diferenciais-de-ux-e-engenharia) • [Tecnologias Utilizadas](#%EF%B8%8F-tecnologias-utilizadas) • [Estrutura do Projeto](#-estrutura-do-projeto) • [Como Rodar Localmente](#-como-rodar-o-projeto-localmente)

</div>

---

## 🚀 Módulos Principais

O sistema é dividido em 4 frentes de operação:

| Módulo | Descrição |
| :--- | :--- |
| ⚖️ **Gestão de Processos e Ouvidoria** | Árvore de decisão para análise de recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Geração automática de minutas jurídicas com base na decisão de mérito (Deferido, Indeferido, Parcial), considerando as regras de negócio vigentes (IN 83/2025, Fatos Novos, LA Padronizada). Emissão de guias de encerramento no sistema Sansys. |
| 🧮 **Calculadora de Faturamento** | Motor de cálculo financeiro que cruza o volume irregular estimado com o volume faturado. Permite a inserção de múltiplos meses, apura a diferença a ser cobrada ou restituída ao cliente e gera automaticamente laudos de água e esgoto baseados no fator K1. |
| ✨ **Redator Inteligente (IA)** | Integração com o **Gemini 2.5 Flash** para consolidar infrações e redigir notificações extrajudiciais, com base no Artigo 144 da ARIS. Permite processamento em lote a partir da leitura de planilhas (`.xlsx`/`.csv`) diretamente no navegador. |
| 🛡️ **Resposta a Defesas** | Módulo de *fast-track* para análise de defesas prévias e geração de respostas padronizadas, inserindo dinamicamente variáveis de protocolo e fundamentos de indeferimento. |

---

## ⚡ Diferenciais de UX e Engenharia

A aplicação foi desenhada para aumentar a produtividade do analista:

- **Sessão persistente (anti-F5):** uso de *Session Storage* com hooks customizados. Ao recarregar a página ou navegar entre módulos, os dados, planilhas importadas, matrizes e textos gerados são preservados.
- **Interações de planilha (drag-to-fill):** as tabelas de cálculo permitem "arrastar" valores como no Excel para replicá-los em lote, e a navegação entre campos funciona com a tecla `Enter`.
- **Geração dinâmica de documentos:** serviços do back-end construídos com `docx` e `pdfkit` recebem requisições JSON do front-end e devolvem documentos oficiais gerados em tempo real (incluindo imagens, tabelas de AR e destaques em vermelho e negrito).
- **Calculadora de prazos global:** ferramenta flutuante, disponível em todas as telas, que calcula datas-limite (15, 30, 45, 60 e 90 dias) excluindo automaticamente os fins de semana.

---

## 🛠️ Tecnologias Utilizadas

| 🎨 Front-end (Client-Side) | ⚙️ Back-end (Server-Side) |
| :--- | :--- |
| **React 18 (TypeScript) + Vite** <br> *Framework reativo e build tool* | **Node.js + Express** <br> *Ambiente de execução e servidor HTTP* |
| **React Router v7** <br> *Roteamento para SPA* | **@google/generative-ai** <br> *SDK oficial de integração com o Gemini* |
| **Tailwind CSS v4** <br> *Estilização utilitária no JSX* | **PDFKit** <br> *Geração e desenho de PDFs* |
| **Lucide React** <br> *Biblioteca de ícones* | **Docx** <br> *Construção programática de arquivos Word* |
| **XLSX** <br> *Leitura e extração de dados de planilhas* | |
| **Date-fns** <br> *Manipulação de datas* | |

> O front-end é escrito em TypeScript. O back-end está em JavaScript (Node.js).

---

## 📂 Estrutura do Projeto

O repositório é um monorepo com dois projetos independentes (front-end e back-end), o que permite deploys separados:

```text
📦 Notificacao-CAJ
 ┣ 📂 front-end
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components     # Componentes de apresentação (UI)
 ┃ ┃ ┣ 📂 hooks          # Lógica reutilizável e sessão temporária (useSessionStorage)
 ┃ ┃ ┣ 📂 pages          # Páginas e orquestração dos módulos
 ┃ ┃ ┣ 📂 services       # Comunicação assíncrona (Fetch/Axios) com a API
 ┃ ┃ ┗ 📂 utils          # Funções matemáticas, máscaras de moeda (BRL) e datas
 ┃ ┗ 📜 package.json
 ┃
 ┗ 📂 backend-caj
   ┣ 📂 public           # Assets estáticos de uso interno (logo da CAJ)
   ┣ 📂 src
   ┃ ┣ 📂 controllers    # Camada HTTP e sanitização de payload
   ┃ ┣ 📂 routes         # Rotas Express (/api/*)
   ┃ ┣ 📂 services       # Regras de negócio (IA, calculadora, arquivos)
   ┃ ┗ 📂 utils          # Tratamento de dados brutos
   ┣ 📜 index.js         # Entrypoint da API e configuração de CORS
   ┗ 📜 package.json
```

---

## 💻 Como Rodar o Projeto Localmente

<!-- AJUSTE: confira os scripts dos package.json, o nome das variáveis de ambiente
     e a porta da API. Crie também um arquivo .env.example sem valores reais. -->

**Pré-requisitos:** Node.js, NPM e uma chave de API do [Google AI Studio](https://aistudio.google.com/) para o módulo de IA.

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

Crie um arquivo `.env` na pasta `backend-caj`:

```env
GEMINI_API_KEY=sua_chave_aqui
PORT=3000
```

Inicie a API:

```bash
npm start
```

**3. Front-end** (em outro terminal):

```bash
cd front-end
npm install
npm run dev
```

> ⚠️ Nunca versione o arquivo `.env`. A chave do Gemini deve ficar apenas no back-end.

---

## 📄 Licença

Distribuído sob a licença BSD 3-Clause. Veja o arquivo [LICENSE](./LICENSE).
