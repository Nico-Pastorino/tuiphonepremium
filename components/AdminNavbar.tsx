;"tsx"
import Link from 'next/link';
import { Box, DollarSign, Settings, CreditCard } from 'lucide-react';

const adminMenu = [
  { name: "Productos", href: "/admin/productos", icon: <Box className="w-5 h-5" /> },
  { name: "Cuotas", href: "/admin/cuotas", icon: <CreditCard className="w-5 h-5" /> },
  { name: "Dólar", href: "/admin/dolar", icon: <DollarSign className="w-5 h-5" /> },
  { name: "Configuración", href: "/admin/configuracion", icon: <Settings className="w-5 h-5" /> },
]

// Renderiza solo las opciones del menú
export default function AdminNav() {
  return (
    <nav>
      {adminMenu.map((item) => (
        <Link key={item.name} href={item.href} className="menu-item flex items-center gap-2">
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}