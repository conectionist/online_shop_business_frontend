import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CartPage from '../CartPage'
import { useCartStore } from '@/stores/cartStore'
import { resetCartStore } from '@/test/testUtils'

const renderCartPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/" element={<div>Home</div>} />
          <Route path="/order-form" element={<div>Order Form</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const addTestItem = (overrides?: Record<string, any>) => {
  const { quantity, ...itemOverrides } = overrides || {}
  useCartStore.getState().addItem({
    id: 1,
    nume: 'Pâine albă',
    pret: 5.5,
    unitati_id: 1,
    unitate_denumire: 'buc',
    images: [],
    listId: 101,
    ...itemOverrides,
  })
}

beforeEach(() => {
  resetCartStore()
})

describe('CartPage', () => {
  test('shows empty cart state when no items', () => {
    renderCartPage()
    expect(screen.getByText('Coșul tău este gol')).toBeInTheDocument()
    expect(screen.getByText(/Nu ai adăugat încă produse/)).toBeInTheDocument()
  })

  test('displays cart items with names and prices', () => {
    addTestItem()
    addTestItem({ id: 2, nume: 'Pâine neagră', pret: 6 })

    renderCartPage()
    expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    expect(screen.getByText('Pâine neagră')).toBeInTheDocument()
    expect(screen.getByText(/Preț unitar: 5.5 RON/)).toBeInTheDocument()
    expect(screen.getByText(/Preț unitar: 6 RON/)).toBeInTheDocument()
  })

  test('increments item quantity via + button', async () => {
    const user = userEvent.setup()
    addTestItem()

    renderCartPage()

    // Find the + button (the one with Plus icon, variant="primary")
    const plusButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-plus')
    )
    expect(plusButtons).toHaveLength(1)

    await user.click(plusButtons[0])
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  test('decrements item quantity via − button', async () => {
    const user = userEvent.setup()
    addTestItem()
    // Set quantity to 3 first
    useCartStore.getState().updateQuantity(1, 3)

    renderCartPage()

    const minusButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-minus')
    )
    expect(minusButtons).toHaveLength(1)

    await user.click(minusButtons[0])
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  test('removes item via trash button', async () => {
    const user = userEvent.setup()
    addTestItem()

    renderCartPage()

    const trashButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-trash-2')
    )
    expect(trashButtons).toHaveLength(1)

    await user.click(trashButtons[0])
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  test('clears all items via "Golește coșul" button', async () => {
    const user = userEvent.setup()
    addTestItem()
    addTestItem({ id: 2, nume: 'Pâine neagră', pret: 6 })

    renderCartPage()

    await user.click(screen.getByText('Golește coșul'))
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
