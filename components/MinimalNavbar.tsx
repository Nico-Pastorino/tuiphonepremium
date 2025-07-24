"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function MinimalNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  useEffect(() => {
    if (!isHomePage) return // Solo escuchar scroll en la página de inicio

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevenir scroll del body cuando el menú está abierto
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

  // Cerrar menú al hacer clic en un enlace
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
    { name: "Contacto", href: "/contacto", hasSubmenu: false },
  ]

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 transition-all duration-500 ${
          isHomePage
            ? isScrolled
              ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
              : "bg-transparent"
            : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
        } ${isMenuOpen ? "z-30" : "z-50"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Empty space for balance - Left */}
            <div className="w-16"></div>

            {/* Logo - Center */}
            <Link href="/" className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 relative">
                <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
              </div>
              <span
                className={`text-2xl font-bold transition-colors ${
                  isHomePage ? "text-white" : "text-white"
                } hidden sm:block`}
              >
                TuIphonepremium
              </span>
            </Link>

            {/* Botón hamburguesa integrado en el navbar */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleMenu}
                className={`transition-all duration-300 p-3 rounded-xl ${
                  isHomePage
                    ? isScrolled || isMenuOpen
                      ? "text-white hover:bg-white/20 backdrop-blur-sm"
                      : "text-white hover:bg-white/10 backdrop-blur-sm"
                    : "text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                <div className="w-7 h-7 flex flex-col justify-center items-center">
                  <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out -translate-y-1" />
                  <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out" />
                  <span className="block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out translate-y-1" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-out menu desde la derecha */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Menu panel - Desde la derecha */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Main menu */}
          <div className={`h-full overflow-y-auto`}>
            {/* Header con nuevo logo y botón cerrar */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/logo-final.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-bold text-lg">TuIphonepremium</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeMenu}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="block px-6 py-4 text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-50 font-medium text-base"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
