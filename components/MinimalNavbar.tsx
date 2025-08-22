"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

export function MinimalNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = "unset"
  }

  const handleLinkClick = () => {
    closeMenu()
  }

  const menuItems = [
    { name: "Inicio", href: "/", hasSubmenu: false },
    { name: "iPhones Usados Premium", href: "/productos?condition=seminuevo", hasSubmenu: false },
    { name: "iPhones Nuevos", href: "/productos?category=iphone&condition=nuevo", hasSubmenu: false },
    { name: "Macbooks", href: "/productos?category=mac", hasSubmenu: false },
    { name: "iPads", href: "/productos?category=ipad", hasSubmenu: false },
    { name: "AirPods", href: "/productos?category=airpods", hasSubmenu: false },
    { name: "Accesorios", href: "/productos?category=accesorios", hasSubmenu: false },
    { name: "Contacto", href: "/contacto", hasSubmenu: false },
  ]

  return (
    <>
      {/* Navbar flotante responsive */}
      <nav
        className={`fixed top-4 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg rounded-full overflow-hidden ${isMenuOpen ? "z-30" : "z-50"}`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          {/* Logo alineado a la izquierda */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
              <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white transition-colors">
              TuIphonepremium
            </span>
          </Link>

          {/* Botón hamburguesa */}
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleMenu}
            className="transition-all duration-300 p-3 rounded-xl text-white hover:bg-white/20 backdrop-blur-sm"
            aria-label="Abrir menú"
          >
            <div className="w-7 h-7 flex flex-col justify-center items-center">
              <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out -translate-y-1" />
              <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out" />
              <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out translate-y-1" />
            </div>
          </Button>
        </div>
      </nav>

      {/* Slide-out menu - Responsive */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Menu panel - Responsive width */}
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-80 md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto">
            {/* Header responsive - Logo más grande */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center gap-3 sm:gap-3">
                <div className="w-10 h-10 sm:w-10 sm:h-10 relative flex-shrink-0">
                  <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-bold text-lg sm:text-lg">TuIphonepremium</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Menu items - Touch-friendly con texto más grande */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="block px-5 sm:px-6 py-5 sm:py-5 text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 font-semibold text-base sm:text-base touch-manipulation"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Footer del menú - Solo en móvil con texto más grande */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gray-50 border-t border-gray-200 sm:hidden">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3 font-medium">¿Necesitas ayuda?</p>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
                >
                  <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
