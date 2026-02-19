import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/stores/cartStore'

const makeItem = (overrides: Partial<CartItem> = {}): Omit<CartItem, 'quantity'> => ({
  id: 1,
  nume: 'Pâine',
  pret: 5,
  unitati_id: 1,
  unitate_denumire: 'buc',
  listId: 1,
  ...overrides,
})

beforeEach(() => {
  useCartStore.setState({ items: [] })
})

describe('addItem', () => {
  test('adds new item with quantity 1', () => {
    useCartStore.getState().addItem(makeItem())
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(1)
    expect(items[0].nume).toBe('Pâine')
  })

  test('increments quantity for existing item', () => {
    useCartStore.getState().addItem(makeItem())
    useCartStore.getState().addItem(makeItem())
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  test('does not duplicate items with same id', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2, nume: 'Covrigi' }))
    const items = useCartStore.getState().items
    expect(items).toHaveLength(2)
  })
})

describe('removeItem', () => {
  test('removes item by id', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2, nume: 'Covrigi' }))
    useCartStore.getState().removeItem(1)
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(2)
  })

  test('leaves other items untouched', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2, nume: 'Covrigi', pret: 3 }))
    useCartStore.getState().removeItem(1)
    expect(useCartStore.getState().items[0].pret).toBe(3)
  })

  test('no-op for non-existent id', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().removeItem(999)
    expect(useCartStore.getState().items).toHaveLength(1)
  })
})

describe('updateQuantity', () => {
  test('updates quantity for item', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().updateQuantity(1, 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  test('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('clamps to 0 (no negative quantities) and removes', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().updateQuantity(1, -5)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('purgeItemsNotInList', () => {
  test('keeps items matching listId', () => {
    useCartStore.getState().addItem(makeItem({ id: 1, listId: 10 }))
    useCartStore.getState().addItem(makeItem({ id: 2, listId: 10, nume: 'Covrigi' }))
    useCartStore.getState().purgeItemsNotInList(10)
    expect(useCartStore.getState().items).toHaveLength(2)
  })

  test('removes items from other lists', () => {
    useCartStore.getState().addItem(makeItem({ id: 1, listId: 10 }))
    useCartStore.getState().addItem(makeItem({ id: 2, listId: 20, nume: 'Covrigi' }))
    useCartStore.getState().purgeItemsNotInList(10)
    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].listId).toBe(10)
  })
})

describe('clearCart', () => {
  test('removes all items', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2, nume: 'Covrigi' }))
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('getTotalItems', () => {
  test('sums all quantities', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2, nume: 'Covrigi' }))
    useCartStore.getState().updateQuantity(1, 3)
    expect(useCartStore.getState().getTotalItems()).toBe(4) // 3 + 1
  })

  test('returns 0 for empty cart', () => {
    expect(useCartStore.getState().getTotalItems()).toBe(0)
  })
})

describe('getTotalPrice', () => {
  test('sums pret * quantity for all items', () => {
    useCartStore.getState().addItem(makeItem({ id: 1, pret: 5 }))
    useCartStore.getState().addItem(makeItem({ id: 2, pret: 3, nume: 'Covrigi' }))
    useCartStore.getState().updateQuantity(1, 2)
    // Item 1: 5 * 2 = 10, Item 2: 3 * 1 = 3 → total = 13
    expect(useCartStore.getState().getTotalPrice()).toBe(13)
  })

  test('returns 0 for empty cart', () => {
    expect(useCartStore.getState().getTotalPrice()).toBe(0)
  })

  test('handles decimal prices correctly', () => {
    useCartStore.getState().addItem(makeItem({ id: 1, pret: 2.5 }))
    useCartStore.getState().updateQuantity(1, 3)
    expect(useCartStore.getState().getTotalPrice()).toBeCloseTo(7.5)
  })
})
