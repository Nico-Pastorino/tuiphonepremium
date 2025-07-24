-- Primero, eliminamos todas las políticas existentes
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow service role full access" ON products;
DROP POLICY IF EXISTS "Allow authenticated write access" ON products;
DROP POLICY IF EXISTS "Allow authenticated update access" ON products;
DROP POLICY IF EXISTS "Allow anonymous insert for admin" ON products;
DROP POLICY IF EXISTS "Allow all operations" ON products;

-- Deshabilitamos RLS temporalmente para operaciones de admin
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

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
