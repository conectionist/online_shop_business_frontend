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
  /**
   * Bumped on changes the shopper makes (add, remove, quantity, "Golește coșul"),
   * not on automatic ones (purging an expired list, clearing after an order).
   * CartAnnouncer uses it to decide when to speak. Not persisted.
   */
  userChangeId: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  purgeItemsNotInList: (listId: number) => void;
  clearCart: (options?: { silent?: boolean }) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const selectTotalItems = (state: { items: CartItem[] }): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userChangeId: 0,
      
      addItem: (item, quantity = 1) => {
        const amount = Math.max(1, quantity);
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          
          if (existingItem) {
            // Add to the existing quantity
            return {
              userChangeId: state.userChangeId + 1,
              items: state.items.map(i => 
                i.id === item.id 
                  ? { ...i, quantity: i.quantity + amount }
                  : i
              )
            };
          } else {
            // Add new item with the requested quantity in a single update
            return {
              userChangeId: state.userChangeId + 1,
              items: [...state.items, { ...item, quantity: amount }]
            };
          }
        });
      },
      
      removeItem: (itemId) => {
        set((state) => ({
          userChangeId: state.userChangeId + 1,
          items: state.items.filter(item => item.id !== itemId)
        }));
      },
      
      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          userChangeId: state.userChangeId + 1,
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
      
      clearCart: (options) => {
        set((state) => ({
          items: [],
          userChangeId: options?.silent ? state.userChangeId : state.userChangeId + 1,
        }));
      },
      
      getTotalItems: () => selectTotalItems(get()),
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.pret * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage', // unique name for localStorage key
      partialize: (state) => ({ items: state.items }),
    }
  )
); 