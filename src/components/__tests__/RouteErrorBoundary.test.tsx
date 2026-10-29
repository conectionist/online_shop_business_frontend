import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import RouteErrorBoundary from '../RouteErrorBoundary'

const Broken = (): never => {
  throw new Error('Failed to fetch dynamically imported module')
}

describe('RouteErrorBoundary', () => {
  test('renders its children while they work', () => {
    render(
      <RouteErrorBoundary>
        <p>Statistici</p>
      </RouteErrorBoundary>
    )

    expect(screen.getByText('Statistici')).toBeInTheDocument()
  })

  test('replaces a failing route with a reload prompt instead of unmounting the app', () => {
    // React and the boundary both log the caught error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <RouteErrorBoundary>
        <Broken />
      </RouteErrorBoundary>
    )

    expect(screen.getByText('Pagina nu a putut fi încărcată')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reîncarcă pagina/ })).toBeInTheDocument()

    consoleError.mockRestore()
  })

  test('shows a neutral message for errors that are not chunk loads', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Buggy = (): never => {
      throw new Error('Cannot read properties of undefined')
    }

    render(
      <RouteErrorBoundary>
        <Buggy />
      </RouteErrorBoundary>
    )

    expect(screen.getByText('A apărut o eroare')).toBeInTheDocument()
    expect(screen.queryByText('Pagina nu a putut fi încărcată')).not.toBeInTheDocument()

    consoleError.mockRestore()
  })

  test('clears the error when the reset key changes', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = render(
      <RouteErrorBoundary resetKey="/cart">
        <Broken />
      </RouteErrorBoundary>
    )
    expect(screen.getByText('Pagina nu a putut fi încărcată')).toBeInTheDocument()

    rerender(
      <RouteErrorBoundary resetKey="/catalog">
        <p>Catalog</p>
      </RouteErrorBoundary>
    )
    expect(screen.getByText('Catalog')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
