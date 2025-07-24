-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow authenticated write access" ON products;

-- Create new policies that are more permissive for admin operations
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Allow all operations for service role (admin operations)
CREATE POLICY "Allow service role full access" ON products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.role() = 'service_role' OR
    current_setting('role') = 'service_role'
  );

-- Allow authenticated users to read and insert/update (for future user features)
CREATE POLICY "Allow authenticated write access" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update access" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Temporary policy to allow anonymous inserts (can be removed later if needed)
CREATE POLICY "Allow anonymous insert for admin" ON products
  FOR INSERT WITH CHECK (true);
