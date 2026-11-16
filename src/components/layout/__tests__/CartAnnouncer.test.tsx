import { act, render, screen } from '@testing-library/react'
import CartAnnouncer, { ANNOUNCE_DELAY_MS, ANNOUNCEMENT_CLEAR_MS } from '../CartAnnouncer'
import { useCartStore } from '@/stores/cartStore'

const item = {
  id: 1,
  nume: 'Pâine',
  pret: 5,
  unitati_id: 1,
  unitate_denumire: 'buc',
  listId: 1,
}

const region = () => screen.getByRole('status')
const flush = () => act(() => vi.advanceTimersByTime(ANNOUNCE_DELAY_MS))

beforeEach(() => {
  vi.useFakeTimers()
  useCartStore.setState({ items: [], userChangeId: 0 })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CartAnnouncer', () => {
  test('renders an empty polite live region initially', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 2 }] })
    render(<CartAnnouncer />)
    expect(region()).toHaveAttribute('aria-live', 'polite')
    expect(region()).toHaveTextContent('')
  })

  test('announces the new count when an item is added', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 1 produs')
    act(() => useCartStore.getState().addItem(item))
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 2 produse')
  })

  test('announces the final count when adding several at once', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item, 3))
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 3 produse')
  })

  test('announces when the shopper empties the cart', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().clearCart())
    flush()
    expect(region()).toHaveTextContent('Coșul este gol')
  })

  test('stays silent for automatic changes', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 1 }, { ...item, id: 2, quantity: 1 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().removeItems([2], { silent: true }))
    act(() => useCartStore.getState().purgeItemsNotInList(99))
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    act(() => useCartStore.getState().clearCart({ silent: true }))
    flush()
    expect(region()).toHaveTextContent('')
  })

  test('clears the message after a few seconds', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 1 produs')
    act(() => vi.advanceTimersByTime(ANNOUNCEMENT_CLEAR_MS))
    expect(region()).toHaveTextContent('')
  })

  test('a silent change clears a message that no longer matches the cart', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    flush()
    act(() => useCartStore.getState().purgeItemsNotInList(99))
    expect(region()).toHaveTextContent('')
  })

  test('re-announces when the new message repeats the previous text', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item, 3))
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 3 produse')
    // Shopper goes 3 -> 2 -> 3 within the clear window
    act(() => useCartStore.getState().updateQuantity(1, 2))
    act(() => useCartStore.getState().updateQuantity(1, 3))
    // The region is emptied first, then refilled, so screen readers hear it again
    expect(region()).toHaveTextContent('')
    flush()
    expect(region()).toHaveTextContent('Coș actualizat: 3 produse')
  })

  test('a no-op change is not announced', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 2 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().updateQuantity(1, 2))
    act(() => useCartStore.getState().removeItem(42))
    flush()
    expect(region()).toHaveTextContent('')
  })
})
