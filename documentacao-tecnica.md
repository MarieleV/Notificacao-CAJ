# Documentação Técnica: Sistema de Gestão e Notificações CAJ

*Repositório Notificacao-CAJ · Companhia Águas de Joinville · elaborada a partir da análise do código-fonte (outubro/2026)*

## 1. Visão geral

O **Notificacao-CAJ** é uma plataforma web usada pelos setores de Fiscalização, Atendimento e Ouvidoria da Companhia Águas de Joinville (CAJ) para reduzir o trabalho manual na redação de documentos regulatórios. As regras de negócio seguem a Resolução ARIS nº 019/2019 (Art. 144 e Art. 69) e a Instrução Normativa CAJ nº 83/2025, que permite rever multas quando o cliente padroniza a ligação de água.

O sistema:

- redige notificações extrajudiciais (Autos de Infração) com apoio do Google Gemini e exporta em Word e PDF;
- gera pareceres de Ouvidoria (recursos) e respostas de defesa a partir de templates e de uma árvore de decisão;
- cruza planilhas extraídas do sistema comercial (Sansys) para controlar análises vencidas e identificar casos já padronizados;
- calcula diferenças de faturamento de água e esgoto e gera os laudos de apuração.

### 1.1. Módulos (telas)

| Módulo | Rota | Finalidade |
| --- | --- | --- |
| Redigir Notificação | `/` | Seleciona códigos de infração, busca dados do cliente, gera o texto com IA e exporta o Auto de Infração |
| Retorno de Defesa | `/resposta-defesa` | Preenche um template de resposta a defesa prévia e exporta o parecer |
| Tabela de Multas | `/multas` | Calculadora de diferenças de faturamento (água e esgoto) e emissão de laudos |
| Análises Vencidas | `/controle-analises` | Cruza três planilhas e mostra prazos vencidos e casos padronizados |
| Ouvidoria e Recursos | `/ouvidoria` | Árvore de decisão que gera o parecer de recurso, com guia de tratativas no Sansys |

### 1.2. Ambientes e licença

- Front-end publicado na Vercel: `https://notificacao-caj-7ncb.vercel.app`
- API publicada na Vercel: `https://notificacao-caj.vercel.app/api`
- Licença: BSD 3-Clause. Status: em desenvolvimento.

> **Como ler este documento.** Os problemas e riscos identificados na análise estão reunidos na seção 17, numerados como PA-01, PA-02 etc. Eles são citados ao longo do texto.

## 2. Arquitetura

O projeto é um monorepo com duas aplicações independentes, que podem ser publicadas separadamente.

- **Front-end** (`/front-end`): SPA em React + TypeScript. Concentra a interface, a leitura de planilhas, os cálculos do dia a dia e a montagem da maior parte dos textos.
- **Back-end** (`/backend-caj`): API REST em Node.js (Express 5, CommonJS), sem estado e sem banco de dados, executada como função serverless na Vercel. Faz apenas o que não convém fazer no navegador: chamar a IA e desenhar os arquivos Word e PDF.

```
Navegador (SPA React)  ──fetch / JSON──►  API Express (Vercel)  ──►  Google Gemini 2.5 Flash
  │ sessionStorage · localStorage · IndexedDB       │
  │ planilhas .xlsx lidas no próprio navegador       └─ docx e pdfkit ──► arquivo (Blob) ──► download
```

### 2.1. Onde cada dado fica

Não há banco de dados. Todo o estado do usuário fica no navegador:

| Armazenamento | Duração | O que guarda |
| --- | --- | --- |
| Memória (RAM) | Até recarregar a página | Planilhas brutas do Controle de Análises; textos temporários da calculadora |
| `sessionStorage` | Enquanto a aba estiver aberta | Formulários das telas, texto gerado, chave do Gemini, lote de casos do Redator |
| `localStorage` | Sem prazo de expiração | Estado do Controle de Análises (chave `@ControleAnalises:state`) |
| IndexedDB (`redator-db`) | Sem prazo de expiração | Base de dados de clientes carregada no Redator |

A seção 9 detalha esse modelo. Ele tem implicações de privacidade (PA-12 e PA-14).

### 2.2. Decisões de arquitetura

- **Roteamento por hash** (`createHashRouter`): as URLs têm a forma `/#/multas`, o que dispensa regras de reescrita no servidor de hospedagem.
- **Lógica separada da interface:** cada tela tem um hook dedicado em `hooks/` com estado, regras e ações; o arquivo da tela só renderiza.
- **Back-end sem estado:** cada requisição traz tudo de que precisa (texto final, dados do cliente, chave da IA).
- **Textos montados no front-end:** os pareceres da Ouvidoria e das defesas são templates em TypeScript; a IA só é usada na tela de notificações.

## 3. Stack tecnológico

### 3.1. Front-end

| Item | Uso |
| --- | --- |
| React 18, TypeScript, Vite 6 | Base da SPA e build |
| React Router 7 | Roteamento (`createHashRouter`, `Outlet`, `NavLink`) |
| Tailwind CSS 4 (plugin do Vite) + `tw-animate-css` | Estilização por classes utilitárias |
| Lucide React | Ícones |
| `xlsx` (SheetJS) | Leitura de planilhas no navegador |
| `fetch` nativo | Comunicação com a API |

### 3.2. Back-end

| Item | Uso |
| --- | --- |
| Node.js + Express 5 + `cors` | Servidor HTTP e CORS |
| `@google/generative-ai` | SDK do Gemini |
| `docx` | Geração de arquivos Word |
| `pdfkit` | Geração de arquivos PDF |
| Vercel (`@vercel/node`, `vercel.json`) | Deploy serverless |

### 3.3. Dependências instaladas sem uso identificado

O `package.json` do front-end vem de um template (o nome do pacote é `@figma/my-make-file`) e traz muitas bibliotecas que não aparecem em nenhum arquivo analisado: Material UI e Emotion, a maioria dos pacotes Radix, `react-hook-form`, `date-fns`, `recharts`, `react-dnd`, `react-slick`, `sonner`, `vaul`, `jspdf` e `jspdf-autotable`, entre outras. As datas são tratadas por `utils/dates.ts`, escrito à mão, e os PDFs são gerados no back-end. Veja PA-17.

## 4. Estrutura do repositório

```
Notificacao-CAJ
├─ backend-caj
│  ├─ public/logo-docx-vale.jpg        logo usado nos documentos
│  ├─ src
│  │  ├─ index.js                      entrada do Express
│  │  ├─ routes/indexRoutes.js         rotas /api/*
│  │  ├─ controllers/                  aiController, calculatorController, documentController
│  │  ├─ services/                     aiService, calculatorService, documentService
│  │  └─ utils/formatters.js
│  ├─ vercel.json · package.json
└─ front-end
   ├─ index.html · vite.config.ts · package.json
   ├─ public/logo.resolucao.boa.(png|jpg)
   └─ src
      ├─ main.tsx · App.tsx
      ├─ routes/routes.ts
      ├─ pages/                        5 telas + Pagina404
      ├─ hooks/                        6 hooks (um por tela + useSessionStorage)
      ├─ components/                   Layout, shared/ (4), ouvidoria/ (1), ui/
      ├─ services/                     api, notificacoes, defesas, ouvidoria, tarifas
      ├─ utils/                        dates, masks, kvStorage, funcionarios
      └─ styles/                       index.css, tailwind.css, theme.css
```

A pasta `components/ui` não foi analisada e não é usada pelas telas descritas aqui.

## 5. Back-end (`backend-caj`)

### 5.1. Entrada e rotas

`src/index.js` cria o app Express, ativa o CORS para qualquer origem (`*`), habilita JSON no corpo e monta as rotas sob `/api`. O servidor só escuta uma porta (padrão 3000) quando o arquivo é executado diretamente; na Vercel o app é exportado como função.

| Método e rota | Controller | Usada por |
| --- | --- | --- |
| `POST /api/gerar` | `aiController.generateNotification` | Redator de Notificação |
| `POST /api/exportar_word` | `exportInfracaoWord` | Redator de Notificação |
| `POST /api/exportar_pdf` | `exportInfracaoPdf` | Redator de Notificação |
| `POST /api/exportar_parecer_word` | `exportParecerWord` | Ouvidoria e Retorno de Defesa |
| `POST /api/exportar_parecer_pdf` | `exportParecerPdf` | Ouvidoria e Retorno de Defesa |
| `POST /api/calcular_multa` | `calculatorController.calculate` | **Nenhuma tela** (legado, PA-02) |

### 5.2. Controllers

Os controllers só validam a entrada e traduzem o resultado em resposta HTTP. Erros saem como `{ detail: mensagem }` com status 400 (entrada inválida) ou 500 (falha interna).

- `generateNotification`: exige `api_key` e `textos_base` (lista). Repassa `dataConstatacao`, `protocolo`, `funcionario` e `equipe` ao serviço de IA.
- Exportação de parecer: exige `texto_final`; usa `tipoCaso` apenas no nome do arquivo do cabeçalho `Content-Disposition`. Os demais campos enviados pelas telas (`protocolo`, `numeroProcesso`, `decisao` etc.) são ignorados. Por isso as telas de Ouvidoria e de Defesa podem enviar payloads diferentes para as mesmas rotas.
- Exportação de Auto de Infração: exige `texto_final` e repassa o corpo inteiro ao serviço.

### 5.3. Serviço de IA (`aiService.js`)

Usa o modelo **gemini-2.5-flash**. A chave de API não vem de variável de ambiente: é a chave que o próprio usuário digita na tela, enviada no corpo da requisição.

O prompt instrui o modelo a agir como assistente jurídico e a **consolidar** as infrações selecionadas num formato obrigatório, sem saudações:

1. Descrição do fato gerador
2. Dispositivo legal infringido
3. Data da constatação, Protocolo, Funcionário e Equipe (preenchidos pelo código com os metadados, ou “Não informada/o”)
4. Penalidade prevista

Quando há mais de uma infração, o modelo deve somar as informações nos campos 1, 2 e 4 de forma coesa. A resposta é devolvida como texto simples (`texto_gerado`). Observação sobre os códigos 20013 e 20419, que têm formato diferente: PA-18.

### 5.4. Serviço de documentos (`documentService.js`)

Desenha os arquivos do zero, sem templates do Word. Há dois tipos de documento.

**Parecer (Ouvidoria e Defesa)** – `buildParecerWord` e `buildParecerPdf`. Documento simples: o `texto_final` linha a linha, A4, margem de cerca de 2 cm, fonte 11 pt (Arial no Word, Helvetica no PDF), texto justificado.

**Auto de Infração** – `buildInfracaoWord` e `buildInfracaoPdf`. Documento estruturado em quadros:

1. Cabeçalho com logo, “COMPANHIA ÁGUAS DE JOINVILLE”, “AUTO DE INFRAÇÃO - CFC” e data e hora de geração (fuso America/Sao\_Paulo).
2. Quadro de dados do cliente: matrícula, categoria, nº do hidrômetro, cliente, endereço, bairro, localização e CEP.
3. Texto da infração (o `texto_final` revisado), o parágrafo de **Defesa** (prazo de 15 dias úteis, contraditório e ampla defesa) e os **canais de atendimento** (textos fixos no código).
4. Quadro do destinatário.
5. **Aviso de Recebimento (AR)** com tentativas, nome legível, documento e data de recebimento.

Campos de cliente não informados saem como marcadores (`{NOME_CLIENTE_MORADOR}`, `{AUTO_INFRACAO}` etc.). No PDF o desenho usa coordenadas absolutas (PA-20).

**Regras de formatação do texto** (compartilhadas por Word e PDF):

- `**texto**` vira negrito.
- Linhas que começam com `01.`, `02.`, `03.`, `I –`, `II –`, `III –`, `IV –`, `V –`, `OBJETO:` ou `DECISÃO:` ficam inteiras em negrito (apenas no parecer; PA-08).
- `[EDIÇÃO PECULIAR]` e `<adicionar fato novo ao processo>` são marcadores de revisão e saem em vermelho (com diferenças entre Word, PDF e tela; PA-07).
- O logo é lido de `public/logo-docx-vale.jpg`; se o arquivo não for encontrado, o documento é gerado sem ele (PA-16).

### 5.5. Calculadora no back-end (`calculatorService.js`) – legado

Recebe tarifas de serviço por vigência, faixas de consumo (`m3Tiers`), linhas de água e de esgoto e o fator K1. Para cada mês calcula o valor da água faixa a faixa, soma a tarifa de serviço e compara com o valor cobrado. O esgoto é 80% do valor correto da água multiplicado pelo fator K1. Devolve linhas, totais e dois textos de laudo. **Nenhuma tela chama essa rota hoje**; a tela de multas calcula tudo no navegador (seção 12.3). Ver PA-02.

### 5.6. Utilitários (`formatters.js`)

| Função | O que faz |
| --- | --- |
| `parseBRL` | Converte texto em formato brasileiro (`1.234,56`, com ou sem `R$`) em número; devolve 0 se inválido |
| `parseMonthYear` | Converte `MM/AAAA` em um inteiro (ano × 12 + mês) para comparação |
| `isWithinRange` | Verifica se um mês está dentro de um intervalo; fim vazio significa vigência em aberto |
| `formatBRL` | Formata número como `R$ 1.234,56` |

### 5.7. Deploy

O `vercel.json` usa `@vercel/node` com `src/index.js` como entrada, roteia todas as requisições para ele e repete os cabeçalhos de CORS (que o Express também aplica). O arquivo `.env` existe, mas está vazio: o back-end não usa variáveis de ambiente.

## 6. Camada de serviços do front-end (`src/services`)

### 6.1. `api.ts`

Concentra as chamadas à API (`BASE_URL = https://notificacao-caj.vercel.app/api`, fixa no código; PA-16).

| Função | Rota | Retorno |
| --- | --- | --- |
| `gerarNotificacaoApi` | `/gerar` | JSON com `texto_gerado` |
| `exportarWordApi` / `exportarPdfApi` | `/exportar_word` e `/exportar_pdf` | `Blob` |
| `exportarParecerWord` / `exportarParecerPDF` | `/exportar_parecer_word` e `/exportar_parecer_pdf` | `Blob` |

Os tipos `GerarNotificacaoPayload`, `ExportarDocumentoPayload` e `ExportarParecerPayload` descrevem os corpos enviados. Em caso de erro HTTP, todas as funções lançam uma mensagem genérica e descartam o `detail` devolvido pela API (PA-15).

### 6.2. `notificacoes.ts`

Biblioteca de **24 códigos de infração** (`INFRACTION_CODES`), cada um com `code`, `title`, `category`, `clauseMulta` e `clauseMultaCP`.

- `clauseMulta`: descrição do fato, dispositivo legal (quase todos no Art. 144 da Resolução 019/2019) e penalidade de multa.
- `clauseMultaCP`: a mesma cláusula acrescida da **padronização obrigatória** da ligação em 90 dias úteis (Art. 144, § 3º), com a advertência de multa adicional por não padronização.
- Os códigos incluem `20400` a `20418`, uma variante `20402 HD`, os códigos de acesso `20011` (serviços) e `20012` (leitura, com o marcador `[INFORMAR MESES SEM ACESSO]`), `20013` (notificação de atualização cadastral) e `20419` (recusa de atualização cadastral).
- `CATEGORY_COLORS` associa cada categoria a uma cor de etiqueta: fraude (vermelho), infraestrutura (laranja), uso (verde), acesso (azul) e cadastral (roxo).

### 6.3. `defesas.ts`

Contém **21 templates** de resposta (`DEFESAS_TEMPLATES`: os códigos `20400` a `20419`, exceto `20402 HD`, mais um modelo genérico de código `Prazo` para prorrogação) e as funções de exportação de parecer.

Cada template começa por `Defesa A.I. nº {DEFESA_AI}`, cita o inciso do Art. 144 aplicável, traz o marcador `[descrever aqui o fundamento específico para a decisão]` e lista as penalidades mantidas com valores `R$ XXX,XX` a preencher. A hook substitui `{DEFESA_AI}` e o fundamento; o restante é revisado pelo operador. Este arquivo repete `CATEGORY_COLORS`, a URL da API e as funções `exportarParecerWord/PDF` (PA-09, PA-10 e PA-11).

### 6.4. `ouvidoria.ts`

Só tipos que regem o fluxo da Ouvidoria:

- `DecisaoType`: `deferir`, `indeferir`, `parcial` ou `null`.
- `TipoCasoType`: `leitura`, `servico`, `corte_cavalete`, `hd`, `bypass`, `clandestina`, `la_padronizada`, `la_cadastral`, `prorrogacao`.
- `DefesaType`: `com_defesa` ou `sem_defesa`.

### 6.5. `tarifas.ts` – sem uso

O próprio arquivo avisa: *não está em uso, mas mantido para referência*. Guarda tarifas de água por vigência (de 01/03/2023 em diante), com tarifa de serviço e faixas de consumo para Residencial (e suas variantes sociais), Comercial, Entidade Beneficente, Industrial e Pública, além da tabela de fator K1 (esgoto) com 32 atividades, de 1,00 (casas) a 1,68 (indústria da construção e aterro sanitário). Alimentava a calculadora antiga (PA-02).

## 7. Utilitários do front-end (`src/utils`)

### 7.1. `dates.ts`

- **Rótulos:** `MONTHS_SHORT` e `WEEKDAYS_SHORT`, usados pelos seletores de data.
- **Dias úteis:** `isNonBusinessDay`, `addBusinessDays` e `businessDaysBetween` descartam sábados, domingos e as datas de um `Set` com feriados e emendas, de 30/08/2025 a 31/12/2027 (PA-06).
- **Conversão:** `parseFullDate` (`DD/MM/AAAA`, validando o calendário), `formatFullDate`, `labelFullDate`, `parseMonthYear` (`MM/AAAA`), `formatMonthYear` e `labelMonth`.
- **Regras de negócio:** `calculateEndDate` (data inicial + N dias úteis), `get60BusinessDaysFromToday` (hoje + 60 dias úteis, usado nas prorrogações de padronização) e `getBusinessDaysDifference` (dias úteis entre duas datas, em qualquer ordem; devolve 0 se uma data for inválida, PA-05).

### 7.2. `masks.ts`

`maskMonthYear` (digitação livre para `MM/AAAA`), `maskBRL` (`1360` vira `13,60`), `fmtBRL` (formato `R$` completo) e `formatName` (capitaliza nomes e mantém “da”, “de”, “do”, “das”, “dos” e “e” em minúsculo).

### 7.3. `kvStorage.ts`

Camada assíncrona sobre IndexedDB (banco `redator-db`, loja `kv`) com `kvSet` e `kvGet`. Hoje guarda apenas a base de clientes do Redator.

### 7.4. `funcionarios.ts`

Lista fixa de 29 funcionários (`matricula` numérica e `nome`) embutida no código, usada nos campos de busca de funcionário do Redator e da Ouvidoria (PA-14).

## 8. Navegação, layout e estilos

### 8.1. Roteamento

`main.tsx` monta o React e importa `styles/index.css`; `App.tsx` apenas renderiza o `RouterProvider`. As rotas (`routes/routes.ts`) usam `createHashRouter`: o `Layout` é a rota raiz e as telas são filhas dele.

| Caminho | Tela |
| --- | --- |
| `/` (index) | `RedatorNotificacao` |
| `/resposta-defesa` | `RespostaDefesa` |
| `/multas` | `CalculadoraMulta` |
| `/controle-analises` | `ControleAnalises` |
| `/ouvidoria` | `ProcessoOuvidoria` |
| `*` | `Pagina404` (precisa ser sempre a última rota) |

### 8.2. Layout (`components/Layout.tsx`)

Barra lateral escura e recolhível (largura de 16 rem para 5 rem, com transição), com logo, descrição do sistema, cinco itens de menu e um rodapé “Dep. Atendimento”. O conteúdo da rota aparece no `<Outlet />`, com rolagem própria. Quando recolhida, os itens mostram só o ícone e o nome aparece como dica ao passar o mouse.

| Rótulo no menu | Subtítulo | Título da tela |
| --- | --- | --- |
| Redigir Notificação | Assistente de IA | Redigir Notificação Extrajudicial |
| Retorno de Defesa | Pareceres de Resposta | Redigir Resposta de Defesa |
| Tabela de Multas | Cálculo e Referência | Cálculo de Diferenças de Faturamento |
| Análises Vencidas | Controle de Prazos | Controle de Análises Vencidas |
| Ouvidoria e Recursos | Análise de Processos | Análise de Processos e Ouvidoria |

### 8.3. Página 404

Ícone, texto explicativo e dois botões: **Voltar** (`navigate(-1)`) e **Ir para o Início** (link para `/`). Como é filha do `Layout`, aparece dentro da barra lateral (PA-19).

### 8.4. Estilos

- `index.css` importa `tailwind.css` e `theme.css`.
- `tailwind.css` carrega o Tailwind 4 com `source(none)` e declara explicitamente os arquivos a varrer (`@source '../**/*.{js,ts,jsx,tsx}'`), além do `tw-animate-css`.
- `theme.css` traz o tema padrão do shadcn/ui: variáveis de cor claras e escuras (`.dark`), o bloco `@theme inline` e estilos base de tipografia para `h1` a `h4`, `label`, `button` e `input`. O modo escuro não é ativado em lugar nenhum.
- A identidade visual real está em cores fixas nas classes das telas: azul `#1a5fa8` (ações e destaques), `#154d8a` (hover), `#0b1e35` (títulos e botões escuros), `#071527` e `#1a3a5c` (barra lateral), `#eef6ff` (realces) e `#f0f4f8` (fundo da área de conteúdo).
- A classe `animate-fadeIn`, usada no `Layout` e em vários blocos, não está definida em nenhum CSS recebido (PA-19).

## 9. Persistência de estado

### 9.1. `useSessionStorage`

Hook genérico que se comporta como `useState`, mas lê o valor inicial do `sessionStorage` e grava a cada mudança (em JSON). Falhas de leitura ou gravação geram apenas um aviso no console. Cada tela usa um prefixo de chave próprio.

### 9.2. O que cada tela guarda e onde

| Tela | Armazenamento | Conteúdo | Não persiste |
| --- | --- | --- | --- |
| Redator | `sessionStorage` (`redator_*`) | Chave do Gemini, etapa, texto gerado, códigos, variante, dados do formulário, lote de casos (`excelDataResp`) | Estados visuais (menus abertos, carregando) |
| Redator | IndexedDB (`baseCliente`) | Base de dados de clientes carregada da planilha | – |
| Retorno de Defesa | `sessionStorage` (`defesa_*`) | Etapa, código, nº da defesa, motivo, texto gerado, parâmetros da calculadora de prazos | Modo preview/edição |
| Tabela de Multas | `sessionStorage` (`calc_*`) | Linhas de água e esgoto, períodos, nº do AI, data da retirada, consumo base e referência | Textos dos laudos |
| Ouvidoria | `sessionStorage` (`ouv_*`, mais de 40 chaves) | Fluxo, campos do processo, variáveis dos templates, opções da guia Sansys, calculadora de prazos | Etapa e **texto gerado** |
| Análises Vencidas | `localStorage` (`@ControleAnalises:state`) | Nomes dos arquivos, resultados processados, resultados filtrados, filtros e ordenação | Planilhas brutas (só em memória) |

Consequências práticas: ao recarregar a página, o Controle de Análises mantém a tabela de resultados, mas exige novo upload das planilhas para reprocessar; a Ouvidoria mantém os campos preenchidos, mas o texto gerado se perde.

Todas as telas têm um botão **Limpar** com confirmação. No Redator, ele limpa o formulário e preserva as planilhas carregadas; no Controle de Análises, remove também a chave do `localStorage`. Riscos de volume e privacidade: PA-12 e PA-14.

## 10. Hooks (`src/hooks`)

Cada tela tem um hook que concentra estado, regras e ações. O componente da tela só lê o que o hook devolve.

### 10.1. `useRedatorNotificacao`

- **Base de clientes.** A planilha é lida no navegador e cada linha é mapeada por nome de coluna (expressões regulares) para `matricula`, `morador`, `endereco`, `bairro`, `cep`, `localizacao`, `ativEconomica` e `numeroHidrometro`; linhas sem matrícula são descartadas. O resultado fica num cache de módulo e no IndexedDB. Ao abrir a tela, o hook restaura a base do IndexedDB (`baseHydrated` indica o fim da leitura).
- **Lote de casos.** Pode vir de uma planilha própria ou do botão **Importar do Controle de Análises**, que lê `@ControleAnalises:state` do `localStorage` (prefere `resultadosFiltrados`, senão usa `resultados`) e converte cada item em Matrícula, Responsável, Código e Status (PA-13). As colunas de responsável e de matrícula são descobertas por nome. O usuário escolhe um responsável e navega pelos casos dele (`navegarCaso`, de forma circular); casos já exportados são marcados como processados.
- **Validações antes de gerar.** Pelo menos um código; chave do Gemini; matrícula, data da constatação, protocolo, funcionário e equipe preenchidos (e meses sem acesso, se houver o código 20012); e a matrícula digitada precisa ter sido buscada na base.
- **Geração.** Para cada código escolhe `clauseMulta` ou `clauseMultaCP` conforme a variante, troca `[INFORMAR MESES SEM ACESSO]` por “N meses sem acesso” no 20012 e envia tudo à API.
- **Exportação.** Exige o nº do Auto de Infração, envia texto, dados do cliente e identificadores, baixa `Notificacao_<matrícula>.docx` ou `.pdf` e marca a matrícula como processada.

### 10.2. `useRespostaDefesa`

- Aceita **um único código** por vez (selecionar outro substitui o anterior; selecionar o mesmo desmarca).
- Exige o nº da Defesa A.I. Ao gerar, substitui `{DEFESA_AI}` e, se informado, o marcador do fundamento do indeferimento. O texto continua com `R$ XXX,XX`, `XX/XX/XXXX` e a alternativa “indeferida/deferida parcialmente” para o operador resolver na revisão.
- Contém a calculadora de dias úteis (prazo de 15 dias ou personalizado, a partir de uma data).
- Exporta Word e PDF por `services/defesas.ts` com o nome `Resposta_Defesa_<data>`.

### 10.3. `useCalculadoraMulta`

- Mantém duas tabelas (água e esgoto) de `ManualRow`: mês, consumo regular, consumo irregular, valor correto, serviço correto, valor cobrado e serviço cobrado. Os valores corretos são calculados fora do sistema e digitados.
- `handleGeneratePeriod` cria uma linha por mês de um período (`MM/AAAA a MM/AAAA`), sem duplicar meses existentes. `addRow`, `removeRow` e `changeRow` editam linhas, aplicando máscaras (moeda, mês/ano, números). `applyFillRange` replica um valor numa faixa de linhas (arrastar como no Excel).
- `calculateResults` calcula, por linha, total correto, total cobrado, diferença e o volume recuperado (consumo regular menos consumo irregular), e soma os totais.
- `handleGenerateText` monta o laudo de água ou de esgoto com os dados complementares (nº do AI, data da retirada, maior consumo após a regularização e referência); campos vazios saem como marcadores entre colchetes. Detalhe do identificador das linhas: PA-01.

### 10.4. `useControleAnalises`

- Recebe três planilhas: **OP00002** (obrigatória, as análises), **989 Cliente** (situação do serviço para o cliente) e **989 CAJ** (situação e códigos de encerramento da OS na CAJ). As colunas são localizadas por vários nomes possíveis.
- `processarDados` descarta serviços cujo código não tem prazo cadastrado e calcula, para cada análise, dias úteis transcorridos, atraso, situação (No Prazo ou Vencida) e se está **padronizada** (regras na seção 12.4).
- Filtra por busca global, códigos (separados por vírgula), funcionário, situação, status do cliente e situação da OS (múltipla escolha), e ordena por qualquer coluna (`requestSort`).
- Grava resultados, filtros e ordenação no `localStorage` a cada alteração.

### 10.5. `useProcessoOuvidoria`

O maior hook do sistema. Concentra:

- os campos do processo e as variáveis dos templates;
- as **flags derivadas** do caso (`isLeitura`, `isServico`, `isCorte`, `isRecursoLSTC`, `isFatoNovo`, `isParcial`, `isIndeferir` etc.) e as flags de visibilidade (`showDataGeracaoAI`, `showMesesSemAcesso`, `showDataRecebimentoAR` etc.), que mostram na tela só os campos que o template escolhido usa; as seções 3 a 5 são numeradas dinamicamente;
- `isForaDoPrazo`: verdadeiro quando passam mais de 30 dias úteis entre a emissão da fatura e a manifestação (prazo de revisão da IN 83/2025);
- `handleTipoCasoChange` e `handleDecisaoChange`, que limpam as escolhas que deixam de fazer sentido;
- `handleGenerateParecer`, que escolhe e preenche o template (seção 13);
- `getParte1Text` e `getParte2Text`, que montam os textos de tratativa no Sansys;
- pré-visualização com negrito (`**texto**`) e destaque vermelho de `[EDIÇÃO PECULIAR]`; ao copiar, os marcadores `**` são removidos;
- exportação Word e PDF com o nome `Parecer_<tipoCaso>_<processo ou matrícula>`;
- a calculadora de dias úteis, que fecha ao clicar fora.

## 11. Componentes

### 11.1. Compartilhados (`components/shared`)

| Componente | Função |
| --- | --- |
| `DatePicker` | Seletor de data completa (`DD/MM/AAAA`) com calendário em popover |
| `MonthYearPicker` | Seletor de um mês/ano (`MM/AAAA`), em tamanho `sm` ou `md` |
| `MonthYearRangePicker` | Seletor de período; guarda `MM/AAAA a MM/AAAA` e exibe “Jan/2026 até Mar/2026” |
| `SectionBlock` | Cartão com cabeçalho numerado (ou com ícone), título, descrição e ação à direita |

Os três seletores fecham ao clicar fora e unificaram implementações que antes estavam duplicadas nas telas.

### 11.2. Ouvidoria (`components/ouvidoria`)

`EditableCopyBlock` mostra um texto sugerido num campo editável com botões **Copiar** e **Desfazer Edição**. Enquanto o usuário não edita, o texto acompanha as mudanças do formulário; depois de editado, deixa de ser sobrescrito. É usado na guia Sansys.

### 11.3. Definidos dentro das telas

- `ComponenteProtegido`: *error boundary* usado no Redator e no Controle de Análises; em caso de erro, mostra um aviso com botão para recarregar em vez de uma tela em branco.
- `FeedbackModal` (Redator e Controle): janela de sucesso, aviso ou erro para uploads e importações.
- Cartões de indicador (KPI) na Calculadora e no Controle de Análises.
