-- Add the original_price column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'original_price'
    ) THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    END IF;
END $$;

-- Ensure seminuevo products do not carry an automatic discount
UPDATE products
SET original_price = NULL
WHERE condition = 'seminuevo';
