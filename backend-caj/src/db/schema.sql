-- Tabela de usuários do Sistema CAJ.
-- Executada automaticamente pelo script `npm run criar-admin`,
-- mas também pode ser colada no SQL Editor do Supabase.
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  usuario       VARCHAR(50)  NOT NULL UNIQUE,
  nome          VARCHAR(120) NOT NULL,
  senha_hash    TEXT         NOT NULL,
  perfil        VARCHAR(20)  NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin', 'usuario')),
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- O backend acessa o banco direto (conexão Postgres), não pela API pública do Supabase.
-- Ativar RLS sem políticas bloqueia o acesso à tabela pela API REST/anon key do Supabase.
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
