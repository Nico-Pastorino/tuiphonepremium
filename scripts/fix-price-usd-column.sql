-- Hacer que la columna price_usd sea opcional (nullable)
ALTER TABLE products ALTER COLUMN price_usd DROP NOT NULL;

-- Agregar un comentario para documentar el cambio
COMMENT ON COLUMN products.price_usd IS 'Precio en USD - opcional, puede ser null si no se especifica';

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
