### Configuração do Ambiente Back-end

Para inicializar a configuração do ambiente de desenvolvimento, acesse o diretório raiz do back-end via terminal e execute os comandos descritos a seguir:

```bash
# Instalação de todas as dependências do projeto
npm install

# Criação do arquivo de configuração de variáveis de ambiente
cp .env.example .env

# Inicialização do servidor 
npm run start

```

Por padrão, a API estará acessível através do endereço `http://localhost:3000` (a porta pode ser redefinida conforme a configuração do ambiente).

> **Nota:** Recomenda-se a verificação dos scripts definidos no arquivo `package.json` para certificar-se dos comandos exatos de inicialização e build do projeto.

---

### Variáveis de Ambiente

Para o funcionamento adequado dos microsserviços e integrações, é imprescindível a configuração do arquivo `.env` na raiz do diretório do back-end.

Defina os seguintes parâmetros de ambiente:

```env
GEMINI_API_KEY=inserir_chave_api_valida_gemini
PORT=3000

```

> **Aviso de Segurança:** O arquivo `.env` armazena credenciais e dados sensíveis da aplicação. Sob nenhuma circunstância este arquivo deve ser versionado em repositórios (públicos ou privados). Assegure-se de que a extensão esteja devidamente declarada no arquivo `.gitignore`.