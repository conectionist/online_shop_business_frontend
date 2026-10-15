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
})
