import { act, render, screen } from '@testing-library/react'
import CartAnnouncer, { ANNOUNCEMENT_CLEAR_MS } from '../CartAnnouncer'
import { useCartStore } from '@/stores/cartStore'

const item = {
  id: 1,
  nume: 'Pâine',
  pret: 5,
  unitati_id: 1,
  unitate_denumire: 'buc',
  listId: 1,
}

beforeEach(() => {
  useCartStore.setState({ items: [], userChangeId: 0 })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CartAnnouncer', () => {
  test('renders an empty polite live region initially', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 2 }] })
    render(<CartAnnouncer />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('')
  })

  test('announces the new count when an item is added', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    expect(screen.getByRole('status')).toHaveTextContent('Coș actualizat: 1 produs')
    act(() => useCartStore.getState().addItem(item))
    expect(screen.getByRole('status')).toHaveTextContent('Coș actualizat: 2 produse')
  })

  test('announces the final count when adding several at once', () => {
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item, 3))
    expect(screen.getByRole('status')).toHaveTextContent('Coș actualizat: 3 produse')
  })

  test('announces when the shopper empties the cart', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().clearCart())
    expect(screen.getByRole('status')).toHaveTextContent('Coșul este gol')
  })

  test('stays silent for automatic changes', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().purgeItemsNotInList(99))
    expect(screen.getByRole('status')).toHaveTextContent('')
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    act(() => useCartStore.getState().clearCart({ silent: true }))
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  test('clears the message after a few seconds', () => {
    vi.useFakeTimers()
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    expect(screen.getByRole('status')).toHaveTextContent('Coș actualizat: 1 produs')
    act(() => vi.advanceTimersByTime(ANNOUNCEMENT_CLEAR_MS))
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  test('an automatic change does not keep an old message around', () => {
    vi.useFakeTimers()
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().addItem(item))
    act(() => useCartStore.getState().purgeItemsNotInList(99))
    act(() => vi.advanceTimersByTime(ANNOUNCEMENT_CLEAR_MS))
    expect(screen.getByRole('status')).toHaveTextContent('')
  })
})
