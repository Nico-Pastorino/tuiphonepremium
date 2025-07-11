"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function MinimalNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setActiveSubmenu(null)
    // Prevenir scroll del body cuando el menú está abierto
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }

  const openSubmenu = (submenu: string) => {
    setActiveSubmenu(submenu)
  }

  const closeSubmenu = () => {
    setActiveSubmenu(null)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setActiveSubmenu(null)
    document.body.style.overflow = "unset"
  }

  // Cerrar menú al hacer clic en un enlace
  const handleLinkClick = () => {
    closeMenu()
  }

  const menuItems = [
    { name: "Inicio", href: "/", hasSubmenu: false },
    {
      name: "iPhones Usados Premium",
      href: "/productos?condition=seminuevo",
      hasSubmenu: true,
      submenu: "iphones-usados",
    },
    {
      name: "iPhones Nuevos",
      href: "/productos?category=iphone&condition=nuevo",
      hasSubmenu: true,
      submenu: "iphones-nuevos",
    },
    { name: "Macbooks", href: "/productos?category=mac", hasSubmenu: true, submenu: "macbooks" },
    { name: "iPads", href: "/productos?category=ipad", hasSubmenu: true, submenu: "ipads" },
    { name: "AirPods", href: "/productos?category=airpods", hasSubmenu: false },
    { name: "Contacto", href: "/contacto", hasSubmenu: false },
  ]

  const submenuItems = {
    "iphones-usados": [
      "iPhone 15",
      "iPhone 14 Pro Max",
      "iPhone 14 Pro",
      "iPhone 14 Plus",
      "iPhone 14",
      "iPhone 13 Pro Max",
      "iPhone 13 Pro",
      "iPhone 13",
      "iPhone 13 Mini",
      "iPhone 12 Pro Max",
      "iPhone 12 Pro",
      "iPhone 12",
    ],
    "iphones-nuevos": [
      "iPhone 15 Pro Max",
      "iPhone 15 Pro",
      "iPhone 15 Plus",
      "iPhone 15",
      "iPhone 14 Pro Max",
      "iPhone 14 Pro",
      "iPhone 14 Plus",
      "iPhone 14",
    ],
    macbooks: [
      "MacBook Air M3",
      "MacBook Air M2",
      'MacBook Pro 14"',
      'MacBook Pro 16"',
      'iMac 24"',
      "Mac Studio",
      "Mac Pro",
    ],
    ipads: ['iPad Pro 12.9"', 'iPad Pro 11"', "iPad Air", "iPad", "iPad Mini"],
  }

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Hamburger menu - Left */}
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleMenu}
              className={`transition-colors p-3 hover:bg-white/10 ${
                isScrolled ? "text-gray-900 hover:bg-gray-100" : "text-white"
              }`}
            >
              <Menu className="w-7 h-7" />
            </Button>

            {/* Logo - Center */}
            <Link href="/" className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 relative">
                <Image src="/logo-iphone-premium.png" alt="TuIphonepremium Logo" fill className="object-contain" />
              </div>
              <span
                className={`text-2xl font-bold transition-colors ${isScrolled ? "text-gray-900" : "text-white"} hidden sm:block`}
              >
                TuIphonepremium
              </span>
            </Link>

            {/* Empty space for balance - Right */}
            <div className="w-16"></div>
          </div>
        </div>
      </nav>

      {/* Slide-out menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMenu}
        />

        {/* Menu panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Main menu */}
          <div className={`h-full overflow-y-auto ${activeSubmenu ? "hidden" : "block"}`}>
            {/* Header con logo y close button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative">
                  <Image src="/logo-iphone-premium.png" alt="TuIphonepremium Logo" fill className="object-contain" />
                </div>
                <span className="text-white font-bold text-lg">TuIphonepremium</span>
              </div>
              <Button variant="ghost" size="sm" onClick={closeMenu} className="text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.hasSubmenu ? (
                    <button
                      onClick={() => openSubmenu(item.submenu!)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-50"
                    >
                      <span className="font-medium text-base">{item.name}</span>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className="block px-6 py-4 text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-50 font-medium text-base"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submenu */}
          {activeSubmenu && (
            <div className="h-full overflow-y-auto">
              {/* Submenu header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={closeSubmenu} className="text-white hover:bg-white/20">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-sm font-medium text-white uppercase tracking-wide">
                    {activeSubmenu === "iphones-usados" && "IPHONES USADOS PREMIUM"}
                    {activeSubmenu === "iphones-nuevos" && "IPHONES NUEVOS"}
                    {activeSubmenu === "macbooks" && "MACBOOKS"}
                    {activeSubmenu === "ipads" && "IPADS"}
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={closeMenu} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* "Ver todo" option */}
              <div className="py-2">
                <Link
                  href={`/productos?category=${activeSubmenu.replace("-usados", "").replace("-nuevos", "").replace("s", "")}`}
                  onClick={handleLinkClick}
                  className="block px-6 py-4 text-gray-900 hover:bg-gray-50 transition-colors font-medium text-base bg-gray-50/50"
                >
                  Ver todo en{" "}
                  {activeSubmenu === "iphones-usados"
                    ? "iPhones Usados Premium"
                    : activeSubmenu === "iphones-nuevos"
                      ? "iPhones Nuevos"
                      : activeSubmenu === "macbooks"
                        ? "Macbooks"
                        : "iPads"}
                </Link>
              </div>

              {/* Submenu items */}
              <div className="py-2">
                {submenuItems[activeSubmenu as keyof typeof submenuItems]?.map((item, index) => (
                  <Link
                    key={index}
                    href={`/productos/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={handleLinkClick}
                    className="block px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
