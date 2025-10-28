import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../../../App'

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

describe('Shopping Flow (smoke)', () => {
  test('app renders root route without crashing', async () => {
    renderApp()
    // Assert presence of a known link from the footer to avoid ambiguity
    expect(await screen.findByRole('link', { name: 'Admin' })).toBeInTheDocument()
  })
})


