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

-- Update existing products to have original_price based on condition
UPDATE products 
SET original_price = CASE 
    WHEN condition = 'seminuevo' THEN price * 1.15  -- Add 15% to seminuevo products
    ELSE NULL
END
WHERE original_price IS NULL;
