-- Hacer que la columna price_usd sea nullable si no lo es ya
ALTER TABLE products ALTER COLUMN price_usd DROP NOT NULL;

-- Verificar la estructura de la tabla
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public';

-- Comentario: Este script permite que price_usd sea opcional (NULL)
-- para productos que no tienen precio en dólares definido
