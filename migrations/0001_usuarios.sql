-- Fase 0 da plataforma de gestão: usuários do painel e seus papéis.
-- Só cria tabela nova. Não altera nenhuma tabela usada pela venda.
-- Enquanto esta tabela estiver vazia (ou não existir), quem está em ADMIN_EMAILS continua entrando como Super Admin.
CREATE TABLE IF NOT EXISTS usuarios (
  email TEXT PRIMARY KEY,
  nome TEXT,
  papel TEXT NOT NULL CHECK (papel IN ('super_admin', 'admin', 'operacional', 'financeiro', 'supervisor')),
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  autor TEXT
);
