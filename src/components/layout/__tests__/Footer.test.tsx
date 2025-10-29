import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Footer from '../Footer'

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Footer', () => {
  test('renders admin link pointing to /admin', async () => {
    renderWithProviders(<Footer />)
    const admin = await screen.findByText('Admin')
    expect(admin.closest('a')).toHaveAttribute('href', '/admin')
  })
})


