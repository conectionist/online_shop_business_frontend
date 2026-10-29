import { act, render, screen } from '@testing-library/react'
import CartAnnouncer from '../CartAnnouncer'
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
  useCartStore.setState({ items: [] })
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

  test('announces when the cart becomes empty', () => {
    useCartStore.setState({ items: [{ ...item, quantity: 1 }] })
    render(<CartAnnouncer />)
    act(() => useCartStore.getState().clearCart())
    expect(screen.getByRole('status')).toHaveTextContent('Coșul este gol')
  })
})
