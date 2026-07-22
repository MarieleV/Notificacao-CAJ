### Configurando o Back-end

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
