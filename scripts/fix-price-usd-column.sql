-- Make price_usd column nullable to allow products without USD pricing
ALTER TABLE products ALTER COLUMN price_usd DROP NOT NULL;

-- Also make original_price nullable if it isn't already
ALTER TABLE products ALTER COLUMN original_price DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN products.price_usd IS 'USD price - nullable for products without USD pricing';
COMMENT ON COLUMN products.original_price IS 'Original price before discount - nullable';

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('price_usd', 'original_price');
