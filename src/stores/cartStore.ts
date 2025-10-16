import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  nume: string;
  pret: number;
  unitati_id: number;
  unitate_denumire: string;
  quantity: number;
  images?: any[];
  listId: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  purgeItemsNotInList: (listId: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          
          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map(i => 
                i.id === item.id 
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              )
            };
          } else {
            // Add new item with quantity 1
            return {
              items: [...state.items, { ...item, quantity: 1 }]
            };
          }
        });
      },
      
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          items: state.items.map(item => 
            item.id === itemId 
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0) // Remove items with 0 quantity
        }));
      },
      
      purgeItemsNotInList: (listId) => {
        set((state) => ({
          items: state.items.filter(item => item.listId === listId)
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.pret * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage', // unique name for localStorage key
    }
  )
); 