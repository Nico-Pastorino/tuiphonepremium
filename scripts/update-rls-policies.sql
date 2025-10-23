-- Re-enable row level security so that policies apply
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config FORCE ROW LEVEL SECURITY;

-- Drop existing policies for products
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow authenticated write access" ON products;
DROP POLICY IF EXISTS "Allow authenticated update access" ON products;
DROP POLICY IF EXISTS "Allow anonymous insert for admin" ON products;
DROP POLICY IF EXISTS "Allow service role full access" ON products;

-- Drop existing policies for site_config
DROP POLICY IF EXISTS "Allow public read access (site_config)" ON site_config;
DROP POLICY IF EXISTS "Allow service role full access (site_config)" ON site_config;

-- Create new policies that are more permissive for admin operations
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  TO anon
  USING (true);

-- Allow all operations for service role (admin operations)
CREATE POLICY "Allow service role full access" ON products
  FOR ALL
  TO service_role
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role' OR
    current_setting('role') = 'service_role'
  )
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role' OR
    current_setting('role') = 'service_role'
  );

-- Allow authenticated users to read and insert/update (for future user features)
CREATE POLICY "Allow authenticated write access" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access" ON products
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Temporary policy to allow anonymous inserts (can be removed later if needed)
CREATE POLICY "Allow anonymous insert for admin" ON products
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policies for site_config table (home + trade-in configuration)
CREATE POLICY "Allow public read access (site_config)" ON site_config
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow service role full access (site_config)" ON site_config
  FOR ALL
  TO service_role
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
