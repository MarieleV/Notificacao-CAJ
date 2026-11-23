# Documentação Técnica: Sistema de Gestão e Notificações CAJ

*Repositório Notificacao-CAJ · Companhia Águas de Joinville · elaborada a partir da análise do código-fonte (outubro/2026) e atualizada em novembro/2026*

## 1. Visão geral

O **Notificacao-CAJ** é uma plataforma web usada pelos setores de Fiscalização, Atendimento, Notificação e Ouvidoria da Companhia Águas de Joinville (CAJ) para reduzir o trabalho manual na redação de documentos regulatórios. As regras de negócio seguem a Resolução ARIS nº 019/2019 (Art. 144 e Art. 69) e a Instrução Normativa CAJ nº 83/2025, que permite rever multas quando o cliente padroniza a ligação de água.

O sistema:

- Redige notificações extrajudiciais (Autos de Infração) com apoio do Google Gemini e exporta em Word e PDF;
- Gera pareceres de Ouvidoria (recursos) e respostas de defesa a partir de templates e de uma árvore de decisão;
- Cruza planilhas extraídas do sistema comercial (Sansys) para controlar análises vencidas e identificar casos já padronizados;
- Calcula diferenças de faturamento de água e esgoto e gera os laudos de apuração.

### 1.1. Módulos (telas)

| Módulo | Rota | Finalidade |
| --- | --- | --- |
| Redigir Notificação | `/` | Seleciona códigos de infração, busca dados do cliente, gera o texto com IA e exporta o Auto de Infração |
| Retorno de Defesa | `/resposta-defesa` | Preenche um template de resposta a defesa prévia e exporta o parecer |
| Tabela de Multas | `/multas` | Calculadora de diferenças de faturamento (água e esgoto) e emissão de laudos |
| Análises Vencidas | `/controle-analises` | Cruza três planilhas e mostra prazos vencidos e casos padronizados |
| Ouvidoria e Recursos | `/ouvidoria` | Árvore de decisão que gera o parecer de recurso, com guia de tratativas no Sansys |
| Usuários (só administradores) | `/usuarios` | Cadastro de usuários, perfis, ativação e redefinição de senha |

Todas as telas exigem login (`/login`). Usuário e senha ficam no banco do back-end (seção 5.7).

### 1.2. Ambientes e licença

- Front-end publicado na Vercel: `https://notificacao-caj-7ncb.vercel.app`
- API publicada na Vercel: `https://notificacao-caj.vercel.app/api`
- Licença: BSD 3-Clause. Status: em desenvolvimento.

> **Como ler este documento.** Os problemas e riscos identificados na análise estão reunidos na seção 17, numerados como PA-01, PA-02 etc. Eles são citados ao longo do texto.

## 2. Arquitetura

O projeto é um monorepo com duas aplicações independentes, que podem ser publicadas separadamente.

- **Front-end** (`/front-end`): SPA em React + TypeScript. Concentra a interface, a leitura de planilhas, os cálculos do dia a dia e a montagem da maior parte dos textos.
- **Back-end** (`/backend-caj`): API REST em Node.js (Express 5, CommonJS), executada como função serverless na Vercel. Faz o que não convém fazer no navegador: autenticar usuários, chamar a IA e desenhar os arquivos Word e PDF. O único dado guardado no servidor é a tabela de usuários, num Postgres do Supabase.

```
Navegador (SPA React)  ──fetch / JSON + JWT──►  API Express (Vercel)  ──►  Google Gemini 2.5 Flash
  │ sessionStorage · localStorage · IndexedDB          │
  │ planilhas .xlsx lidas no próprio navegador          ├─ Postgres (Supabase): tabela usuarios
                                                        └─ docx e pdfkit ──► arquivo (Blob) ──► download
```

### 2.1. Onde cada dado fica

No servidor fica só a tabela `usuarios` (login, nome, hash da senha, perfil, status e a chave do Gemini de cada usuário, cifrada). Todo o estado de trabalho fica no navegador:

| Armazenamento | Duração | O que guarda |
| --- | --- | --- |
| Memória (RAM) | Até recarregar a página | Planilhas brutas do Controle de Análises; textos temporários da calculadora |
| `sessionStorage` | Enquanto a aba estiver aberta | Formulários das telas, texto gerado, lotes de casos (Redator, Retorno de Defesa e Tabela de Multas) |
| `localStorage` | Sem prazo de expiração | Estado do Controle de Análises (chave `@ControleAnalises:state`); token JWT e dados do usuário logado (`caj_auth_token` e `caj_auth_user`) |
| IndexedDB (`redator-db`) | Sem prazo de expiração | Base de dados de clientes carregada no Redator |

A seção 9 detalha esse modelo. Ele tem implicações de privacidade (PA-12 e PA-14).

### 2.2. Decisões de arquitetura

- **Roteamento por hash** (`createHashRouter`): as URLs têm a forma `/#/multas`, o que dispensa regras de reescrita no servidor de hospedagem.
- **Lógica separada da interface:** cada tela tem um hook dedicado em `hooks/` com estado, regras e ações; o arquivo da tela só renderiza.
- **Back-end sem estado de trabalho:** cada requisição traz tudo de que precisa (token JWT, texto final, dados do cliente). O banco é consultado só para autenticar, gerir usuários e ler a chave do Gemini do usuário logado.
- **Textos montados no front-end:** os pareceres da Ouvidoria e das defesas são templates em TypeScript; a IA só é usada na tela de notificações.

## 3. Stack tecnológico

### 3.1. Front-end

| Item | Uso |
| --- | --- |
| React 18, TypeScript, Vite 6 | Base da SPA e build |
| React Router 7 | Roteamento (`createHashRouter`, `Outlet`, `NavLink`) |
| Tailwind CSS 4 (plugin do Vite) | Estilização por classes utilitárias |
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
| `pg` | Conexão com o Postgres (Supabase) |
| `jsonwebtoken` e `bcryptjs` | Tokens de acesso (JWT) e hash de senhas |
| `dotenv` | Leitura do `.env` em execução local |
| Vercel (`@vercel/node`, `vercel.json`) | Deploy serverless |

### 3.3. Dependências

O `package.json` do front-end veio de um template do Figma Make. As bibliotecas do template que não eram usadas (Material UI, Emotion, Radix, `react-hook-form`, `date-fns`, `recharts`, `jspdf` etc.) foram removidas junto com a pasta `components/ui`, que era a única que as importava. As datas são tratadas por `utils/dates.ts`, escrito à mão, e os PDFs são gerados no back-end.

## 4. Estrutura do repositório

```
Notificacao-CAJ
├─ backend-caj
│  ├─ public/logo-docx-vale.jpg        logo usado nos documentos
│  ├─ scripts/criar-admin.js           cria a tabela de usuários e o primeiro admin
│  ├─ src
│  │  ├─ index.js                      entrada do Express
│  │  ├─ routes/indexRoutes.js         rotas /api/*
│  │  ├─ middlewares/authMiddleware.js requireAuth e requireAdmin
│  │  ├─ controllers/                  ai, auth, calculator, document, user
│  │  ├─ services/                     ai, auth, calculator, document, user
│  │  ├─ db/                           pool.js (conexão) e schema.sql (tabela usuarios)
│  │  └─ utils/formatters.js
│  ├─ .env.example · vercel.json · package.json
└─ front-end
   ├─ index.html · vite.config.ts · package.json · .env.example
   ├─ public/logo.resolucao.boa.(png|jpg)
   └─ src
      ├─ main.tsx · App.tsx
      ├─ routes/routes.ts
      ├─ contexts/AuthContext.tsx      sessão do usuário logado
      ├─ pages/                        5 telas de trabalho + Login, GerenciarUsuarios e Pagina404
      ├─ hooks/                        7 hooks (um por tela + useFiltroMatriculaLote e useSessionStorage)
      ├─ components/                   Layout, ProtectedRoute, AdminRoute, AlterarSenhaModal, shared/, ouvidoria/
      ├─ services/                     api, auth, http, usuarios, notificacoes, defesas, ouvidoria, tarifas
      ├─ utils/                        dates, masks, kvStorage, funcionarios, controleAnalises
      └─ styles/                       index.css, tailwind.css, theme.css
```

## 5. Back-end (`backend-caj`)

### 5.1. Entrada e rotas

`src/index.js` carrega o `.env` (`dotenv`), cria o app Express, ativa o CORS só para as origens permitidas (`CORS_ORIGINS`, URLs separadas por vírgula; se vazia, o front-end publicado `https://notificacao-caj-7ncb.vercel.app` e o ambiente local `http://localhost:5173`), habilita JSON no corpo e monta as rotas sob `/api`. O servidor só escuta uma porta (padrão 3000) quando o arquivo é executado diretamente; na Vercel o app é exportado como função.

Só `POST /api/auth/login` é pública. As demais rotas passam por `requireAuth`, e as de usuários também por `requireAdmin` (seção 5.7).

| Método e rota | Controller | Usada por |
| --- | --- | --- |
| `POST /api/auth/login` | `authController.login` | Tela de login (pública) |
| `GET /api/auth/me` | `authController.me` | Dados do usuário do token |
| `PUT /api/auth/senha` | `authController.trocarSenha` | Troca da própria senha (barra lateral) |
| `GET`, `PUT`, `DELETE /api/auth/gemini` | `authController.geminiStatus`, `salvarGemini` e `removerGemini` | Situação, cadastro e remoção da própria chave do Gemini (barra lateral) |
| `GET`, `POST /api/usuarios` | `userController.list` e `create` | Gestão de Usuários (admin) |
| `PUT`, `DELETE /api/usuarios/:id` | `userController.update` e `remove` | Gestão de Usuários (admin) |
| `PUT /api/usuarios/:id/senha` | `userController.resetSenha` | Gestão de Usuários (admin) |
| `POST /api/gerar` | `aiController.generateNotification` | Redator de Notificação |
| `POST /api/exportar_word` | `exportInfracaoWord` | Redator de Notificação |
| `POST /api/exportar_pdf` | `exportInfracaoPdf` | Redator de Notificação |
| `POST /api/exportar_parecer_word` | `exportParecerWord` | Ouvidoria e Retorno de Defesa |
| `POST /api/exportar_parecer_pdf` | `exportParecerPdf` | Ouvidoria e Retorno de Defesa |
| `POST /api/calcular_multa` | `calculatorController.calculate` | **Nenhuma tela** (legado, PA-02) |

### 5.2. Controllers

Os controllers só validam a entrada e traduzem o resultado em resposta HTTP. Erros saem como `{ detail: mensagem }` com status 400 (entrada inválida) ou 500 (falha interna).

- `generateNotification`: exige `textos_base` (lista). Repassa `dataConstatacao`, `protocolo`, `funcionario` e `equipe` ao serviço de IA.
- Exportação de parecer: exige `texto_final`; usa `tipoCaso` apenas no nome do arquivo do cabeçalho `Content-Disposition`. Os demais campos enviados pelas telas (`protocolo`, `numeroProcesso`, `decisao` etc.) são ignorados. Por isso as telas de Ouvidoria e de Defesa podem enviar payloads diferentes para as mesmas rotas.
- Exportação de Auto de Infração: exige `texto_final` e repassa o corpo inteiro ao serviço.

### 5.3. Serviço de IA (`aiService.js`)

Usa o modelo **gemini-2.5-flash** com a chave do **próprio usuário logado**. O `aiController` lê a chave cifrada do banco (`userService.getGeminiKey`) e a decifra só no servidor; o navegador não envia a chave na geração. Sem chave cadastrada, a geração responde 400 com “Cadastre sua chave do Gemini em “Minha chave do Gemini”, no rodapé da barra lateral.”. O caso só com o código 20012, que não usa IA, funciona mesmo sem a chave.

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
- Linhas que começam com um número de dois dígitos seguido de ponto (`01.`, `02.`, `04.` etc.), `I –`, `II –`, `III –`, `IV –`, `V –`, `OBJETO:` ou `DECISÃO:` ficam inteiras em negrito (apenas no parecer). Os numerais romanos só são reconhecidos com o travessão “–” (PA-08).
- `[EDIÇÃO PECULIAR]` e `<adicionar fato novo ao processo>` são marcadores de revisão e saem em vermelho (`#FF0000`) no Word, no PDF e na pré-visualização da Ouvidoria. A lista fica em `RED_MARKERS`, repetida no `documentService.js` e no `useProcessoOuvidoria`; as duas precisam ser mantidas iguais.
- O logo é lido de `public/logo-docx-vale.jpg`; se o arquivo não for encontrado, o documento é gerado sem ele. Na Vercel, a pasta `public` entra no pacote da função pelo `includeFiles` do `vercel.json` (PA-16).

### 5.5. Calculadora no back-end (`calculatorService.js`) – legado

Recebe tarifas de serviço por vigência, faixas de consumo (`m3Tiers`), linhas de água e de esgoto e o fator K1. Para cada mês calcula o valor da água faixa a faixa, soma a tarifa de serviço e compara com o valor cobrado. O esgoto é 80% do valor correto da água multiplicado pelo fator K1. Devolve linhas, totais e dois textos de laudo. **Nenhuma tela chama essa rota hoje**; a tela de multas calcula tudo no navegador (seção 12.3). Ver PA-02.

### 5.6. Utilitários (`formatters.js`)

| Função | O que faz |
| --- | --- |
| `parseBRL` | Converte texto em formato brasileiro (`1.234,56`, com ou sem `R$`) em número; devolve 0 se inválido |
| `parseMonthYear` | Converte `MM/AAAA` em um inteiro (ano × 12 + mês) para comparação |
| `isWithinRange` | Verifica se um mês está dentro de um intervalo; fim vazio significa vigência em aberto |
| `formatBRL` | Formata número como `R$ 1.234,56` |

### 5.7. Autenticação e usuários

- **Banco.** `db/pool.js` abre um pool de conexões (`pg`, no máximo 3) com o Postgres indicado em `DATABASE_URL`, com SSL fora do ambiente local. Para a Vercel, recomenda-se o *Transaction pooler* do Supabase (porta 6543). `db/schema.sql` cria a tabela `usuarios` (`id`, `usuario` único, `nome`, `senha_hash`, `perfil` `admin` ou `usuario`, `ativo`, `criado_em`, `atualizado_em`) e ativa o RLS sem políticas, o que bloqueia o acesso pela API pública do Supabase.
- **Login (`authService`).** Compara a senha com o hash (bcrypt). Quando o usuário não existe, compara com um hash fictício, para que o tempo de resposta não revele quais logins existem. Usuários inativos não entram. O token é um JWT (HS256) assinado com `JWT_SECRET` (mínimo de 32 caracteres; sem ele, ninguém autentica) e vale por `JWT_EXPIRES_IN` (padrão `8h`).
- **`requireAuth`.** Exige `Authorization: Bearer <token>`, valida o token e consulta o usuário no banco a cada requisição. Assim, desativar um usuário ou mudar o perfil vale na hora. Responde 401 com `detail` (“Token de acesso ausente.”, “Sessão expirada...”, “Token inválido.”, “Usuário inativo ou inexistente.”).
- **`requireAdmin`.** Responde 403 para quem não tem perfil `admin`.
- **Regras de usuários (`userService`).** Login de 3 a 50 caracteres (letras minúsculas, números, ponto, hífen ou sublinhado), guardado em minúsculas; nome de 2 a 120 caracteres; senha de no mínimo 8 caracteres. Login repetido devolve 409. O admin não pode rebaixar, desativar nem excluir a própria conta. A troca da própria senha exige a senha atual.
- **Chave do Gemini por usuário.** Fica na coluna `gemini_api_key_enc`, cifrada com AES-256-GCM (`utils/crypto.js`) pela chave mestra `ENCRYPTION_KEY` (64 caracteres hexadecimais) do servidor. O formato é `v1:<iv>:<tag>:<conteúdo>`, e o GCM detecta qualquer alteração do valor. A API só informa se a chave existe e os 4 últimos caracteres; nunca devolve a chave. Ao salvar, exige de 20 a 200 caracteres, sem espaços. Se a `ENCRYPTION_KEY` for trocada, as chaves salvas deixam de ser lidas: a tela mostra “Não cadastrada” e o usuário precisa cadastrar de novo.
- **Primeiro administrador.** `npm run criar-admin -- <usuario> "<Nome>" "<senha>"` executa o `schema.sql` e cria o admin. Se o login já existir, ele é promovido a admin, reativado e recebe a nova senha.

### 5.8. Deploy

O `vercel.json` usa `@vercel/node` com `src/index.js` como entrada, roteia todas as requisições para ele e inclui a pasta `public` no pacote. O CORS é aplicado só pelo Express. O back-end lê as variáveis `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ENCRYPTION_KEY`, `CORS_ORIGINS` e `PORT` (modelo em `.env.example`). Na Vercel, elas são cadastradas em *Settings → Environment Variables*. O `.env` local está no `.gitignore`.

## 6. Camada de serviços do front-end (`src/services`)

### 6.0. `auth.ts`, `http.ts` e `usuarios.ts`

- `auth.ts` define `API_BASE_URL` (`VITE_API_URL` ou, na falta dela, `https://notificacao-caj.vercel.app/api`) e cuida da sessão: `loginApi` chama `/auth/login` e grava o token e o usuário no `localStorage`; `getToken` descarta o token vencido (lê o `exp` do JWT, sem validar a assinatura, que é papel do back-end); `clearSession` apaga a sessão e dispara o evento `caj:auth-logout`.
- `http.ts` tem `apiFetch` (prefixa a URL, envia `Authorization: Bearer` e encerra a sessão se a API responder 401) e `throwApiError` (lança o `detail` devolvido pela API).
- `usuarios.ts` chama as rotas de gestão de usuários (`listarUsuarios`, `criarUsuario`, `atualizarUsuario`, `redefinirSenhaUsuario`, `excluirUsuario`), a troca da própria senha (`trocarMinhaSenha`) e a chave do Gemini do usuário (`obterStatusChaveGemini`, `salvarChaveGemini`, `removerChaveGemini`). Salvar ou remover a chave dispara o evento `caj:gemini-chave-alterada`.

### 6.1. `api.ts`

Concentra as chamadas à API. As requisições passam por `apiFetch` (`http.ts`), que usa a URL base de `auth.ts` (`VITE_API_URL` ou, na falta dela, `https://notificacao-caj.vercel.app/api`), envia o token JWT e encerra a sessão quando a API responde 401.

| Função | Rota | Retorno |
| --- | --- | --- |
| `gerarNotificacaoApi` | `/gerar` | JSON com `texto_gerado` |
| `exportarWordApi` / `exportarPdfApi` | `/exportar_word` e `/exportar_pdf` | `Blob` |
| `exportarParecerWord` / `exportarParecerPDF` | `/exportar_parecer_word` e `/exportar_parecer_pdf` | `Blob` |

Os tipos `GerarNotificacaoPayload`, `ExportarDocumentoPayload` e `ExportarParecerPayload` descrevem os corpos enviados. Em caso de erro HTTP, todas as funções chamam `throwApiError` (`http.ts`), que lança o `detail` devolvido pela API. Se a resposta não trouxer `detail`, usa uma mensagem padrão. Assim, uma chave do Gemini inválida aparece ao usuário com a mensagem real, e não como erro de comunicação. As telas incluem essa mensagem nos alertas de falha de download.

### 6.2. `notificacoes.ts`

Biblioteca de **24 códigos de infração** (`INFRACTION_CODES`), cada um com `code`, `title`, `category`, `clauseMulta` e `clauseMultaCP`.

- `clauseMulta`: descrição do fato, dispositivo legal (quase todos no Art. 144 da Resolução 019/2019) e penalidade de multa.
- `clauseMultaCP`: a mesma cláusula acrescida da **padronização obrigatória** da ligação em 90 dias úteis (Art. 144, § 3º), com a advertência de multa adicional por não padronização.
- Os códigos incluem `20400` a `20418`, uma variante `20402 HD`, os códigos de acesso `20011` (serviços) e `20012` (leitura, com o marcador `[INFORMAR MESES SEM ACESSO]`), `20013` (notificação de atualização cadastral) e `20419` (recusa de atualização cadastral).
- `CATEGORY_COLORS` associa cada categoria a uma cor de etiqueta: fraude (vermelho), infraestrutura (laranja), uso (verde), acesso (azul) e cadastral (roxo).

### 6.3. `defesas.ts`

Contém **21 templates** de resposta (`DEFESAS_TEMPLATES`: os códigos `20400` a `20419`, exceto `20402 HD`, mais um modelo genérico de código `Prazo` para prorrogação) e as funções de exportação de parecer.

Cada template começa por `Defesa A.I. nº {DEFESA_AI}`, cita o inciso do Art. 144 aplicável, traz o marcador `[descrever aqui o fundamento específico para a decisão]` e lista as penalidades mantidas com valores `R$ XXX,XX` a preencher. A hook substitui `{DEFESA_AI}` e o fundamento; o restante é revisado pelo operador. Este arquivo repete `CATEGORY_COLORS` e as funções `exportarParecerWord/PDF` (PA-09 e PA-10).

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

Camada assíncrona sobre IndexedDB (banco `redator-db`, loja `kv`) com `kvSet` e `kvGet`. Hoje guarda apenas a base de clientes, gravada pelo Redator e lida também pelo filtro de matrícula de Retorno de Defesa e Tabela de Multas (`useFiltroMatriculaLote`).

### 7.4. `funcionarios.ts`

Lista fixa de 29 funcionários (`matricula` numérica e `nome`) embutida no código, usada nos campos de busca de funcionário do Redator e da Ouvidoria (PA-14).

### 7.5. `controleAnalises.ts`

Regras do Controle de Análises compartilhadas entre a tela e as importações de casos:

- `AnaliseProcessada` (tipo de cada linha da tabela), `CONTROLE_ANALISES_KEY` (`@ControleAnalises:state`);
- `filtrarAnalises` e `ordenarAnalises`: os filtros e a ordenação da tabela (seção 12.4);
- `lerCasosDoControleAnalises`: lê o estado salvo, recalcula a lista filtrada e ordenada a partir de `resultados`, dos filtros e da ordenação salvos e a devolve. Se o filtro não deixar nenhum caso, devolve todos os resultados; se não houver nada salvo, devolve `null`. É usada pelo Redator e pelo filtro de matrícula em lote (PA-13).

## 8. Navegação, layout e estilos

### 8.1. Roteamento

`main.tsx` monta o React e importa `styles/index.css`; `App.tsx` envolve o `RouterProvider` com o `AuthProvider`. As rotas (`routes/routes.ts`) usam `createHashRouter`:

- `/login` é a única rota pública e fica fora do `Layout`;
- as demais ficam dentro de `ProtectedRoute`, que manda para `/login` quem não está autenticado (guardando a página de origem para voltar depois do login);
- `/usuarios` fica também dentro de `AdminRoute`, que manda para `/` quem não é administrador. O back-end repete essa checagem.

| Caminho | Tela | Acesso |
| --- | --- | --- |
| `/login` | `Login` | Público |
| `/` (index) | `RedatorNotificacao` | Logado |
| `/resposta-defesa` | `RespostaDefesa` | Logado |
| `/multas` | `CalculadoraMulta` | Logado |
| `/controle-analises` | `ControleAnalises` | Logado |
| `/ouvidoria` | `ProcessoOuvidoria` | Logado |
| `/usuarios` | `GerenciarUsuarios` | Administrador |
| `*` | `Pagina404` (precisa ser sempre a última rota) | Logado |

**Sessão (`contexts/AuthContext.tsx`).** Expõe `user`, `isAuthenticated`, `isAdmin`, `login` e `logout`. Encerra a sessão quando o token vence (com um temporizador), quando a API responde 401 (evento `caj:auth-logout`) e quando outra aba faz logout (evento `storage`).

### 8.2. Layout (`components/Layout.tsx`)

Barra lateral escura e recolhível (largura de 16 rem para 5 rem, com transição), com logo, descrição do sistema e cinco itens de menu em **Módulos**. Para administradores, aparece também a seção **Administração**, com o item **Usuários** (subtítulo “Cadastro e Acessos”). O rodapé mostra o nome do usuário logado e o perfil (“Administrador” ou “Dep. Atendimento”), além de três botões: **Minha chave do Gemini** (abre o `ChaveGeminiModal`), **Alterar minha senha** (abre o `AlterarSenhaModal`) e **Sair**. O conteúdo da rota aparece no `<Outlet />`, com rolagem própria. Quando recolhida, os itens mostram só o ícone e o nome aparece como dica ao passar o mouse.

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
- `tailwind.css` carrega o Tailwind 4 com `source(none)` e declara explicitamente os arquivos a varrer (`@source '../**/*.{js,ts,jsx,tsx}'`).
- `theme.css` define os **tokens visuais do Sistema CAJ** num bloco `@theme`, e as telas usam essas classes em vez de cores fixas:
  - `brand` (azul CAJ `#1a5fa8`, com `-hover`, `-soft`, `-subtle` e `-line`) para ações, foco e realces;
  - `navy` (marinho `#0a1f33`, com `-raised`, `-line`, `-text`, `-muted` e `-accent`) para a barra lateral;
  - `ink`, `ink-body` e `ink-muted` para títulos, corpo e texto auxiliar; `canvas` (`#f3f6f9`) para o fundo das páginas;
  - `success`, `warning` e `danger` (com `-soft` e `-line`) para estados e prazos;
  - escala `gray` recalibrada para um cinza-azulado.
- A fonte é a **IBM Plex Sans**, carregada do Google Fonts no `index.html`.
- As animações `fadeIn`, `slideUp` e `scaleIn` (classes `animate-*`) estão definidas em `theme.css`.
- `theme.css` ainda mantém as variáveis do tema escuro (`.dark`), que não é ativado em lugar nenhum (PA-19).

## 9. Persistência de estado

### 9.1. `useSessionStorage`

Hook genérico que se comporta como `useState`, mas lê o valor inicial do `sessionStorage` e grava a cada mudança (em JSON). Se a chave mudar, relê o valor salvo na nova chave, e cada valor é gravado sempre na chave a que pertence. Falhas de leitura ou gravação geram apenas um aviso no console. Cada tela usa um prefixo de chave próprio.

### 9.2. O que cada tela guarda e onde

| Tela | Armazenamento | Conteúdo | Não persiste |
| --- | --- | --- | --- |
| Redator | `sessionStorage` (`redator_*`) | Etapa, texto gerado, códigos, variante, dados do formulário, lote de casos (`excelDataResp`) | Estados visuais (menus abertos, carregando) |
| Redator | IndexedDB (`baseCliente`) | Base de dados de clientes carregada da planilha | – |
| Retorno de Defesa | `sessionStorage` (`defesa_*`) | Etapa, código, nº da defesa, motivo, texto gerado, parâmetros da calculadora de prazos; filtro de matrícula (lote de casos, origem, responsável, matrícula e dados do cliente) | Modo preview/edição |
| Tabela de Multas | `sessionStorage` (`calc_*`) | Linhas de água e esgoto, períodos, nº do AI, data da retirada, consumo base e referência; filtro de matrícula (mesmos campos da Defesa) | Textos dos laudos |
| Ouvidoria | `sessionStorage` (`ouv_*`, mais de 40 chaves) | Fluxo, campos do processo, variáveis dos templates, opções da guia Sansys, calculadora de prazos | Etapa e **texto gerado** |
| Análises Vencidas | `localStorage` (`@ControleAnalises:state`) | Nomes dos arquivos, resultados processados, filtros e ordenação | Planilhas brutas (só em memória); lista filtrada (recalculada a partir dos resultados e dos filtros) |
| Sessão (todas as telas) | `localStorage` (`caj_auth_token`, `caj_auth_user`) | Token JWT e dados públicos do usuário logado (id, login, nome, perfil) | – |

Consequências práticas: ao recarregar a página, o Controle de Análises mantém a tabela de resultados, mas exige novo upload das planilhas para reprocessar; a Ouvidoria mantém os campos preenchidos, mas o texto gerado se perde.

Todas as telas têm um botão **Limpar** com confirmação. No Redator, ele limpa o formulário e preserva as planilhas carregadas; no Controle de Análises, remove também a chave do `localStorage`. Riscos de volume e privacidade: PA-12 e PA-14.

## 10. Hooks (`src/hooks`)

Cada tela tem um hook que concentra estado, regras e ações. O componente da tela só lê o que o hook devolve.

### 10.1. `useRedatorNotificacao`

- **Base de clientes.** A planilha é lida no navegador e cada linha é mapeada por nome de coluna (expressões regulares) para `matricula`, `morador`, `endereco`, `bairro`, `cep`, `localizacao`, `ativEconomica` e `numeroHidrometro`; linhas sem matrícula são descartadas. O resultado fica num cache de módulo e no IndexedDB. Ao abrir a tela, o hook restaura a base do IndexedDB (`baseHydrated` indica o fim da leitura).
- **Lote de casos.** Pode vir de uma planilha própria ou do botão **Importar do Controle de Análises**, que usa `lerCasosDoControleAnalises` (`utils/controleAnalises.ts`, seção 7.5) para obter a mesma lista filtrada e ordenada da tela de análises (ou todos os resultados, se o filtro não deixar nenhum) e converte cada item em Matrícula, Responsável, Código e Status (PA-13). As colunas de responsável e de matrícula são descobertas por nome. O usuário escolhe um responsável e navega pelos casos dele (`navegarCaso`, de forma circular); casos já exportados são marcados como processados.
- **Validações antes de gerar.** Pelo menos um código; matrícula, data da constatação, protocolo, funcionário e equipe preenchidos (e meses sem acesso, se houver o código 20012); e a matrícula digitada precisa ter sido buscada na base.
- **Geração.** Para cada código escolhe `clauseMulta` ou `clauseMultaCP` conforme a variante, troca `[INFORMAR MESES SEM ACESSO]` por “N meses sem acesso” no 20012 e envia tudo à API.
- **Exportação.** Exige o nº do Auto de Infração, envia texto, dados do cliente e identificadores, baixa `Notificacao_<matrícula>.docx` ou `.pdf` e marca a matrícula como processada.

### 10.2. `useRespostaDefesa`

- Aceita **um único código** por vez (selecionar outro substitui o anterior; selecionar o mesmo desmarca).
- Exige o nº da Defesa A.I. Ao gerar, substitui `{DEFESA_AI}` e, se informado, o marcador do fundamento do indeferimento. O texto continua com `R$ XXX,XX`, `XX/XX/XXXX` e a alternativa “indeferida/deferida parcialmente” para o operador resolver na revisão.
- Contém a calculadora de dias úteis (prazo de 15 dias ou personalizado, a partir de uma data).
- Usa o filtro de matrícula em lote (`useFiltroMatriculaLote("defesa")`, seção 10.6).
- Exporta Word e PDF por `services/defesas.ts` com o nome `Resposta_Defesa_<matrícula>`, ou `Resposta_Defesa_<data>` quando não há matrícula informada.

### 10.3. `useCalculadoraMulta`

- Mantém duas tabelas (água e esgoto) de `ManualRow`: mês, consumo regular, consumo irregular, valor correto, serviço correto, valor cobrado e serviço cobrado. Os valores corretos são calculados fora do sistema e digitados.
- `handleGeneratePeriod` cria uma linha por mês de um período (`MM/AAAA a MM/AAAA`), sem duplicar meses existentes. `addRow`, `removeRow` e `changeRow` editam linhas, aplicando máscaras (moeda, mês/ano, números). `applyFillRange` replica um valor numa faixa de linhas (arrastar como no Excel).
- `calculateResults` calcula, por linha, total correto, total cobrado, diferença e o volume recuperado (consumo regular menos consumo irregular), e soma os totais.
- `handleGenerateText` monta o laudo de água ou de esgoto com os dados complementares (nº do AI, data da retirada, maior consumo após a regularização e referência); campos vazios saem como marcadores entre colchetes. O período do laudo (“de ... até ...”) usa o primeiro e o último mês válidos, ordenados por data, independentemente da ordem das linhas na tabela.
- Os ids das linhas vêm de um contador do módulo. Como as linhas ficam no `sessionStorage`, `syncUid` ajusta o contador para começar depois do maior id salvo, evitando ids repetidos após recarregar a página.
- Usa o filtro de matrícula em lote (`useFiltroMatriculaLote("calc")`, seção 10.6). O botão Limpar também limpa o filtro.

### 10.4. `useControleAnalises`

- Recebe três planilhas: **OP00002** (obrigatória, as análises), **989 Cliente** (situação do serviço para o cliente) e **989 CAJ** (situação e códigos de encerramento da OS na CAJ). As colunas são localizadas por vários nomes possíveis.
- `processarDados` descarta serviços cujo código não tem prazo cadastrado e calcula, para cada análise, dias úteis transcorridos, atraso, situação (No Prazo ou Vencida) e se está **padronizada** (regras na seção 12.4).
- Filtra por busca global, códigos (separados por vírgula), funcionário, situação, status do cliente e situação da OS (múltipla escolha), e ordena por qualquer coluna (`requestSort`).
- As regras de filtro e ordenação ficam em `utils/controleAnalises.ts` (seção 7.5).
- Grava resultados, filtros e ordenação no `localStorage` quando algum deles muda. A lista filtrada não é gravada, porque pode ser recalculada.

### 10.5. `useProcessoOuvidoria`

O maior hook do sistema. Concentra:

- os campos do processo e as variáveis dos templates;
- as **flags derivadas** do caso (`isLeitura`, `isServico`, `isCorte`, `isRecursoLSTC`, `isFatoNovo`, `isParcial`, `isIndeferir` etc.) e as flags de visibilidade (`showDataGeracaoAI`, `showMesesSemAcesso`, `showDataRecebimentoAR` etc.), que mostram na tela só os campos que o template escolhido usa; as seções 3 a 5 são numeradas dinamicamente;
- `isForaDoPrazo`: verdadeiro quando passam mais de 30 dias úteis entre a emissão da fatura e a manifestação (prazo de revisão da IN 83/2025);
- `handleTipoCasoChange` e `handleDecisaoChange`, que limpam as escolhas que deixam de fazer sentido;
- `handleGenerateParecer`, que escolhe e preenche o template (seção 13);
- `getParte1Text` e `getParte2Text`, que montam os textos de tratativa no Sansys;
- pré-visualização com negrito (`**texto**`) e destaque vermelho dos marcadores `[EDIÇÃO PECULIAR]` e `<adicionar fato novo ao processo>` (mesma regra do Word e do PDF); ao copiar, os marcadores `**` são removidos;
- exportação Word e PDF com o nome `Parecer_<tipoCaso>_<processo ou matrícula>`;
- a calculadora de dias úteis, que fecha ao clicar fora.

### 10.6. `useFiltroMatriculaLote`

Hook reutilizável que leva para Retorno de Defesa e Tabela de Multas o mesmo trabalho em lote do Redator. Recebe um prefixo (`defesa` ou `calc`), e cada tela guarda o próprio filtro no `sessionStorage`.

- **Importar do Controle de Análises:** usa `lerCasosDoControleAnalises` (seção 7.5), como o Redator, e converte cada item em Matrícula, Responsável, Código e Status (PA-13). Avisa por modal se não houver dados ou se a tabela estiver vazia.
- **Lote por responsável:** lista os responsáveis, seleciona o primeiro caso do escolhido e navega entre os casos dele (`navegarCaso`, anterior e próximo).
- **Busca do cliente:** procura a matrícula na base de clientes do IndexedDB, que só pode ser carregada no Redator. Se a base não foi carregada, o botão Buscar fica desabilitado e explica o motivo.
- `limparFiltro` zera lote, responsável, matrícula e dados do cliente.

## 11. Componentes

### 11.1. Compartilhados (`components/shared`)

| Componente | Função |
| --- | --- |
| `ui.tsx` | Kit de interface: `Button` (variantes e tamanhos), `Badge`, `Alert`, `PageHeader`, `FeedbackModal` (sucesso, aviso ou erro), `LoadingOverlay`, `EmptyState`, estilos de tabela (`table`) e classes de formulário (`inputClass`, `labelClass`, `hintClass` etc.) |
| `Modal` | Janela modal genérica com título e botão de fechar; reexporta as classes de formulário do `ui.tsx` |
| `DatePicker` | Seletor de data completa (`DD/MM/AAAA`) com calendário em popover |
| `MonthYearPicker` | Seletor de um mês/ano (`MM/AAAA`), em tamanho `sm` ou `md` |
| `MonthYearRangePicker` | Seletor de período; guarda `MM/AAAA a MM/AAAA` e exibe “Jan/2026 até Mar/2026” |
| `SectionBlock` | Cartão com cabeçalho numerado (ou com ícone), título, descrição e ação à direita |
| `CalculadoraDiasUteis` | Botão e popover da calculadora de dias úteis de Retorno de Defesa e Ouvidoria. Só apresenta: o cálculo continua nos hooks das telas |
| `FiltroMatriculaLote` | Interface do filtro de matrícula em lote (seção 10.6): importação, responsável, navegação entre casos, matrícula e Buscar |

Os três seletores de data fecham ao clicar fora e unificaram implementações que antes estavam duplicadas nas telas.

### 11.1.1. Autenticação (`components/`)

- `ProtectedRoute` e `AdminRoute`: guardas de rota (seção 8.1).
- `AlterarSenhaModal`: troca da própria senha (senha atual, nova senha com no mínimo 8 caracteres e confirmação).
- `ChaveGeminiModal`: “Minha chave do Gemini”. Mostra se a chave está cadastrada (com os 4 últimos caracteres), recebe uma nova chave (que substitui a atual) e permite removê-la. A chave não fica salva no navegador.

### 11.2. Ouvidoria (`components/ouvidoria`)

`EditableCopyBlock` mostra um texto sugerido num campo editável com botões **Copiar** e **Desfazer Edição**. Enquanto o usuário não edita, o texto acompanha as mudanças do formulário; depois de editado, deixa de ser sobrescrito. É usado na guia Sansys.

### 11.3. Definidos dentro das telas

- `ComponenteProtegido`: *error boundary* usado no Redator e no Controle de Análises; em caso de erro, mostra um aviso com botão para recarregar em vez de uma tela em branco.
- Cartões de indicador (KPI) na Calculadora e no Controle de Análises.
- Formulários da Gestão de Usuários (`UsuarioForm`, `RedefinirSenhaForm` e `ExcluirConfirmacao`), exibidos dentro do `Modal`.

## 12. Telas (`src/pages`)

As telas de trabalho têm o mesmo esqueleto: cabeçalho (`PageHeader`) com título e botão **Limpar**, seguido de blocos numerados (`SectionBlock`) que o operador percorre de cima para baixo.

### 12.0. Login (`Login`)

Cartão centralizado, fora da barra lateral, com logo, campos **Usuário** e **Senha** (com botão para mostrar a senha) e o botão **Entrar**. Mostra a mensagem de erro devolvida pela API. Depois do login, volta para a página que o usuário tentou abrir; quem já está logado é levado direto para ela.

### 12.1. Redigir Notificação (`RedatorNotificacao`)

1. **Seleção de Códigos de Infração.** Lista suspensa com busca por código, título ou categoria, seleção múltipla, etiquetas coloridas por categoria e botão **Confirmar Seleção**. Os códigos escolhidos aparecem como etiquetas removíveis. Um seletor alterna entre **Apenas Multa** e **Multa + Padronização**.
2. **Dados da Notificação.** Dois cartões de carga: **Base de Dados do Cliente** (planilha para busca por matrícula) e **Análises Vencidas** (importa do Controle de Análises ou carrega uma planilha). Com um lote carregado, o operador escolhe o responsável e navega entre os casos dele (anterior e próximo, com contagem). Em seguida preenche: matrícula (botão **Buscar**, que preenche nome, endereço, bairro, CEP, localização, categoria e hidrômetro), data da constatação (máscara `DD/MM/AAAA`), protocolo, funcionário (lista pesquisavel, grava “Nome (Mat. N)”), equipe e, só para o código 20012, os meses sem acesso. O botão **Gerar** só libera com os campos obrigatórios preenchidos.
3. **Revisão e Edição do Texto.** O texto aparece formatado (negrito e marcadores em destaque); clicar nele abre o modo de edição, e sair do campo volta à pré-visualização. Há botões para alternar o modo e **Copiar Texto**.
4. **Exportação e Entrega.** Campo do nº do Auto de Infração e botões **PDF** e **Word**, desabilitados enquanto o número não for informado.

A tela é envolvida por um *error boundary* e usa um modal para avisos de upload e importação.

### 12.2. Retorno de Defesa (`RespostaDefesa`)

O cabeçalho tem o botão da **Calculadora de Dias Úteis**, uma janela flutuante: data inicial, prazo (15 dias ou personalizado) e data final calculada, com botão de copiar.

1. **Seleção de Códigos de Infração:** escolhe-se uma infração (busca por código, título ou categoria).
2. **Dados da Notificação:** filtro de matrícula em lote (seção 10.6), nº da Defesa A.I. (obrigatório) e fundamento do indeferimento (opcional).
3. **Revisão e Edição do Texto:** o operador completa os campos `XXX` (valores, datas, prazos) e ajusta o texto.
4. **Exportação e Entrega:** botões PDF e Word.

### 12.3. Tabela de Multas (`CalculadoraMulta`, título “Cálculo de Diferenças de Faturamento”)

Acima dos blocos numerados fica o **Filtro de Matrícula** (seção 10.6), para trabalhar os casos importados do Controle de Análises.

1. **Lançamento de Água** e 2. **Lançamento de Esgoto.** Cada bloco tem um seletor de período que gera uma linha por mês e uma tabela editável com consumo regular e irregular, valor e serviço corretos, valor e serviço cobrados e a diferença calculada por linha. A tabela permite adicionar e remover linhas, pular para a célula de baixo com **Enter** e **arrastar um valor** para replicá-lo em várias linhas, como no Excel. Cartões de indicador mostram o volume recuperado, o valor correto, o valor cobrado e a diferença a lançar (a cobrar do cliente ou cobrada a mais).
2. **Emissão de Laudos de Apuração.** O operador informa nº do AI (só números), data da retirada da irregularidade, maior consumo mês cheio após a regularização e o mês de referência. Os botões **Gerar** e **Copiar** produzem o laudo de água e o de esgoto; os textos continuam editáveis.

**Fórmulas usadas pela tela:** total correto = valor correto + serviço correto; total cobrado = valor cobrado + serviço cobrado; diferença = total correto − total cobrado (valor positivo: cobrar do cliente; negativo: devolver); volume recuperado = consumo regular − consumo irregular. Os valores corretos são calculados fora do sistema e digitados.

### 12.4. Análises Vencidas (`ControleAnalises`)

1. **Importação de Relatórios.** Três campos de upload (`.csv`, `.xlsx` ou `.xls`): Relatório **OP00002** (obrigatório), **989 Cliente** e **989 CAJ**. O botão de processamento só habilita com a OP00002 carregada.
2. **Indicadores e Monitoramento Detalhado.** Cartões com o total de análises, as padronizadas e as vencidas, mais um quarto indicador, e uma barra de proporção. A tabela lista todas as análises, da mais atrasada para a mais recente, com filtros (busca global, código, status do cliente, situação da OS, responsável, situação) e ordenação clicável nas colunas: data de abertura, código, matrícula, status do cliente, status da CAJ, situação da OS, padronizado, dias transcorridos, dias de atraso, situação e funcionário.

**Prazos por código de serviço (dias úteis):**

| Código | Prazo |
| --- | --- |
| 426 | 90 |
| 427 | 15 |
| 1010, 3769, 20000, 20001, 20002, 20003 | 1 |

Análises de códigos fora dessa tabela são ignoradas.

**Cálculo do atraso.** Os dias transcorridos são os dias úteis entre a abertura e hoje. Se passarem do prazo, o atraso é (transcorridos − prazo) + 1 e a situação é *Vencida*; caso contrário, *No Prazo* (PA-05).

**Regra de “padronizada”.** Uma análise só é marcada como padronizada quando as três condições são verdadeiras:

1. a OS está “encerrado - executado” na planilha da CAJ;
2. o status do cliente **não** contém nenhum destes termos: para reprogramar, pendente, programado, postergada, suspenso;
3. o status do cliente contém “cancelado” **ou** o código de encerramento da OS na CAJ está entre os 19 aprovados: 14201, 14203, 14211, 14213, 14231, 14233, 14254, 14261, 14271, 14601, 14603, 14604, 14605, 14631, 14633, 14654, 14901, 14903 e 14931.

Quando uma matrícula aparece em várias linhas, vale a primeira ocorrência na planilha do cliente; na da CAJ, tem preferência a linha “encerrado - executado”, e o código aprovado tem preferência sobre os demais.

### 12.5. Ouvidoria e Recursos (`ProcessoOuvidoria`)

O cabeçalho tem a Calculadora de Dias Úteis e o botão Limpar. A tela tem cinco blocos, com a numeração ajustada conforme o caso.

1. **Dados Globais da Manifestação:** morador (nome padronizado por `formatName`), matrícula, tipo de manifestação, nº do processo, nº do Auto de Infração, funcionário (busca por nome ou matrícula), data de emissão da fatura e data da manifestação. Com as duas datas, a tela avisa se o recurso está fora do prazo de 30 dias úteis.
2. **Tipo de Infração (Objeto):** alterna **Recurso** e **Não é recurso** e escolhe o enquadramento (leitura, serviço, corte, hidrômetro, by-pass, clandestina, LA padronizada, LA cadastral, prorrogação). Para serviço, escolhe-se impedimento voluntário ou involuntário; para corte, cavalete ou ramal.
3. **Veredicto Final e Conclusão** (ou **Análise de Defesa**): botões **Deferir**, **Deferir Parcialmente** e **Indeferir**, com perguntas de apoio conforme a escolha (motivo do deferimento, fato novo, fatura quitada, houve defesa prévia, foi multado).
4. **Variáveis e Datas da Irregularidade:** mostra apenas os campos que o template escolhido usa (datas de geração do AI, constatação, recebimento do AR, aplicação da sanção, decisão anterior; meses sem acesso; protocolo do serviço; recebedor; referência da fatura; dados da defesa prévia).
5. **Revisão e Exportação:** gera o parecer (campos obrigatórios: matrícula, nº do processo e a decisão, quando houver botões de decisão), mostra a pré-visualização editável e exporta em PDF ou Word.

O painel recolhível **Tratativas de Resposta – Guia Sansys** orienta o pós-decisão. O operador informa canal de resposta (e-mail, telefone ou ambos), contatos, se aplica a IN 83/2025, se a fatura foi alterada, se há restituição de multa e o tipo de indeferimento, e o painel mostra, em blocos editáveis e copiáveis (`EditableCopyBlock`): o texto de encerramento no Sansys (cód. 3773), a geração do cód. 426 (prorrogação de prazo, com o status da multa), a alteração de fatura (cód. 10024/10082, com vencimento da nova fatura 20 dias úteis após a decisão), o e-mail de resposta ao cliente e a abertura do cód. 1073 para contato ativo (cód. 1170). Há também lembretes de anexos (PDF do parecer em todos os casos; PDF da fatura corrigida nos retornos por telefone).

### 12.6. Gestão de Usuários (`GerenciarUsuarios`, só administradores)

Tabela com nome, login, perfil (etiqueta **Admin** ou **Usuário**) e status (**Ativo** ou **Inativo**), com botão para atualizar a lista e **Novo usuário**. Cada linha tem as ações **Editar** (nome e perfil), **Redefinir senha**, **Desativar/Reativar** e **Excluir**, que abrem formulários no `Modal`. As ações de desativar e excluir ficam bloqueadas na linha do próprio administrador. As regras de validação são as do back-end (seção 5.7).

## 13. Fluxo de decisão da Ouvidoria

### 13.1. Como o parecer é montado

`handleGenerateParecer` escolhe o template pela combinação **é recurso? × tipo de caso × decisão**, preenche as variáveis e substitui campos vazios por marcadores como `[DATA GERAÇÃO AI]`, para o operador completar. Nos casos com botões de decisão (leitura, serviço e corte), a decisão começa vazia e o operador precisa escolhê-la. Nos demais casos ela assume “deferir” automaticamente. Em deferimento parcial, o texto termina com o lembrete em vermelho `<adicionar fato novo ao processo>`.

Trechos que exigem julgamento humano são marcados com `[EDIÇÃO PECULIAR]` ou com texto entre colchetes e devem ser revisados antes da assinatura.

### 13.2. Tipos de caso

| Tipo | Dispositivo (Res. ARIS 019/2019, Art. 144) | Observações |
| --- | --- | --- |
| `leitura` | inciso XII | Impedimento de acesso para leitura; informa meses sem acesso |
| `servico` | inciso XII | Impedimento voluntário ou involuntário para execução de serviços |
| `corte_cavalete` | inciso X (cavalete) ou XXII (ramal) | Violação de corte; pergunta se houve multa |
| `hd` | inciso VI | Danificação do hidrômetro |
| `bypass` | inciso V | Derivação antes do hidrômetro |
| `clandestina` | inciso VII | Ligação clandestina |
| `la_padronizada` | – | Cliente padronizou e pede cancelamento das multas |
| `la_cadastral` | – | Cliente atualizou o cadastro e pede cancelamento da multa |
| `prorrogacao` | – | Cliente pede prazo para padronizar, antes da sanção |

As opções do campo **Qual foi o fato gerador?** dependem da resposta a **É recurso?**. Com **Sim**: leitura, serviço, corte, hd, by-pass e clandestina. Com **Não**: leitura, serviço, LA padronizada, LA cadastral e prorrogação. Violação de corte só existe para recurso, porque não há template para “Não é recurso”. Ao trocar a resposta, o tipo volta para leitura. Se a sessão tiver guardado “Não é recurso” com corte, a tela também volta para leitura.

### 13.3. Template por situação

| Situação | Resultado |
| --- | --- |
| **Recurso**, leitura ou serviço, **deferir** por *LA padronizada* | Texto curto: exclusão das multas pela IN 83/2025 e fatura corrigida em anexo |
| **Recurso**, leitura ou serviço, **deferir** por *fato novo* | Quatro variações (notificado ou multado; no serviço, voluntário ou involuntário). Inclui os dados da defesa prévia, se houver; quando multado e a fatura foi quitada, orienta a restituição por e-mail; encerra com as vantagens da caixa padrão |
| **Recurso**, leitura ou serviço, **parcial** | Exclui as multas pela IN 83/2025, trata a fatura (quitada: restituição; não quitada: corrigida), prorroga a padronização por 60 dias úteis e lista os passos para padronizar |
| **Recurso**, leitura ou serviço, **indeferir** | Ratifica a decisão. Explica que o pedido de revisão passou do prazo de 30 dias úteis da IN 83/2025, com as datas calculadas |
| **Recurso**, corte, **deferir** | Dois formatos: “DEFERIR a manifestação” (apenas notificado) ou “RETIFICAR... RETIRANDO a(s) penalidade(s)” (multado). Texto no singular ou plural conforme haja padronização; cita o inciso X ou XXII |
| **Recurso**, corte, **parcial** | Confirma a violação do corte (com imagens), retira só a multa de não padronização e prorroga o prazo por 60 dias úteis |
| **Recurso**, corte, **indeferir** | Ratifica a decisão anterior e mantém a sanção; orienta parcelamento por e-mail |
| **Recurso**, hd, by-pass ou clandestina | Texto único de manutenção das penalidades, com campos de veredicto a completar |
| **Não é recurso**, leitura ou serviço | Parecer à Ouvidoria em cinco partes (I – Dos Fatos a V – Conclusão), com versão de revisão (deferir ou parcial) e de ratificação (indeferir) |
| **Não é recurso**, LA padronizada, LA cadastral ou prorrogação | Textos curtos (cancelamento de multa ou nova prorrogação de 60 dias úteis) |

Se houve defesa prévia, a tela pede data e protocolo da defesa e do indeferimento, e o texto inclui o parágrafo padrão com a citação do Art. 144.

## 14. Prazos e regras de negócio

Todos os prazos são em **dias úteis** (sem sábados, domingos, feriados e emendas cadastrados em `dates.ts`).

| Prazo | Valor | Onde aparece |
| --- | --- | --- |
| Defesa contra o Auto de Infração | 15 dias úteis | Texto fixo do Auto de Infração |
| Padronização após a infração | 90 dias úteis | Cláusulas “Multa + Padronização” (Art. 144, § 3º) |
| Atualização cadastral | 15 dias úteis | Código 20013 |
| Revisão da fatura pela IN 83/2025 | 30 dias úteis a partir da emissão da fatura | Aviso de prazo e texto de indeferimento da Ouvidoria |
| Prorrogação da padronização | 60 dias úteis a partir de hoje | Pareceres de deferimento parcial e prorrogação (`get60BusinessDaysFromToday`) |
| Vencimento da nova fatura | 20 dias úteis após a decisão | Guia Sansys |
| Análises (Controle) | Ver tabela da seção 12.4 | Controle de Análises |

Observações:

- Os textos dizem que a prorrogação conta “a partir da data desta decisão”, mas o código conta 60 dias a partir de **hoje**. Os dois coincidem se o parecer for gerado no dia da decisão (PA-23).
- Esgoto (calculadora legada): 80% do valor correto da água, multiplicado pelo fator K1 da atividade.

## 15. Segurança e privacidade

- **Dados pessoais no navegador.** A base de clientes (nome, endereço, matrícula) fica no IndexedDB sem prazo de expiração; matrículas e nomes de funcionários das análises ficam no `localStorage`. Em computadores compartilhados, os dados permanecem após fechar o navegador (PA-12).
- **Autenticação.** Exceto `POST /api/auth/login`, todas as rotas exigem token JWT (`requireAuth`), e a gestão de usuários exige perfil de administrador (`requireAdmin`). As senhas são guardadas só como hash bcrypt. O token vale 8 horas por padrão e fica no `localStorage` (`caj_auth_token`), por isso continua valendo em outras abas e depois de fechar o navegador, até vencer ou o usuário sair. A API só aceita chamadas do navegador vindas das origens permitidas (`CORS_ORIGINS`).
- **Segredos do servidor.** `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` ficam só nas variáveis de ambiente (Vercel ou `.env` local, fora do Git).
- **Chave do Gemini.** Cada usuário cadastra a própria em “Minha chave do Gemini”. Ela vai uma vez ao servidor, é guardada cifrada no banco (AES-256-GCM com `ENCRYPTION_KEY`) e nunca volta ao navegador. O Redator apaga a `redator_apiKey` que versões antigas deixavam no `sessionStorage`. Quem tiver acesso ao banco sem a `ENCRYPTION_KEY` não consegue ler as chaves.
- **Documentos gerados.** Os arquivos não são gravados no servidor; são devolvidos na própria resposta e baixados no navegador.
- **Dados no código.** A lista de funcionários está embutida no front-end e, portanto, visível a quem acessa a aplicação.
- **Repositório.** O `.env` não deve ser versionado, mesmo vazio. Confirme que a divulgação pública do projeto está autorizada pela CAJ e que o link público não expõe dados internos.

## 16. Execução local e deploy

**Pré-requisitos:** Node.js, npm e um banco Postgres (o projeto usa o Supabase).

**Back-end** (`backend-caj`):

```bash
cd backend-caj
npm install
cp .env.example .env   # preencher DATABASE_URL, JWT_SECRET e ENCRYPTION_KEY
npm run criar-admin -- admin "Nome do Administrador" "SenhaForte123"   # só na primeira vez
npm run dev            # com recarga automática; ou npm start
```

A API escuta na porta 3000 (ou `PORT`). Para gerar um `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. O passo a passo completo está em `backend-caj/INFO.md`.

**Front-end** (`front-end`):

```bash
cd front-end
npm install
npm run dev         # desenvolvimento
npm run build       # gera a versão de produção
```

O Vite define o alias `@` para `src`.

**Pontos de atenção para quem for rodar o projeto:**

- Por padrão, o front-end chama a API de produção. Para testar o back-end local, defina `VITE_API_URL=http://localhost:3000/api` no `.env` do front-end (veja `.env.example`).
- Sem `ENCRYPTION_KEY`, ninguém consegue salvar a chave do Gemini. Em bancos criados antes desta versão, rode no SQL Editor do Supabase: `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS gemini_api_key_enc TEXT;`
- Sem `DATABASE_URL` e `JWT_SECRET`, ninguém consegue fazer login.
- Publicação: dois projetos na Vercel, um para cada pasta. O back-end usa o `vercel.json` existente e precisa das variáveis de ambiente da seção 5.8.

## 17. Pontos de atenção e dívida técnica

Lista de problemas e riscos encontrados na leitura do código, em três faixas de prioridade. Os itens marcados como *a confirmar* dependem de teste ou de verificação no ambiente real.

### 17.1. Prioridade alta (podem gerar documento ou cálculo errado)

| ID | Onde | Problema | Sugestão |
| --- | --- | --- | --- |
| PA-05 | `dates.ts`, `useControleAnalises` | Datas ilegíveis viram 0 dia útil e a análise aparece como “No Prazo” sem aviso. O atraso soma 1 ao excedente (prazo 15, 16 dias úteis decorridos → atraso 2) | Sinalizar datas inválidas; confirmar se o +1 é regra de negócio |
| PA-10 | `notificacoes.ts`, `defesas.ts` | Dados divergentes: inciso do código 20418 (XIV numa lista, XV na outra); multa de padronização R$ 480,40 (20400) e R$ 480,80 (20419); 24 códigos numa biblioteca e 21 na outra; títulos diferentes para o 20419; o código `Prazo` ainda tem o marcador `$$$$$$$$$$$` no lugar do inciso | Conferir com a resolução vigente; manter uma fonte única de dados |
| PA-14 | `funcionarios.ts` | A lista de funcionários (nomes e matrículas) continua embutida no código do front-end, visível a quem acessa a aplicação | Servir a lista pela API, que já exige login |

### 17.2. Prioridade média

| ID | Onde | Problema | Sugestão |
| --- | --- | --- | --- |
| PA-02 | Back-end e `tarifas.ts` | Rota `/calcular_multa`, controller, service e `tarifas.ts` não são usados por nenhuma tela. O serviço espera campos que a tela atual não envia e calcula a primeira faixa com `max − min + 1` (a faixa que começa em 0 comporta 11 m³ em vez de 10) | Remover ou documentar como legado; corrigir antes de reutilizar |
| PA-06 | `dates.ts` | A lista de feriados vai de 30/08/2025 a 31/12/2027. Fora desse período só se descontam fins de semana, sem aviso. “Hoje” vem do relógio do navegador | Atualizar a lista todo ano; avisar quando a data sair da faixa |
| PA-08 | `documentService` | A regra de negrito de linha inteira só reconhece os numerais romanos (`I` a `V`) seguidos do travessão “–”. Com hífen comum (“-”) ou do `VI` em diante, depende dos `**` do template | Aceitar também o hífen, se for o padrão desejado nos pareceres |
| PA-12 | Persistência | Os lotes de casos do Redator, da Defesa e da Tabela de Multas ficam no `sessionStorage` (uma cópia por tela), e os resultados do Controle, no `localStorage`; ambos com limite de cerca de 5 MB e só aviso no console quando estoura; dados pessoais sem expiração | Gravar só o necessário; usar IndexedDB; definir expiração |
| PA-18 | `aiService` | O prompt força o formato “fato gerador / dispositivo / penalidade”, mas os códigos 20013 e 20419 têm textos em outro formato (notificação cadastral) | Testar a saída desses códigos; usar prompt próprio |
| PA-20 | `buildInfracaoPdf` | O PDF é desenhado por coordenadas absolutas; com texto longo (várias infrações) a quebra de página pode desalinhar bordas e o quadro do AR (*a confirmar*) | Testar com 4 ou 5 códigos; tratar quebra de página |
| PA-23 | `get60BusinessDaysFromToday` | Os pareceres dizem “a contar da data desta decisão”, mas o prazo de 60 dias úteis conta a partir de hoje | Permitir informar a data da decisão |

### 17.3. Prioridade baixa (manutenção)

| ID | Onde | Problema |
| --- | --- | --- |
| PA-09 | `api.ts`, `defesas.ts`, `notificacoes.ts` | Duplicações: `CATEGORY_COLORS`, as funções `exportarParecerWord/PDF` e os tipos de payload (`ExportPayload` e `ExportarParecerPayload`) |
| PA-13 | `useRedatorNotificacao`, `useFiltroMatriculaLote` | A leitura do `@ControleAnalises:state` já está num lugar só (`lerCasosDoControleAnalises`), mas as telas continuam se comunicando pelo `localStorage`, e os dois hooks repetem a conversão dos casos aceitando vários nomes de campo alternativos |
| PA-19 | Interface | 404 renderizada dentro do `Layout` com `min-h-screen`; nomes do menu diferentes dos títulos das telas; tema escuro sem uso |
| PA-22 | `kvStorage` | Abre uma nova conexão com o IndexedDB a cada operação |

### 17.4. Itens resolvidos

| ID | Resolução |
| --- | --- |
| PA-01 | `useCalculadoraMulta`: o contador de ids começa depois do maior id salvo no `sessionStorage` (`syncUid`), e o laudo usa o primeiro e o último mês válidos em ordem cronológica (`getPeriodBounds`) |
| PA-04 | Textos dos templates da Ouvidoria corrigidos: “bem civil da” → “bem como da”, “proferida Pelo Prestador” → “proferida pelo Prestador” e “regularly” → “regularmente” |
| PA-15 | `throwApiError` (`http.ts`) repassa o `detail` da API nas funções de `api.ts` e `defesas.ts`; os alertas de download mostram a mensagem recebida |
| PA-03 | A opção **Violação de Corte** foi retirada de “Não é recurso”, que não tinha template e gerava só o marcador `[COLE AQUI A VERSÃO PARA VIOLAÇÃO DE CORTE QUANDO NÃO FOR RECURSO]`. Uma sessão antiga com essa combinação volta para leitura. Se a CAJ criar o texto para esse caso, basta devolver a opção e incluir o template |
| PA-07 | Regra única para o vermelho: `[EDIÇÃO PECULIAR]` e `<adicionar fato novo ao processo>` saem em vermelho no Word, no PDF (antes só o segundo) e na pré-visualização da Ouvidoria (antes só o primeiro), pela lista `RED_MARKERS` |
| PA-21 | README reescrito conforme o código: 5 módulos mais a gestão de usuários; login, banco e variáveis `DATABASE_URL`, `JWT_SECRET` e `JWT_EXPIRES_IN`; `npm run criar-admin`; `VITE_API_URL`; calculadora de dias úteis só em Retorno de Defesa e Ouvidoria; sem Date-fns, Axios e `GEMINI_API_KEY` (a chave do Gemini é de cada usuário, cadastrada no sistema) |
| PA-16 | O `vercel.json` declara `"includeFiles": ["public/**"]` no build do `@vercel/node`, e assim o `logo-docx-vale.jpg` entra no pacote da função. Confirmar após o próximo deploy que o logo aparece no Word e no PDF |
| PA-24 | Código 20419 (`notificacoes.ts`): as cláusulas `clauseMulta` e `clauseMultaCP` citavam “Resolução 19/2029”; agora citam “Resolução 19/2019, alterada pela Resolução 55/2026 – ARIS” |
| PA-11 | Não confirmado: no repositório, `defesas.ts` não tem linhas começando com hífen nem antes de `text:` nem dentro dos textos. Era resíduo da cópia do arquivo recebido |
| PA-08 (parcial) | A regra de negrito de linha inteira (`fullLineBoldRegex`) passou a reconhecer qualquer item numerado com dois dígitos (`\d{2}\.`), e não só de 01 a 03. Continua aberta a parte do travessão |

Também foram resolvidas partes de outros itens, que continuam abertos pelo que falta: a API passou a exigir login, a chave do Gemini deixou de ficar no navegador e passou a ser cadastrada por usuário, cifrada no banco, e o CORS passou a aceitar só as origens de `CORS_ORIGINS`, sem os cabeçalhos `*` do `vercel.json` (PA-14); o Controle de Análises deixou de gravar a lista filtrada (`resultadosFiltrados`), que agora é recalculada por `lerCasosDoControleAnalises`, e passou a gravar no `localStorage` só quando os dados mudam, e não a cada renderização (PA-12); o `funcionarioSelecionado` fixo em `null` foi removido do Redator, e o `useSessionStorage` passou a reler o valor quando a chave muda, sem gravar o valor antigo na chave nova (PA-22); a URL da API vem de `VITE_API_URL` e fica só em `auth.ts` (PA-09); a categoria “Acesso” passou a ser `acesso` (PA-10); `animate-fadeIn` foi definida; o `index.html` usa `lang="pt-BR"`, tem título (“Sistema CAJ - Notificações e Multas”), descrição do sistema e ícone (o logo da CAJ); a barra lateral e o login falam em notificações “Extrajudiciais” (PA-19).

## 18. Glossário

| Termo | Significado |
| --- | --- |
| **CAJ** | Companhia Águas de Joinville, prestadora do serviço |
| **ARIS** | Agência Reguladora; a Resolução ARIS nº 019/2019 define as infrações (Art. 144) e o acesso à ligação (Art. 69) |
| **IN 83/2025** | Instrução Normativa CAJ que permite rever multas por não padronização e prorrogar o prazo |
| **AI** | Auto de Infração |
| **Padronização / caixa padrão** | Adequação da ligação de água ao padrão técnico da CAJ, com instalação da caixa padrão |
| **Cavalete / ramal** | Estruturas da ligação de água; o corte pode ser feito em uma ou na outra |
| **HD** | Hidrômetro |
| **By-pass** | Derivação do ramal antes do hidrômetro |
| **AR** | Aviso de Recebimento dos Correios |
| **LA** | Ligação de água (“LA padronizada”, “LA cadastral”) |
| **Sansys** | Sistema comercial da CAJ, origem das planilhas e destino das tratativas |
| **K1** | Fator de complexidade do esgoto, por atividade do imóvel |
| **OP00002, 989** | Relatórios do Sansys usados no Controle de Análises |
| **Cód. 426, 3773, 10024/10082, 1073/1170** | Códigos de serviço usados na guia de tratativas da Ouvidoria (prorrogação, encerramento, alteração de fatura e contato ativo) |
