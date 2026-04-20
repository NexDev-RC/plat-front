import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Course } from '@/types'

interface CartItem {
  course: Course
  addedAt: string
}

interface CartState {
  items: CartItem[]
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  addToCart: (course: Course) => void
  removeFromCart: (courseId: string) => void
  clearCart: () => void
  isInCart: (courseId: string) => boolean
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addToCart: (course) => {
        if (get().isInCart(course.id)) return
        set((state) => ({
          items: [...state.items, { course, addedAt: new Date().toISOString() }],
        }))
      },

      removeFromCart: (courseId) =>
        set((state) => ({
          items: state.items.filter((i) => i.course.id !== courseId),
        })),

      clearCart: () => set({ items: [] }),

      isInCart: (courseId) => get().items.some((i) => i.course.id === courseId),

      total: () =>
        get().items.reduce((sum, item) => {
          const price = item.course.discountPrice ?? item.course.price
          return sum + price
        }, 0),
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
