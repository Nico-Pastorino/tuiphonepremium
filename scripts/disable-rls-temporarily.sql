-- Temporarily disable RLS for products table to allow admin operations
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled but allow all operations, use this instead:
-- DROP POLICY IF EXISTS "Allow public read access" ON products;
-- DROP POLICY IF EXISTS "Allow service role full access" ON products;
-- DROP POLICY IF EXISTS "Allow authenticated write access" ON products;
-- DROP POLICY IF EXISTS "Allow authenticated update access" ON products;
-- DROP POLICY IF EXISTS "Allow anonymous insert for admin" ON products;

-- CREATE POLICY "Allow all operations" ON products FOR ALL USING (true) WITH CHECK (true);
