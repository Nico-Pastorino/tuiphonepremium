import type { ReactElement } from "react"
import Link from "next/link"
import { Box, DollarSign, Settings, CreditCard } from "lucide-react"

interface AdminMenuItem {
  name: string
  href: string
  icon: ReactElement
}

const adminMenu: AdminMenuItem[] = [
  { name: "Productos", href: "/admin/productos", icon: <Box className="w-5 h-5" /> },
  { name: "Cuotas", href: "/admin/cuotas", icon: <CreditCard className="w-5 h-5" /> },
  { name: "Dolar", href: "/admin/dolar", icon: <DollarSign className="w-5 h-5" /> },
  { name: "Configuracion", href: "/admin/configuracion", icon: <Settings className="w-5 h-5" /> },
]

export default function AdminNavbar() {
  return (
    <nav className="flex flex-col gap-2">
      {adminMenu.map((item) => (
        <Link key={item.name} href={item.href} className="menu-item flex items-center gap-2">
          {item.icon}
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}
