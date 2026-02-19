import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import OrderConfirmation from '../OrderConfirmation'

const API = 'http://localhost:8001/api/v1'

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-pathname">{location.pathname}</div>
}

const renderOrderConfirmation = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/order-confirmation']}>
        <Routes>
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/" element={<><div>Home</div><LocationDisplay /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const testOrderData = {
  prenume: 'Ion',
  nume: 'Popescu',
  payment_method_id: 1,
  delivery_type_id: 2,
  phone_number: '0741234567',
  items: [
    { id: 1, nume: 'Pâine albă', pret: 5.5, quantity: 2, unitati_id: 1 },
  ],
  subtotal: 11,
  delivery_tax: 0,
  total: 11,
  deliveryType: { id: 2, denumire: 'Ridicare de la brutărie' },
  paymentMethod: { id: 1, name: 'Numerar la livrare' },
}

beforeEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('OrderConfirmation', () => {
  test('redirects to / when no order data in sessionStorage', async () => {
    renderOrderConfirmation()

    await waitFor(() => {
      expect(screen.getByTestId('location-pathname')).toHaveTextContent('/')
    })
  })

  test('displays order confirmation message', async () => {
    sessionStorage.setItem('orderData', JSON.stringify(testOrderData))
    renderOrderConfirmation()

    await screen.findByText('Comanda a fost finalizată!')
    expect(screen.getByText(/Vei primi produsele comandate pe data de/)).toBeInTheDocument()
  })

  test('toggles help section visibility', async () => {
    sessionStorage.setItem('orderData', JSON.stringify(testOrderData))
    const user = userEvent.setup()
    renderOrderConfirmation()

    await screen.findByText('Comanda a fost finalizată!')

    // Help section should be hidden initially
    expect(screen.queryByText('Ce ai de făcut:')).not.toBeInTheDocument()

    // Click "dă click aici" to show help
    await user.click(screen.getByText('dă click aici'))

    expect(screen.getByText('Ce ai de făcut:')).toBeInTheDocument()
    expect(screen.getByText('Copiază comanda')).toBeInTheDocument()
  })

  test('copies order text to clipboard on button click', async () => {
    sessionStorage.setItem('orderData', JSON.stringify(testOrderData))

    // Mock order resubmit (copy triggers a server submit)
    server.use(
      http.post(`${API}/orders`, () => {
        return HttpResponse.json({ id: 1 })
      })
    )

    const user = userEvent.setup()
    renderOrderConfirmation()

    await screen.findByText('Comanda a fost finalizată!')

    // Open help section first
    await user.click(screen.getByText('dă click aici'))
    await screen.findByText('Copiază comanda')

    // Click copy button — uses clipboard API or fallback document.execCommand
    await user.click(screen.getByText('Copiază comanda'))

    // Button text changes to "Copiat" on successful copy
    await screen.findByText('Copiat')
  })

  test('shows formatted order text in help section', async () => {
    sessionStorage.setItem('orderData', JSON.stringify(testOrderData))

    const user = userEvent.setup()
    renderOrderConfirmation()

    await screen.findByText('Comanda a fost finalizată!')
    await user.click(screen.getByText('dă click aici'))

    // The order text should contain customer name and product details
    expect(screen.getByText('Textul comenzii:')).toBeInTheDocument()
    // The pre element should contain the formatted order text
    const preElement = screen.getByText(/Ion Popescu/)
    expect(preElement).toBeInTheDocument()
  })
})
