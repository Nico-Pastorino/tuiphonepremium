-- Add the price_usd column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'price_usd'
    ) THEN
        ALTER TABLE products ADD COLUMN price_usd DECIMAL(10,2);
    END IF;
END $$;

-- Update existing products to have price_usd based on current price (assuming 1000 peso = 1 USD as example)
UPDATE products 
SET price_usd = ROUND(price / 1000, 2)
WHERE price_usd IS NULL AND price > 0;
