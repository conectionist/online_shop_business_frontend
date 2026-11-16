import { selectTotalItems, useCartStore } from '@/stores/cartStore'
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
  useCartStore.setState({ items: [], userChangeId: 0 })
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

describe('addItem with quantity', () => {
  test('adds a new item with the given quantity in one update', () => {
    const seen: number[] = []
    const unsubscribe = useCartStore.subscribe((s) => seen.push(selectTotalItems(s)))
    useCartStore.getState().addItem(makeItem(), 3)
    unsubscribe()
    expect(useCartStore.getState().items[0].quantity).toBe(3)
    expect(seen).toEqual([3])
  })

  test('adds the given quantity to an existing item', () => {
    useCartStore.getState().addItem(makeItem(), 2)
    useCartStore.getState().addItem(makeItem(), 3)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  test('treats quantities below 1 as 1', () => {
    useCartStore.getState().addItem(makeItem(), 0)
    expect(useCartStore.getState().items[0].quantity).toBe(1)
  })
})

describe('userChangeId', () => {
  test('is bumped by shopper actions', () => {
    const { addItem, updateQuantity, removeItem, clearCart } = useCartStore.getState()
    addItem(makeItem())
    addItem(makeItem({ id: 2 }))
    updateQuantity(1, 4)
    removeItem(1)
    clearCart()
    expect(useCartStore.getState().userChangeId).toBe(5)
  })

  test('is not bumped by automatic changes', () => {
    useCartStore.setState({ items: [{ ...makeItem({ listId: 1 }), quantity: 2 }] })
    useCartStore.getState().purgeItemsNotInList(2)
    useCartStore.getState().clearCart({ silent: true })
    expect(useCartStore.getState().userChangeId).toBe(0)
  })
})

describe('persistence', () => {
  test('stores only the items', () => {
    useCartStore.getState().addItem(makeItem())
    const saved = JSON.parse(localStorage.getItem('cart-storage') ?? '{}')
    expect(Object.keys(saved.state)).toEqual(['items'])
  })
})

describe('removeItems', () => {
  test('removes several items in one update', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    useCartStore.getState().addItem(makeItem({ id: 2 }))
    useCartStore.getState().addItem(makeItem({ id: 3 }))
    let updates = 0
    const unsubscribe = useCartStore.subscribe(() => updates++)
    useCartStore.getState().removeItems([1, 3])
    unsubscribe()
    expect(useCartStore.getState().items.map(i => i.id)).toEqual([2])
    expect(updates).toBe(1)
  })

  test('silent removal does not count as a shopper change', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }))
    const before = useCartStore.getState().userChangeId
    useCartStore.getState().removeItems([1], { silent: true })
    expect(useCartStore.getState().items).toHaveLength(0)
    expect(useCartStore.getState().userChangeId).toBe(before)
  })
})

describe('no-op changes', () => {
  test('leave the state untouched', () => {
    useCartStore.getState().addItem(makeItem({ id: 1 }), 2)
    const before = useCartStore.getState()
    let updates = 0
    const unsubscribe = useCartStore.subscribe(() => updates++)
    useCartStore.getState().updateQuantity(1, 2)
    useCartStore.getState().removeItem(42)
    useCartStore.getState().removeItems([42])
    unsubscribe()
    expect(updates).toBe(0)
    expect(useCartStore.getState().userChangeId).toBe(before.userChangeId)
  })
})
