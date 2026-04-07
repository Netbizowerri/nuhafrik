import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existingItemIndex = get().items.findIndex(
          (item) =>
            item.product_id === newItem.product_id &&
            item.size === newItem.size &&
            item.color === newItem.color
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...get().items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          updatedItems[existingItemIndex].subtotal =
            updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
          set({ items: updatedItems });
        } else {
          set({ items: [...get().items, newItem] });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) =>
              !(item.product_id === productId && item.size === size && item.color === color)
          ),
        });
      },
      updateQuantity: (productId, size, color, quantity) => {
        const updatedItems = get().items.map((item) => {
          if (item.product_id === productId && item.size === size && item.color === color) {
            return {
              ...item,
              quantity,
              subtotal: quantity * item.unit_price,
            };
          }
          return item;
        });
        set({ items: updatedItems });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getSubtotal: () => get().items.reduce((acc, item) => acc + item.subtotal, 0),
    }),
    {
      name: 'nuhafrik-cart',
    }
  )
);
