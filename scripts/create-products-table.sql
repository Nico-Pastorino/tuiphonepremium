-- Crear la tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('nuevo', 'seminuevo', 'usado')),
  images TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Política para permitir escritura autenticada (para administradores)
CREATE POLICY "Allow authenticated write access" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, description, price, original_price, category, condition, images, specifications, stock, featured) VALUES
('iPhone 15 Pro Max 256GB', 'El iPhone más avanzado con chip A17 Pro, sistema de cámaras Pro de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.', 1500000, 1600000, 'iphone', 'nuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Pantalla": "6.7\" Super Retina XDR", "Chip": "A17 Pro", "Cámara": "48MP Principal", "Almacenamiento": "256GB", "Batería": "Hasta 29 horas de video", "Resistencia": "IP68"}', 5, true),
('iPhone 14 Pro 128GB', 'iPhone 14 Pro en excelente estado, con Dynamic Island y sistema de cámaras Pro avanzado.', 950000, NULL, 'iphone', 'seminuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Pantalla": "6.1\" Super Retina XDR", "Chip": "A16 Bionic", "Cámara": "48MP Principal", "Almacenamiento": "128GB", "Batería": "Hasta 23 horas de video", "Resistencia": "IP68"}', 3, true),
('MacBook Air M2 13"', 'MacBook Air con chip M2, diseño ultradelgado y hasta 18 horas de batería.', 1200000, 1350000, 'mac', 'nuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Pantalla": "13.6\" Liquid Retina", "Chip": "Apple M2", "Memoria": "8GB RAM", "Almacenamiento": "256GB SSD", "Batería": "Hasta 18 horas", "Peso": "1.24 kg"}', 8, true),
('iPad Pro 11" M2', 'iPad Pro con chip M2, pantalla Liquid Retina y compatibilidad con Apple Pencil.', 800000, 900000, 'ipad', 'nuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Pantalla": "11\" Liquid Retina", "Chip": "Apple M2", "Cámara": "12MP Principal", "Almacenamiento": "128GB", "Batería": "Hasta 10 horas", "Compatibilidad": "Apple Pencil 2"}', 6, false),
('Apple Watch Series 9 45mm', 'Apple Watch Series 9 con chip S9, pantalla Always-On más brillante y nuevas funciones de salud.', 450000, 500000, 'watch', 'nuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Pantalla": "45mm Always-On Retina", "Chip": "S9 SiP", "Sensores": "ECG, Oxígeno en sangre", "Resistencia": "WR50", "Batería": "Hasta 18 horas", "Conectividad": "GPS + Cellular"}', 12, false),
('AirPods Pro 2da Gen', 'AirPods Pro de 2da generación con cancelación activa de ruido mejorada y audio espacial personalizado.', 280000, 320000, 'airpods', 'nuevo', ARRAY['/placeholder.svg?height=400&width=400'], '{"Chip": "H2", "Cancelación de ruido": "Activa", "Audio espacial": "Personalizado", "Batería": "Hasta 6 horas", "Batería total": "Hasta 30 horas", "Resistencia": "IPX4"}', 15, true);
