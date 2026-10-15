import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { createTestProducts } from '@/test/mocks/handlers'
import CatalogPage from '../CatalogPage'
import { useCartStore } from '@/stores/cartStore'
import { resetCartStore } from '@/test/testUtils'

const API = 'http://localhost:8001/api/v1'

const renderCatalogPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/catalog']}>
        <Routes>
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/category/:categoryId" element={<div>Category Page</div>} />
          <Route path="/product/:productId" element={<div>Product Page</div>} />
          <Route path="/cart" element={<div>Cart Page</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  resetCartStore()
  // Add GET /products handler (not in global handlers)
  server.use(
    http.get(`${API}/products`, () => {
      return HttpResponse.json(createTestProducts())
    })
  )
})

describe('CatalogPage', () => {
  test('renders categories view by default', async () => {
    renderCatalogPage()

    // Category names from test data
    await screen.findByText('Pâine')
    expect(screen.getByText('Produse de patiserie')).toBeInTheDocument()
    expect(screen.getByText('Cozonaci')).toBeInTheDocument()
  })

  test('switches to products view', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    // Wait for categories to load
    await screen.findByText('Pâine')

    // Click "Toate produsele" button
    await user.click(screen.getByText('Toate produsele'))

    // Product names should appear
    await screen.findByText('Pâine albă')
    expect(screen.getByText('Pâine neagră')).toBeInTheDocument()
    expect(screen.getByText('Croissant cu ciocolată')).toBeInTheDocument()
  })

  test('displays product names and prices', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    await screen.findByText('Pâine')
    await user.click(screen.getByText('Toate produsele'))

    await screen.findByText('Pâine albă')
    // Check price format: "{price} RON / {cantitate} {unit}"
    expect(screen.getByText(/5.5 RON/)).toBeInTheDocument()
  })

  test('filters products by search term', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    await screen.findByText('Pâine')
    await user.click(screen.getByText('Toate produsele'))
    await screen.findByText('Pâine albă')

    // Type in search box
    await user.type(screen.getByPlaceholderText('Caută produse...'), 'Croissant')

    await waitFor(() => {
      expect(screen.getByText('Croissant cu ciocolată')).toBeInTheDocument()
      expect(screen.queryByText('Pâine albă')).not.toBeInTheDocument()
    })
  })

  test('adds product to cart', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    await screen.findByText('Pâine')
    await user.click(screen.getByText('Toate produsele'))
    await screen.findByText('Pâine albă')

    // Click "Adaugă în coș" for the first available product
    const addButtons = screen.getAllByText('Adaugă în coș')
    await user.click(addButtons[0])

    await waitFor(() => {
      expect(useCartStore.getState().items.length).toBeGreaterThan(0)
    })
  })

  test('shows out-of-stock badge for unavailable products', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    await screen.findByText('Pâine')
    await user.click(screen.getByText('Toate produsele'))

    // Cozonac cu nucă has stoc_produs: 0
    await screen.findByText('Cozonac cu nucă')

    // Out of stock product should show unavailable indicator
    expect(screen.getByText(/Nu mai avem momentan|Momentan indisponibil/)).toBeInTheDocument()
  })

  test('shows empty state when no products match search', async () => {
    const user = userEvent.setup()
    renderCatalogPage()

    await screen.findByText('Pâine')
    await user.click(screen.getByText('Toate produsele'))
    await screen.findByText('Pâine albă')

    // Search for something that doesn't exist
    await user.type(screen.getByPlaceholderText('Caută produse...'), 'xyznonexistent')

    await waitFor(() => {
      expect(screen.getAllByText(/Nu s-au găsit produse/).length).toBeGreaterThanOrEqual(1)
    })
  })
})
