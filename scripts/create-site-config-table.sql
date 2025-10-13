-- Create table to store JSON configuration for home page and trade-in modules
CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes to speed up lookups
CREATE INDEX IF NOT EXISTS idx_site_config_updated_at ON site_config(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Allow read access for public role (needed for serverless functions that run as anon)
CREATE POLICY "Allow public read access (site_config)" ON site_config
  FOR SELECT
  USING (true);

-- Allow Supabase service role to manage configuration
CREATE POLICY "Allow service role full access (site_config)" ON site_config
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
    OR current_setting('role', true) = 'service_role'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR auth.role() = 'service_role'
    OR current_setting('role', true) = 'service_role'
  );

-- Prime table with default configuration payloads
WITH iso_now AS (
  SELECT to_char(timezone('UTC', now()), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS iso_value
)
INSERT INTO site_config (key, value, updated_at)
SELECT
  'home',
  jsonb_build_object(
    'heroImage', '/portada.jpg',
    'heroHeadline', 'Los mejores productos Apple de Argentina',
    'heroSubheadline', 'Descubre nuestra seleccion premium de iPhone, iPad, Mac y accesorios con garantia oficial.',
    'promoMessage', 'Productos nuevos y seminuevos con garantia y entrega inmediata.',
    'whatsappNumber', '5491112345678',
    'tradeInTitle', 'Plan canje',
    'tradeInSubtitle', 'Tomamos tu Apple usado y te ayudamos a renovar tu equipo.',
    'sections', jsonb_build_array(
      jsonb_build_object('id', 'categories', 'label', 'Explorar por categoria', 'enabled', true),
      jsonb_build_object('id', 'featured', 'label', 'Productos destacados', 'enabled', true),
      jsonb_build_object('id', 'benefits', 'label', 'Beneficios', 'enabled', true),
      jsonb_build_object('id', 'trade-in', 'label', 'Plan canje', 'enabled', true),
      jsonb_build_object('id', 'cta', 'label', 'Llamado a la accion', 'enabled', true)
    )
  ),
  timezone('UTC', now())
ON CONFLICT (key)
DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

WITH iso_now AS (
  SELECT to_char(timezone('UTC', now()), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS iso_value
)
INSERT INTO site_config (key, value, updated_at)
SELECT
  'trade-in',
  jsonb_build_object(
    'updatedAt', iso_now.iso_value,
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'batteries',
        'title', 'Equipos',
        'description', 'Valores estimativos segun estado y bateria.',
        'storageColumns', jsonb_build_array(
          jsonb_build_object(
            'id', '64gb', 'label', '64GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          ),
          jsonb_build_object(
            'id', '128gb', 'label', '128GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          ),
          jsonb_build_object(
            'id', '256gb', 'label', '256GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          )
        ),
        'rows', jsonb_build_array(
          jsonb_build_object(
            'id', 'iphone-11',
            'label', '11',
            'values', jsonb_build_object(
              '64gb', jsonb_build_object('under90', 150, 'over90', 160),
              '128gb', jsonb_build_object('under90', 190, 'over90', 200),
              '256gb', jsonb_build_object('under90', 200, 'over90', 210),
              '512gb', jsonb_build_object('under90', null, 'over90', null)
            )
          ),
          jsonb_build_object(
            'id', 'iphone-11-pro',
            'label', '11 Pro',
            'values', jsonb_build_object(
              '64gb', jsonb_build_object('under90', 180, 'over90', 190),
              '128gb', jsonb_build_object('under90', null, 'over90', null),
              '256gb', jsonb_build_object('under90', 190, 'over90', 200),
              '512gb', jsonb_build_object('under90', null, 'over90', null)
            )
          ),
          jsonb_build_object(
            'id', 'iphone-12',
            'label', '12',
            'values', jsonb_build_object(
              '64gb', jsonb_build_object('under90', 180, 'over90', 190),
              '128gb', jsonb_build_object('under90', 200, 'over90', 210),
              '256gb', jsonb_build_object('under90', 220, 'over90', 230),
              '512gb', jsonb_build_object('under90', null, 'over90', null)
            )
          )
        )
      ),
      jsonb_build_object(
        'id', 'equipos',
        'title', 'Equipos',
        'description', 'Modelos premium con mejor cotizacion.',
        'storageColumns', jsonb_build_array(
          jsonb_build_object(
            'id', '128gb', 'label', '128GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          ),
          jsonb_build_object(
            'id', '256gb', 'label', '256GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          ),
          jsonb_build_object(
            'id', '512gb', 'label', '512GB',
            'conditions', jsonb_build_array(
              jsonb_build_object('id', 'under90', 'label', '-90%'),
              jsonb_build_object('id', 'over90', 'label', '90+')
            )
          )
        ),
        'rows', jsonb_build_array(
          jsonb_build_object(
            'id', 'iphone-13',
            'label', '13',
            'values', jsonb_build_object(
              '128gb', jsonb_build_object('under90', 260, 'over90', 270),
              '256gb', jsonb_build_object('under90', 290, 'over90', 300),
              '64gb', jsonb_build_object('under90', null, 'over90', null),
              '512gb', jsonb_build_object('under90', null, 'over90', null)
            )
          ),
          jsonb_build_object(
            'id', 'iphone-14-pro',
            'label', '14 Pro',
            'values', jsonb_build_object(
              '128gb', jsonb_build_object('under90', 480, 'over90', 490),
              '256gb', jsonb_build_object('under90', 500, 'over90', 510),
              '512gb', jsonb_build_object('under90', 550, 'over90', 560),
              '64gb', jsonb_build_object('under90', null, 'over90', null)
            )
          ),
          jsonb_build_object(
            'id', 'iphone-15-pro-max',
            'label', '15 Pro Max',
            'values', jsonb_build_object(
              '128gb', jsonb_build_object('under90', null, 'over90', null),
              '256gb', jsonb_build_object('under90', 780, 'over90', 790),
              '512gb', jsonb_build_object('under90', 810, 'over90', 820),
              '64gb', jsonb_build_object('under90', null, 'over90', null)
            )
          )
        )
      )
    )
  ),
  timezone('UTC', now())
FROM iso_now
ON CONFLICT (key)
DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;
