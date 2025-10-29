import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement } from 'react'
import { useCartStore } from '@/stores/cartStore'

// Create a custom render function that wraps components with necessary providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Helper to reset cart store before tests
export const resetCartStore = () => {
  useCartStore.setState({ items: [] })
}

// Mock localStorage for cart persistence testing
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}

  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key])
    },
    get length() {
      return Object.keys(storage).length
    },
    key: (index: number) => {
      const keys = Object.keys(storage)
      return keys[index] || null
    },
  }
}

// Re-export common testing utilities for convenience
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

