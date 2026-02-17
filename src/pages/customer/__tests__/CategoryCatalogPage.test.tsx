import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { createTestProducts } from '@/test/mocks/handlers'
import CategoryCatalogPage from '../CategoryCatalogPage'
import { resetCartStore } from '@/test/testUtils'

const API = 'http://localhost:8001/api/v1'

const renderCategoryCatalogPage = (categoryId = '1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/catalog/category/${categoryId}`]}>
        <Routes>
          <Route path="/catalog/category/:categoryId" element={<CategoryCatalogPage />} />
          <Route path="/catalog" element={<div>Catalog Page</div>} />
          <Route path="/product/:productId" element={<div>Product Page</div>} />
          <Route path="/cart" element={<div>Cart Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  resetCartStore()
  // Add missing MSW handlers for this page
  server.use(
    http.get(`${API}/categories/:id`, ({ params }) => {
      const categories = [
        { id: 1, name: 'Pâine' },
        { id: 2, name: 'Produse de patiserie' },
        { id: 3, name: 'Cozonaci' },
      ]
      const category = categories.find(c => c.id === Number(params.id))
      if (category) return HttpResponse.json(category)
      return new HttpResponse(null, { status: 404 })
    }),
    http.get(`${API}/products`, ({ request }) => {
      const url = new URL(request.url)
      const categoryId = url.searchParams.get('category_id')
      const products = createTestProducts()
      if (categoryId) {
        const filtered = products.filter(p => p.category_id === Number(categoryId))
        return HttpResponse.json(filtered)
      }
      return HttpResponse.json(products)
    })
  )
})

describe('CategoryCatalogPage', () => {
  test('renders products for the specified category', async () => {
    renderCategoryCatalogPage('1') // Category 1 = Pâine

    // Products in category 1: Pâine albă, Pâine neagră, Franzela cu susan
    await screen.findByText('Pâine albă')
    expect(screen.getByText('Pâine neagră')).toBeInTheDocument()
    expect(screen.getByText('Franzela cu susan')).toBeInTheDocument()

    // Products from other categories should NOT appear
    expect(screen.queryByText('Croissant cu ciocolată')).not.toBeInTheDocument()
  })

  test('displays category name', async () => {
    renderCategoryCatalogPage('1')

    await screen.findByText('Pâine')
  })

  test('shows back to catalog link', async () => {
    renderCategoryCatalogPage('1')

    await screen.findByText('Pâine albă')
    expect(screen.getAllByText(/Înapoi la catalog/i).length).toBeGreaterThanOrEqual(1)
  })

  test('shows error for invalid category ID', async () => {
    renderCategoryCatalogPage('abc')

    // Invalid (NaN) category should redirect to catalog
    await screen.findByText('Catalog Page')
  })
})
