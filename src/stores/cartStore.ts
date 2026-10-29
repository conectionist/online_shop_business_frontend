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

/** Automatic changes (not made by the shopper) pass `{ silent: true }`. */
export interface CartChangeOptions {
  silent?: boolean;
}

interface CartStore {
  items: CartItem[];
  /**
   * Bumped when the shopper changes the cart (add, remove, quantity, "Golește coșul"),
   * not on automatic changes (purging an expired list, clearing after an order,
   * dropping out-of-stock items). CartAnnouncer uses it to decide when to speak.
   * Not persisted.
   */
  userChangeId: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: number) => void;
  removeItems: (itemIds: number[], options?: CartChangeOptions) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  purgeItemsNotInList: (listId: number) => void;
  clearCart: (options?: CartChangeOptions) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const selectTotalItems = (state: { items: CartItem[] }): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

const sameItems = (a: CartItem[], b: CartItem[]): boolean =>
  a.length === b.length && a.every((item, i) => item.id === b[i].id && item.quantity === b[i].quantity);

/**
 * Applies a new item list. Returns the state unchanged when nothing changed,
 * so no-op actions neither re-render subscribers nor trigger an announcement.
 */
const applyItems = (state: CartStore, items: CartItem[], options?: CartChangeOptions): CartStore | Partial<CartStore> => {
  if (sameItems(state.items, items)) {
    return state;
  }
  return options?.silent
    ? { items }
    : { items, userChangeId: state.userChangeId + 1 };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userChangeId: 0,

      addItem: (item, quantity = 1) => {
        const amount = Math.max(1, quantity);
        set((state) => {
          const exists = state.items.some(i => i.id === item.id);
          // Add to the existing line, or create a new one, in a single update
          const items = exists
            ? state.items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + amount } : i))
            : [...state.items, { ...item, quantity: amount }];
          return applyItems(state, items);
        });
      },

      removeItem: (itemId) => {
        set((state) => applyItems(state, state.items.filter(item => item.id !== itemId)));
      },

      removeItems: (itemIds, options) => {
        set((state) => applyItems(state, state.items.filter(item => !itemIds.includes(item.id)), options));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => applyItems(
          state,
          state.items
            .map(item => (item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item))
            .filter(item => item.quantity > 0) // Remove items with 0 quantity
        ));
      },

      purgeItemsNotInList: (listId) => {
        set((state) => applyItems(state, state.items.filter(item => item.listId === listId), { silent: true }));
      },

      clearCart: (options) => {
        set((state) => applyItems(state, [], options));
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
