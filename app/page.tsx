import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white p-4">
        <h1 className="text-2xl font-bold text-center">Bienvenido a nuestra tienda</h1>
      </header>
      <main className="flex-1 bg-gray-100 p-4">
        <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Encuentra el producto Apple que estás buscando
        </p>
        {/* rest of code here */}
      </main>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/productos" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/cuotas" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                  Financiación
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors">
                  Administración
                </Link>
              </li>
            </ul>
          </div>
          {/* rest of code here */}
        </div>
      </footer>
    </div>
  )
}
