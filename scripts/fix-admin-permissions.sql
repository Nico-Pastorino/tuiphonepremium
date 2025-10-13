-- Primero, eliminamos todas las políticas existentes
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow service role full access" ON products;
DROP POLICY IF EXISTS "Allow authenticated write access" ON products;
DROP POLICY IF EXISTS "Allow authenticated update access" ON products;
DROP POLICY IF EXISTS "Allow anonymous insert for admin" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON products;
DROP POLICY IF EXISTS "Allow public read access (site_config)" ON site_config;
DROP POLICY IF EXISTS "Allow service role full access (site_config)" ON site_config;

-- Deshabilitamos RLS temporalmente para operaciones de admin
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_config DISABLE ROW LEVEL SECURITY;

-- Verificamos que la tabla tenga las columnas correctas
DO $$ 
BEGIN 
    -- Agregar original_price si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'original_price'
    ) THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    END IF;
    
    -- Agregar price_usd si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'price_usd'
    ) THEN
        ALTER TABLE products ADD COLUMN price_usd DECIMAL(10,2);
    END IF;
END $$;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_site_config_updated_at ON site_config(updated_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Garantizar que la tabla site_config tenga las filas principales
INSERT INTO site_config (key, value, updated_at) VALUES
  ('home', '{}'::jsonb, NOW()),
  ('trade-in', jsonb_build_object('updatedAt', to_char(timezone('UTC', now()), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'sections', '[]'::jsonb), NOW())
ON CONFLICT (key) DO NOTHING;
