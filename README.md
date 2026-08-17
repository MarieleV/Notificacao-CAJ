<div align="center">
  <img src="https://img.icons8.com/fluency/96/water.png" alt="Ícone de Água" width="80"/>
  
  <h1>CAJ Sistema</h1>
  <h3>Sistema de Gestão Administrativa, Jurídica e Financeira</h3>

  <p>
    <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge" alt="Status: Em Desenvolvimento" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  </p>

  <p>
    <b><a href="https://notificacao-caj-7ncb.vercel.app">🔗 Acesse o Sistema em Produção</a></b>
  </p>
</div>

---

Plataforma *Full-Stack* desenvolvida para a **Companhia Águas de Joinville (CAJ)**, com foco na automação de processos internos, cálculo financeiro determinístico e redação inteligente de pareceres e notificações extrajudiciais. A aplicação garante conformidade estrita com as resoluções da ARIS (Agência Reguladora) e otimiza radicalmente o fluxo de trabalho dos setores de Fiscalização e Ouvidoria.

<div align="center">

### 📑 Sumário

[Módulos Principais](#-módulos-principais) • [Diferenciais de UX e Engenharia](#-diferenciais-de-ux-e-engenharia) • [Tecnologias Utilizadas](#-tecnologias-utilizadas) • [Estrutura do Projeto](#-estrutura-do-projeto) • [Como Rodar Localmente](#-como-rodar-o-projeto-localmente)

</div>

---

## 🚀 Módulos Principais

O sistema é dividido em 4 frentes principais de operação:

| Módulo | Descrição |
| :--- | :--- |
| ⚖️ **Gestão de Processos e Ouvidoria** | Árvore de decisão complexa para análise de recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Geração automática de minutas jurídicas com base na decisão de mérito (Deferido, Indeferido, Parcial) cruzando com as regras de negócio vigentes (IN 83/2025, Fatos Novos, LA Padronizada). Emissão de guias de encerramento no sistema Sansys. |
| 🧮 **Calculadora de Faturamento** | Motor de cálculo financeiro cruzando o volume irregular estimado com o volume registrado faturado. Permite a inserção de múltiplos meses, apurando a diferença exata a ser cobrada ou restituída ao cliente, renderizando de forma automática laudos de água e esgoto baseados no fator K1. |
| ✨ **Redator Inteligente (IA)** | Integração nativa com o **Gemini 2.5 Flash** para consolidação de infrações e redação automatizada de notificações extrajudiciais, embasadas no Artigo 144 da ARIS. Permite processamento em lote através da leitura de planilhas (`.xlsx`/`.csv`) direto no navegador. |
| 🛡️ **Resposta a Defesas** | Módulo de *fast-track* para análise de defesas prévias e geração de respostas padronizadas, injetando variáveis de protocolo e fundamentos específicos de indeferimento de forma dinâmica. |

---

## ⚡ Diferenciais de UX e Engenharia

A aplicação foi desenhada com foco obsessivo na produtividade do analista e performance técnica:

- **Sessão Persistente (Anti-F5):** Uso avançado de *Session Storage* com Hooks customizados. Ao recarregar a página ou transitar entre módulos, todos os dados, planilhas importadas, matrizes e textos gerados permanecem íntegros.
- **Interações Nativas (Drag-to-Fill):** As tabelas de cálculo suportam atalhos de produtividade, como o "arrastar" do Excel (para replicar valores em lote) e navegação contínua por colunas utilizando a tecla `Enter`.
- **Renderização Dinâmica de Documentos:** Microsserviços construídos com `docx` e `pdfkit` interceptam requisições JSON do Front-end para construir e devolver buffers de documentos oficiais formados em tempo real (incluindo imagens, tabelas de AR e marcações ricas em vermelho e negrito).
- **Calculadora de Prazos Global:** Ferramenta flutuante onipresente que calcula datas limite (15, 30, 45, 60, 90 dias) considerando a exclusão automática de fins de semana.

---

## 🛠️ Tecnologias Utilizadas

| 🎨 Front-end (Client-Side) | ⚙️ Back-end (Server-Side) |
| :--- | :--- |
| **React 18 (TS) + Vite** <br> *Framework reativo e build tool ultrarrápido* | **Node.js + Express** <br> *Ambiente de execução e servidor HTTP* |
| **React Router v7** <br> *Roteamento moderno para SPA* | **@google/generative-ai** <br> *SDK Oficial de integração com o Gemini* |
| **Tailwind CSS v4** <br> *Estilização utilitária diretamente no JSX* | **PDFKit** <br> *Renderização e desenho vetorial de PDFs* |
| **Lucide React** <br> *Biblioteca iconográfica leve* | **Docx** <br> *Construção programática de arquivos Word* |
| **XLSX** <br> *Leitura e extração de dados de planilhas* | |
| **Date-fns** <br> *Manipulação temporal avançada* | |

---

## 📂 Estrutura do Projeto (Monorepo Lógico)

A arquitetura do código está separada em dois ecossistemas (Front/Back) para independência de deploys e escalabilidade:

```text
📦 CAJ-Sistema
 ┣ 📂 frontend-caj
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 components     # Componentes visuais burros (Dumb Components / UI)
 ┃ ┃ ┣ 📂 hooks          # Lógica de negócio, sessão temporária (useSessionStorage)
 ┃ ┃ ┣ 📂 pages          # View components e orquestração de módulos
 ┃ ┃ ┣ 📂 services       # Comunicação assíncrona (Fetch/Axios) com a API local
 ┃ ┃ ┗ 📂 utils          # Funções matemáticas, máscaras de moeda (BRL) e datas
 ┃ ┗ 📜 package.json
 ┃
 ┗ 📂 backend-caj
   ┣ 📂 public           # Assets estáticos de uso interno (Logo CAJ)
   ┣ 📂 src
   ┃ ┣ 📂 controllers    # Camada HTTP e Sanitização de Payload
   ┃ ┣ 📂 routes         # Roteador Express (/api/*)
   ┃ ┣ 📂 services       # Core de Regra de Negócio (IA, Calculadora, Arquivos)
   ┃ ┗ 📂 utils          # Tratamento de dados brutos
   ┣ 📜 index.js         # Entrypoint da API e Configurações CORS
   ┗ 📜 package.json
