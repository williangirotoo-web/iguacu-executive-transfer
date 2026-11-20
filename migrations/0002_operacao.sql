-- Fase 1 (pacote 1) da plataforma de gestão: frota, motoristas e o registro operacional de cada serviço.
-- Só cria tabelas novas (CREATE IF NOT EXISTS): pode ser rodada mais de uma vez sem problema. Nada usado pela venda é alterado.

CREATE TABLE IF NOT EXISTS motoristas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  idiomas TEXT NOT NULL DEFAULT 'pt',            -- ex.: 'pt,es,en'
  tipo TEXT NOT NULL DEFAULT 'proprio' CHECK (tipo IN ('proprio', 'parceiro')),
  parceiro_id INTEGER REFERENCES parceiros(id),  -- quando o motorista é de um parceiro
  cnh_validade TEXT,                             -- AAAA-MM-DD (só a validade, nunca o número)
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'folga', 'inativo')),
  pagamento_modelo TEXT NOT NULL DEFAULT 'servico' CHECK (pagamento_modelo IN ('diaria', 'servico', 'ambos')),
  valor_diaria REAL,
  valor_servico REAL,
  chave_hash TEXT, chave_em TEXT,                -- acesso ao portal do motorista (pacote 3)
  obs TEXT,
  criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_motoristas_status ON motoristas(status);

CREATE TABLE IF NOT EXISTS veiculos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placa TEXT UNIQUE NOT NULL,                    -- sem hífen, maiúsculas
  marca TEXT, modelo TEXT NOT NULL, ano INTEGER, cor TEXT,
  categoria TEXT NOT NULL,                       -- comum, exec, suv, sete, luxo, van
  lugares INTEGER NOT NULL, malas INTEGER NOT NULL DEFAULT 3,
  dono TEXT NOT NULL DEFAULT 'iet' CHECK (dono IN ('iet', 'parceiro', 'alugado')),
  parceiro_id INTEGER REFERENCES parceiros(id),
  motorista_padrao_id INTEGER REFERENCES motoristas(id),
  licenciamento_validade TEXT, seguro_validade TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'oficina', 'inativo')),
  obs TEXT,
  criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL
);

-- folga, férias, oficina: entram na checagem de conflito (pacote 2)
CREATE TABLE IF NOT EXISTS indisponibilidades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  motorista_id INTEGER REFERENCES motoristas(id),
  veiculo_id INTEGER REFERENCES veiculos(id),
  inicio TEXT NOT NULL, fim TEXT NOT NULL, motivo TEXT,
  criado_em TEXT NOT NULL, autor TEXT
);

-- um registro operacional para cada item (trecho) de pedido pago ou confirmado
CREATE TABLE IF NOT EXISTS servicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER UNIQUE NOT NULL REFERENCES itens(id),
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  inicio_utc TEXT NOT NULL,
  fim_previsto_utc TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'a_atribuir',
  motorista_id INTEGER REFERENCES motoristas(id),
  veiculo_id INTEGER REFERENCES veiculos(id),
  parceiro_id INTEGER REFERENCES parceiros(id),
  custo_previsto REAL,
  confirmado_em TEXT, a_caminho_em TEXT, no_local_em TEXT, embarque_em TEXT, concluido_em TEXT,
  recebido_valor REAL, recebido_forma TEXT,
  importado INTEGER NOT NULL DEFAULT 0,          -- 1 = serviço antigo trazido na primeira sincronização
  obs_operacao TEXT,
  criado_em TEXT NOT NULL, atualizado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_servicos_inicio ON servicos(inicio_utc);
CREATE INDEX IF NOT EXISTS idx_servicos_motorista ON servicos(motorista_id, inicio_utc);
CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status, inicio_utc);

-- quanto tempo cada serviço do catálogo ocupa o motorista (sobrepõe o padrão calculado no código)
CREATE TABLE IF NOT EXISTS duracoes (
  servico_id TEXT PRIMARY KEY,
  minutos INTEGER NOT NULL,
  folga_fronteira_min INTEGER NOT NULL DEFAULT 0,
  atualizado_em TEXT NOT NULL, autor TEXT
);
