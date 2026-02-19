import { render, renderHook as tlRenderHook, RenderOptions, RenderHookOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom'
import { ReactElement, ReactNode } from 'react'
import { useCartStore } from '@/stores/cartStore'

// Create a fresh QueryClient configured for tests: no retries, zero cache times.
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 5 * 60 * 1000,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// renderHook wrapper that provides QueryClientProvider.
// Returns the hook result and the queryClient for cache inspection.
export function renderHookWithQuery<TResult>(
  renderFn: () => TResult,
  options?: Omit<RenderHookOptions<unknown>, 'wrapper'> & { queryClient?: QueryClient }
) {
  const queryClient = options?.queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  const hookResult = tlRenderHook(renderFn, { wrapper: Wrapper, ...options })

  return {
    ...hookResult,
    queryClient,
  }
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
}

// Create a custom render function that wraps components with necessary providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: ExtendedRenderOptions
) => {
  const { route, ...renderOptions } = options || {}

  const queryClient = createTestQueryClient()

  if (route) {
    // Use memory router with routes for testing specific routes
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: ui,
        },
        {
          path: '/product/:productId',
          element: ui,
        },
        {
          path: '/cart',
          element: ui,
        },
        {
          path: '*',
          element: ui,
        },
      ],
      {
        initialEntries: [route],
      }
    )

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    return {
      ...render(<RouterProvider router={router} />, { wrapper: Wrapper, ...renderOptions }),
      router,
    }
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
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

