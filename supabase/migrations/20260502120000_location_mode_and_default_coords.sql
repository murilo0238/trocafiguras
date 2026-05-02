-- Adiciona suporte a três modos de localização:
-- 'inactive' = não aparece nas buscas
-- 'default'  = ponto fixo de troca (capturado uma vez via GPS)
-- 'real'     = GPS atualizado a cada busca

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS default_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS default_longitude NUMERIC;
