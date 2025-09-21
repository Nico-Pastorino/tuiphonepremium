import Link from "next/link";

const adminTabs = [
  { name: "Productos", href: "/admin/productos" },
  { name: "Cuotas", href: "/admin/cuotas" },
  { name: "Dólar", href: "/admin/dolar" },
  { name: "Configuración", href: "/admin/configuracion" },
]

export default function AdminTabs() {
  return (
    <div className="tabs">
      {adminTabs.map((tab) => (
        <Link key={tab.name} href={tab.href} className="tab-item">
          {tab.name}
        </Link>
      ))}
    </div>
  )
}
