import Link from "next/link"
import { MinimalNavbar } from "@/components/MinimalNavbar"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/AnimatedSection"

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
              <p className="text-gray-600 mb-8">
                El producto que estás buscando no existe o fue eliminado. Explora nuestra tienda para encontrar otras opciones.
              </p>
              <Button asChild>
                <Link href="/productos">Volver a productos</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
