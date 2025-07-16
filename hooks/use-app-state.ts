"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/types/product"

interface CartItem extends Product {
  quantity: number
  selectedColor?: string
  selectedStorage?: string
}

interface AppState {
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, options?: { color?: string; storage?: string }) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemsCount: () => number

  // Wishlist
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean

  // Compare
  compareList: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  clearCompare: () => void
  isInCompare: (productId: string) => boolean

  // UI State
  isSearchOpen: boolean
  setSearchOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Notifications
  notifications: Array<{
    id: string
    type: "success" | "error" | "info" | "warning"
    title: string
    message: string
    timestamp: number
  }>
  addNotification: (notification: Omit<AppState["notifications"][0], "id" | "timestamp">) => void
  removeNotification: (id: string) => void
}

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart
      cart: [],
      addToCart: (product, options) => {
        const existingItem = get().cart.find(
          (item) =>
            item.id === product.id &&
            item.selectedColor === options?.color &&
            item.selectedStorage === options?.storage,
        )

        if (existingItem) {
          get().updateQuantity(product.id, existingItem.quantity + 1)
        } else {
          set((state) => ({
            cart: [
              ...state.cart,
              {
                ...product,
                quantity: 1,
                selectedColor: options?.color,
                selectedStorage: options?.storage,
              },
            ],
          }))
        }

        get().addNotification({
          type: "success",
          title: "Producto agregado",
          message: `${product.name} se agregó al carrito`,
        })
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set((state) => ({
          cart: state.cart.map((item) => (item.id === productId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCartItemsCount: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0)
      },

      // Wishlist
      wishlist: [],
      addToWishlist: (product) => {
        if (!get().isInWishlist(product.id)) {
          set((state) => ({ wishlist: [...state.wishlist, product] }))
          get().addNotification({
            type: "success",
            title: "Agregado a favoritos",
            message: `${product.name} se agregó a tus favoritos`,
          })
        }
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== productId),
        }))
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId)
      },

      // Compare
      compareList: [],
      addToCompare: (product) => {
        const compareList = get().compareList
        if (compareList.length >= 3) {
          get().addNotification({
            type: "warning",
            title: "Límite alcanzado",
            message: "Solo puedes comparar hasta 3 productos",
          })
          return
        }

        if (!get().isInCompare(product.id)) {
          set((state) => ({ compareList: [...state.compareList, product] }))
        }
      },

      removeFromCompare: (productId) => {
        set((state) => ({
          compareList: state.compareList.filter((item) => item.id !== productId),
        }))
      },

      clearCompare: () => set({ compareList: [] }),

      isInCompare: (productId) => {
        return get().compareList.some((item) => item.id === productId)
      },

      // UI State
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const id = Date.now().toString()
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              timestamp: Date.now(),
            },
          ],
        }))

        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
    }),
    {
      name: "tuiphone-app-state",
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        compareList: state.compareList,
      }),
    },
  ),
)
