import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import OrderForm from '../OrderForm'
import { useCartStore } from '@/stores/cartStore'
import { resetCartStore } from '@/test/testUtils'

const API = 'http://localhost:8001/api/v1'

const LocationDisplay = () => {
  const location = useLocation()
  return <div data-testid="location-pathname">{location.pathname}</div>
}

const renderOrderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/order-form']}>
        <Routes>
          <Route path="/order-form" element={<OrderForm />} />
          <Route path="/order-confirmation" element={<><div>Order Confirmation</div><LocationDisplay /></>} />
          <Route path="/cart" element={<div>Cart Page</div>} />
          <Route path="/" element={<><div>Home</div><LocationDisplay /></>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const addTestCartItem = () => {
  useCartStore.getState().addItem({
    id: 1,
    nume: 'Pâine albă',
    pret: 5.5,
    unitati_id: 1,
    unitate_denumire: 'buc',
    images: [],
    listId: 101,
  })
  useCartStore.getState().updateQuantity(1, 2)
}

beforeEach(() => {
  resetCartStore()
  vi.restoreAllMocks()
  // Payment methods service uses /modalitati-plata, not /metode-plata
  server.use(
    http.get(`${API}/modalitati-plata`, () => {
      return HttpResponse.json([
        { id: 1, name: 'Numerar la livrare', description: 'Numerar la livrare' },
        { id: 2, name: 'Card la livrare', description: 'Card la livrare' },
        { id: 3, name: 'Transfer bancar', description: 'Transfer bancar' },
      ])
    })
  )
})

describe('OrderForm', () => {
  test('shows empty cart message when cart is empty', async () => {
    renderOrderForm()
    await waitFor(() => {
      expect(screen.getByText(/Coșul tău este gol/)).toBeInTheDocument()
    })
  })

  test('shows loading state while fetching options', () => {
    addTestCartItem()
    // Delay list response to keep loading visible
    server.use(
      http.get(`${API}/liste/published`, async () => {
        await new Promise(r => setTimeout(r, 200))
        return HttpResponse.json({ id: 101, data: '2025-01-01', is_current: true, is_published: true, is_deleted: false })
      })
    )
    renderOrderForm()
    expect(screen.getByText('Se încarcă...')).toBeInTheDocument()
  })

  test('renders form fields after data loads', async () => {
    addTestCartItem()
    renderOrderForm()

    await screen.findByText('Finalizează Comanda')
    expect(screen.getByText('Prenume *')).toBeInTheDocument()
    expect(screen.getByText('Nume *')).toBeInTheDocument()
    expect(screen.getByText('Metoda de Plată')).toBeInTheDocument()
    expect(screen.getByText('Metoda de Livrare')).toBeInTheDocument()
  })

  test('shows address field when delivery type requires address', async () => {
    addTestCartItem()
    // Ensure delivery types have order_index for stable sort
    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 1, denumire: 'Livrare la domiciliu', description: 'Livrăm acasă', order_index: 1 },
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 2 },
        ])
      })
    )

    const user = userEvent.setup()
    renderOrderForm()

    // Wait for delivery types to load
    await screen.findByText('Livrare la domiciliu')

    // Select "Livrare la domiciliu" (requires address)
    await user.click(screen.getByLabelText(/Livrare la domiciliu/))

    await waitFor(() => {
      expect(screen.getByText('Adresa de livrare')).toBeInTheDocument()
    })
  })

  test('hides address field for pickup delivery type', async () => {
    addTestCartItem()
    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 1, denumire: 'Livrare la domiciliu', description: 'Livrăm acasă', order_index: 1 },
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 2 },
        ])
      })
    )

    const user = userEvent.setup()
    renderOrderForm()

    await screen.findByText('Ridicare de la brutărie')

    // Select "Ridicare de la brutărie" (no address needed)
    await user.click(screen.getByLabelText(/Ridicare de la brutărie/))

    await waitFor(() => {
      expect(screen.queryByText('Adresa de livrare')).not.toBeInTheDocument()
    })
  })

  test('submits order via POST /orders', async () => {
    addTestCartItem()

    let capturedBody: any = null
    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 1, denumire: 'Livrare la domiciliu', description: 'Livrăm acasă', order_index: 1 },
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 2 },
        ])
      }),
      http.post(`${API}/orders`, async ({ request }) => {
        const url = new URL(request.url)
        capturedBody = await request.json()
        capturedBody._source = url.searchParams.get('source')
        return HttpResponse.json({ id: 1, ...capturedBody })
      })
    )

    // Mock window.open to prevent WhatsApp navigation
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)

    const user = userEvent.setup()
    renderOrderForm()

    // Wait for form to load
    await screen.findByText('Finalizează Comanda')

    // Fill required fields
    await user.type(screen.getByPlaceholderText('Prenumele tău'), 'Ion')
    await user.type(screen.getByPlaceholderText('Numele tău'), 'Popescu')

    // Wait for payment methods to load, then select
    await screen.findByText('Numerar la livrare')
    await user.click(screen.getByLabelText(/Numerar la livrare/))

    // Wait for delivery types to load, then select
    await screen.findByText('Ridicare de la brutărie')
    await user.click(screen.getByLabelText(/Ridicare de la brutărie/))

    // Submit form
    await user.click(screen.getByText('Trimite comanda pe Whatsapp'))

    await waitFor(() => {
      expect(capturedBody).not.toBeNull()
      expect(capturedBody.nume_client).toBe('Ion Popescu')
      expect(capturedBody.items).toHaveLength(1)
      expect(capturedBody._source).toBe('whatsapp_button')
    })

    openSpy.mockRestore()
  })

  test('shows out-of-stock modal on 409 INSUFFICIENT_STOCK error', async () => {
    addTestCartItem()
    // Add a second item so the cart isn't empty after removing out-of-stock product
    useCartStore.getState().addItem({
      id: 2,
      nume: 'Pâine neagră',
      pret: 6,
      unitati_id: 1,
      unitate_denumire: 'buc',
      images: [],
      listId: 101,
    })

    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 1 },
        ])
      }),
      http.post(`${API}/orders`, () => {
        return HttpResponse.json(
          { detail: { error_code: 'INSUFFICIENT_STOCK', product_id: 1, message: 'Out of stock' } },
          { status: 409 }
        )
      })
    )

    const user = userEvent.setup()
    renderOrderForm()

    await screen.findByText('Finalizează Comanda')

    await user.type(screen.getByPlaceholderText('Prenumele tău'), 'Ion')
    await user.type(screen.getByPlaceholderText('Numele tău'), 'Popescu')
    await screen.findByText('Numerar la livrare')
    await user.click(screen.getByLabelText(/Numerar la livrare/))
    await screen.findByText('Ridicare de la brutărie')
    await user.click(screen.getByLabelText(/Ridicare de la brutărie/))
    await user.click(screen.getByText('Trimite comanda pe Whatsapp'))

    await screen.findByText('Produse indisponibile')
    expect(screen.getByText(/Următoarele produse nu mai sunt disponibile/)).toBeInTheDocument()
  })

  test('shows server error modal on 500 error', async () => {
    addTestCartItem()

    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 1 },
        ])
      }),
      http.post(`${API}/orders`, () => {
        return HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
      })
    )

    const user = userEvent.setup()
    renderOrderForm()

    await screen.findByText('Finalizează Comanda')

    await user.type(screen.getByPlaceholderText('Prenumele tău'), 'Ion')
    await user.type(screen.getByPlaceholderText('Numele tău'), 'Popescu')
    await screen.findByText('Numerar la livrare')
    await user.click(screen.getByLabelText(/Numerar la livrare/))
    await screen.findByText('Ridicare de la brutărie')
    await user.click(screen.getByLabelText(/Ridicare de la brutărie/))
    await user.click(screen.getByText('Trimite comanda pe Whatsapp'))

    await screen.findByText('Eroare la procesarea comenzii')
    expect(screen.getByText(/Serverul întâmpină probleme tehnice/)).toBeInTheDocument()
  })

  test('shows the list-closed modal on 400 LIST_NOT_OPEN', async () => {
    addTestCartItem()

    server.use(
      http.get(`${API}/liste/:listId/delivery-types`, () => {
        return HttpResponse.json([
          { id: 2, denumire: 'Ridicare de la brutărie', description: 'Ridici de la noi', order_index: 1 },
        ])
      }),
      http.post(`${API}/orders`, () => {
        return HttpResponse.json(
          { detail: { error_code: 'LIST_NOT_OPEN', message: 'List 101 is not open for orders', list_id: 101 } },
          { status: 400 }
        )
      })
    )

    const user = userEvent.setup()
    renderOrderForm()

    await screen.findByText('Finalizează Comanda')

    await user.type(screen.getByPlaceholderText('Prenumele tău'), 'Ion')
    await user.type(screen.getByPlaceholderText('Numele tău'), 'Popescu')
    await screen.findByText('Numerar la livrare')
    await user.click(screen.getByLabelText(/Numerar la livrare/))
    await screen.findByText('Ridicare de la brutărie')
    await user.click(screen.getByLabelText(/Ridicare de la brutărie/))
    await user.click(screen.getByText('Trimite comanda pe Whatsapp'))

    await screen.findByText('Lista s-a închis')
    expect(screen.getByText(/Nu mai primim comenzi pentru .*Comanda ta nu a fost trimisă/)).toBeInTheDocument()
    expect(screen.queryByText('Eroare la procesarea comenzii')).not.toBeInTheDocument()
    // The order was not placed, so the cart keeps its items
    expect(useCartStore.getState().items).toHaveLength(1)

    await user.click(screen.getByText('Am înțeles'))
    expect(await screen.findByTestId('location-pathname')).toHaveTextContent('/')
  })
})
