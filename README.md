<div align="center">

# 💧 Notificação CAJ

### Sistema de Gestão Administrativa e Jurídica

<p>
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge" alt="Status: Em Desenvolvimento" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
</p>

**[🔗 Acesse o Sistema em Produção](https://notificacao-caj-7ncb.vercel.app)**

</div>

---

Sistema desenvolvido para a **Companhia Águas de Joinville (CAJ)**, com foco na automação, cálculo financeiro e redação inteligente de pareceres e notificações extrajudiciais. A aplicação garante conformidade com as resoluções da ARIS (Agência Reguladora) e otimiza o fluxo de trabalho da Ouvidoria e dos setores de fiscalização.

<div align="center">

### 🧭 Sumário

[Principais Funcionalidades](#-principais-funcionalidades) • [Tecnologias Utilizadas](#-tecnologias-utilizadas) • [Como Rodar Localmente](#-como-rodar-o-projeto-localmente) • [Variáveis de Ambiente](#-variáveis-de-ambiente) • [Estrutura do Projeto](#-estrutura-do-projeto)

</div>

---

## ✨ Principais Funcionalidades

| Funcionalidade | Descrição |
|:---:|---|
| ⚖️ **Gestão de Ouvidoria e Pareceres** | Árvore de decisão complexa para recursos (Leitura, Serviços, Violações, Ligações Clandestinas). Geração automática de minutas jurídicas com base na decisão (Deferido, Indeferido, Parcial) e regras de negócio (IN 83/2025, Fato Novo, LA Padronizada). |
| 🧮 **Calculadora de Consumo Irregular** | Motor de cálculo financeiro cruzando matrizes de tarifas históricas da ARIS e categorias de uso (Residencial, Comercial, Industrial, etc.) com o Fator de Esgoto (K1), gerando o valor correto vs. valor cobrado indevidamente. |
| ✨ **Redação Inteligente (IA)** | Integração com a Google Gemini API para consolidação e redação automatizada de notificações baseadas no Artigo 144 da ARIS. |
| 📅 **Cálculo de Dias Úteis** | Cálculo automatizado de prazos (15, 30, 60, 90 dias), pulando fins de semana e feriados conforme o calendário oficial da empresa. |
| 📄 **Exportação Oficial** | Geração de documentos prontos e formatados em `.docx` (Microsoft Word) e `.pdf`. |
| 📊 **Processamento em Lote** | Importação de planilhas (`.xlsx`, `.csv`) para busca e preenchimento automático de dados de clientes e matrículas. |

## 🛠️ Tecnologias Utilizadas

<table>
<tr>
<td width="50%" valign="top">

### Front-end
- React (com TypeScript)
- Tailwind CSS — estilização de UI
- Lucide React — ícones
- XLSX — leitura de planilhas

</td>
<td width="50%" valign="top">

### Back-end
- Node.js & Express
- `@google/generative-ai` — integração com Gemini AI
- `docx` — geração de arquivos Word
- `cors` — controle de acesso

</td>
</tr>
</table>

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado na máquina
- Uma **API Key do Google Gemini** para utilizar o gerador de IA

### 1. Configurando o Front-end

Abra um terminal e navegue até a pasta do front-end:

```bash
# Instale todas as dependências do projeto
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O front-end ficará disponível em `http://localhost:5173` (porta padrão do Vite, ajuste conforme a configuração do projeto).

### 2. Configurando o Back-end

Em um novo terminal, navegue até a pasta do back-end:

```bash
# Instale todas as dependências do projeto
npm install

# Configure as variáveis de ambiente (veja a seção abaixo)
cp .env.example .env

# Inicie o servidor
npm run start
```

O back-end ficará disponível em `http://localhost:3000` (ajuste conforme a configuração do projeto).

> ⚠️ Ajuste as portas e comandos acima conforme os scripts definidos nos respectivos `package.json` do front-end e do back-end.

## 🔐 Variáveis de Ambiente

No back-end, crie um arquivo `.env` com as seguintes variáveis:

```env
GEMINI_API_KEY=sua_chave_da_api_gemini
PORT=3000
```

> Nunca versione o arquivo `.env` — mantenha-o listado no `.gitignore`.

## 📁 Estrutura do Projeto

```
notificacao-caj/
├── frontend/        # Aplicação React + TypeScript
├── backend/         # API Node.js + Express
└── README.md
```

<div align="center">

---

Notificação CAJ — Companhia Águas de Joinville

</div>