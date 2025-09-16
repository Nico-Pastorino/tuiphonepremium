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
    if (!isHomePage) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

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
      {/* Navbar - Logo y texto más grandes en móvil */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl flex items-center justify-between px-6 py-4 rounded-3xl shadow-lg z-50 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="flex items-center gap-4">
          <Image src="/logo-final.png" alt="TuiPhonepremium Logo" width={40} height={40} className="object-contain" />
          <span className="text-2xl font-bold text-white">TuIphonepremium</span>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={toggleMenu}
          className="transition-all duration-300 p-3 rounded-xl text-white ml-auto"
          aria-label="Abrir menú"
        >
          <div className="w-7 h-7 flex flex-col justify-center items-center">
            <span className="block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out -translate-y-1" />
            <span className="block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out" />
            <span className="block h-0.5 w-6 bg-white transition-all duration-300 ease-in-out translate-y-1" />
          </div>
        </Button>
      </nav>

      {/* Slide-out menu - Responsive y profesional UX/UI */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeMenu}
        />

        {/* Menu panel - Gradiente, logo alineado y botón cerrar */}
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-80 md:w-96 bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl transform transition-transform duration-300 z-50 rounded-l-3xl flex flex-col` + (isMenuOpen ? " translate-x-0" : " translate-x-full")}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Image src="/logo-final.png" alt="TuiPhonepremium Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-white">TuIphonepremium</span>
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
          <div className="py-2 flex-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={handleLinkClick}
                className="block px-8 py-5 text-white hover:bg-white/10 active:bg-white/20 transition-colors border-b border-white/10 font-semibold text-base touch-manipulation"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="p-6 bg-white/10 border-t border-white/10">
            <div className="text-center">
              <p className="text-sm text-white mb-3 font-medium">¿Necesitas ayuda?</p>
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
    </>
  )
}
