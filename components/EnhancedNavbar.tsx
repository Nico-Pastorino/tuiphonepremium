"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Search, Menu, Smartphone, Tablet, Laptop, Watch, Headphones, Cable } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  {
    title: "iPhone",
    href: "/productos?category=iphone",
    description: "Los últimos modelos de iPhone",
    icon: Smartphone,
  },
  {
    title: "iPad",
    href: "/productos?category=ipad",
    description: "Tablets para trabajo y creatividad",
    icon: Tablet,
  },
  {
    title: "Mac",
    href: "/productos?category=mac",
    description: "Computadoras de alto rendimiento",
    icon: Laptop,
  },
  {
    title: "Apple Watch",
    href: "/productos?category=watch",
    description: "Tecnología wearable avanzada",
    icon: Watch,
  },
  {
    title: "AirPods",
    href: "/productos?category=airpods",
    description: "Audio inalámbrico premium",
    icon: Headphones,
  },
  {
    title: "Accesorios",
    href: "/productos?category=accesorios",
    description: "Complementos perfectos",
    icon: Cable,
  },
]

export function EnhancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/productos?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 z-10">
            <div className="w-10 h-10 lg:w-12 lg:h-12 relative">
              <Image src="/logo-negro.png" alt="TuIphonepremium Logo" fill className="object-contain" />
            </div>
            <span className="text-xl lg:text-2xl font-bold transition-colors hidden sm:block text-black">
              TuIphonepremium
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-black hover:text-blue-600 transition-colors">
                    Productos
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((category) => (
                        <ListItem key={category.title} title={category.title} href={category.href} className="group">
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                            <span className="text-sm text-gray-600">{category.description}</span>
                          </div>
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/cuotas" className="text-black hover:text-blue-600 transition-colors font-medium">
              Cuotas
            </Link>
            <Link href="/contacto" className="text-black hover:text-blue-600 transition-colors font-medium">
              Contacto
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </form>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-black">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="search"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </form>

                  {/* Mobile Navigation */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">Productos</h3>
                      {categories.map((category) => (
                        <Link
                          key={category.title}
                          href={category.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <category.icon className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{category.title}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <Link
                        href="/cuotas"
                        className="block p-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-900"
                      >
                        Cuotas
                      </Link>
                      <Link
                        href="/contacto"
                        className="block p-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-900"
                      >
                        Contacto
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string
  title: string
  children: React.ReactNode
  href: string
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
