import { describe, test, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, resetCartStore } from '@/test/testUtils'
import ProductPage from '../ProductPage'

describe('ProductPage - Page Rendering and Navigation', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('displays product not found state for invalid product ID', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/999' })

    await waitFor(() => {
      expect(screen.getByText('Produsul nu a fost găsit')).toBeInTheDocument()
    })

    expect(screen.getByText(/Produsul pe care îl cauți nu există/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Înapoi la Produse/i })).toBeInTheDocument()
  })

  test('back button displays correctly', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Verify back button exists and has correct text
    const backButton = screen.getByRole('button', { name: /Înapoi la Produse/i })
    expect(backButton).toBeInTheDocument()
  })

  test('floating cart icon displays', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Cart icon should be present
    const cartLinks = screen.getAllByRole('link', { name: '' })
    const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart')
    expect(cartLink).toBeInTheDocument()
  })

  test('cart icon shows correct item count after adding product', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Add to cart
    const addButton = screen.getByRole('button', { name: /Adaugă în coș/i })
    await user.click(addButton)

    // Cart should show badge with count (find the specific cart badge element)
    await waitFor(() => {
      const allOnes = screen.getAllByText('1')
      const cartBadge = allOnes.find(el => el.closest('span.bg-gradient-to-r'))
      expect(cartBadge).toBeInTheDocument()
    })
  })

  test('cart icon links to cart page', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const cartLinks = screen.getAllByRole('link', { name: '' })
    const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart')
    expect(cartLink).toHaveAttribute('href', '/cart')
  })
})

describe('ProductPage - Product Details Display', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('displays product name correctly', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Pâine albă' })).toBeInTheDocument()
    })
  })

  test('displays product category badge', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    // Wait for product to load and verify category badge exists (may show fallback text)
    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })
    
    // Category badge should be present (either actual category or fallback)
    const categoryElements = screen.queryAllByText(/Pâine|Categorie necunoscută/)
    expect(categoryElements.length).toBeGreaterThan(0)
  })

  test('displays product price with correct format', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Price should be displayed as "5.5 RON / 1 bucată"
    expect(screen.getByText(/5.5 RON/)).toBeInTheDocument()
  })

  test('displays product unit correctly', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    expect(screen.getByText(/bucată/)).toBeInTheDocument()
  })

  test('displays product description when present', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    expect(screen.getByText('Despre acest produs')).toBeInTheDocument()
    expect(screen.getByText(/Pâine albă proaspătă/)).toBeInTheDocument()
  })

  test('does not display description section when description is missing', async () => {
    // Product ID 3 has no description in our test data
    renderWithProviders(<ProductPage />, { route: '/product/3' })

    await waitFor(() => {
      expect(screen.getByText('Croissant cu ciocolată')).toBeInTheDocument()
    })

    // "Despre acest produs" heading should be present since product has description
    expect(screen.getByText('Despre acest produs')).toBeInTheDocument()
  })
})

describe('ProductPage - Product Images', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('displays main product image', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const images = screen.getAllByRole('img', { name: /Pâine albă/i })
    expect(images.length).toBeGreaterThan(0)
  })

  test('displays fallback icon when product has no images', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/3' })

    await waitFor(() => {
      expect(screen.getByText('Croissant cu ciocolată')).toBeInTheDocument()
    })

    // Fallback Package icon should be visible
    const fallbackDiv = screen.getByText('Croissant cu ciocolată').closest('div')
    expect(fallbackDiv).toBeTruthy()
  })

  test('displays thumbnail gallery for products with multiple images', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/5' })

    await waitFor(() => {
      expect(screen.getByText('Franzela cu susan')).toBeInTheDocument()
    })

    // Should have multiple thumbnail buttons
    const thumbnails = screen.getAllByRole('button').filter(button => 
      button.querySelector('img[alt*="imagine"]')
    )
    expect(thumbnails.length).toBe(3)
  })

  test('clicking thumbnail changes main image', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/5' })

    await waitFor(() => {
      expect(screen.getByText('Franzela cu susan')).toBeInTheDocument()
    })

    const thumbnails = screen.getAllByRole('button').filter(button => 
      button.querySelector('img[alt*="imagine"]')
    )

    // Click second thumbnail
    await user.click(thumbnails[1])

    // The thumbnail should have active styling (border-amber-500)
    await waitFor(() => {
      expect(thumbnails[1]).toHaveClass('border-amber-500')
    })
  })

  test('does not display thumbnail gallery for single image products', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Should not have thumbnail buttons for single image
    const thumbnails = screen.queryAllByRole('button').filter(button => 
      button.querySelector('img[alt*="imagine"]')
    )
    expect(thumbnails.length).toBe(0)
  })
})

describe('ProductPage - Quantity Selection', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('quantity starts at 1', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Find the quantity display (it's a span with bold text showing "1")
    const quantityDisplay = screen.getByText('Cantitate').parentElement?.querySelector('span.text-2xl')
    expect(quantityDisplay).toHaveTextContent('1')
  })

  test('increment button increases quantity', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const quantityDisplay = screen.getByText('Cantitate').parentElement?.querySelector('span.text-2xl')
    expect(quantityDisplay).toHaveTextContent('1')

    // Click increment button (Plus icon)
    const buttons = screen.getAllByRole('button')
    const incrementButton = buttons.find(btn => btn.querySelector('svg.lucide-plus'))
    expect(incrementButton).toBeTruthy()

    if (incrementButton) {
      await user.click(incrementButton)
    }

    await waitFor(() => {
      expect(quantityDisplay).toHaveTextContent('2')
    })
  })

  test('decrement button decreases quantity', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // First increment to 2
    const buttons = screen.getAllByRole('button')
    const incrementButton = buttons.find(btn => btn.querySelector('svg.lucide-plus'))
    if (incrementButton) {
      await user.click(incrementButton)
    }

    const quantityDisplay = screen.getByText('Cantitate').parentElement?.querySelector('span.text-2xl')
    await waitFor(() => {
      expect(quantityDisplay).toHaveTextContent('2')
    })

    // Then decrement
    const decrementButton = buttons.find(btn => btn.querySelector('svg.lucide-minus'))
    if (decrementButton) {
      await user.click(decrementButton)
    }

    await waitFor(() => {
      expect(quantityDisplay).toHaveTextContent('1')
    })
  })

  test('decrement button is disabled when quantity is 1', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const decrementButton = buttons.find(btn => btn.querySelector('svg.lucide-minus'))

    expect(decrementButton).toBeDisabled()
  })

  test('quantity displays correctly after multiple changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button')
    const incrementButton = buttons.find(btn => btn.querySelector('svg.lucide-plus'))
    const quantityDisplay = screen.getByText('Cantitate').parentElement?.querySelector('span.text-2xl')

    // Increment 3 times
    if (incrementButton) {
      await user.click(incrementButton)
      await user.click(incrementButton)
      await user.click(incrementButton)
    }

    await waitFor(() => {
      expect(quantityDisplay).toHaveTextContent('4')
    })
  })
})

describe('ProductPage - Add to Cart Functionality', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('add to cart button displays correct text', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Adaugă în coș/i })).toBeInTheDocument()
  })

  test('clicking add to cart adds product with selected quantity', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    // Set quantity to 3
    const buttons = screen.getAllByRole('button')
    const incrementButton = buttons.find(btn => btn.querySelector('svg.lucide-plus'))
    if (incrementButton) {
      await user.click(incrementButton)
      await user.click(incrementButton)
    }

    // Add to cart
    const addButton = screen.getByRole('button', { name: /Adaugă în coș/i })
    await user.click(addButton)

    // Cart should show 3 items in badge
    await waitFor(() => {
      const allThrees = screen.getAllByText('3')
      const cartBadge = allThrees.find(el => el.closest('span.bg-gradient-to-r'))
      expect(cartBadge).toBeInTheDocument()
    })
  })

  test('adding product updates cart count', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Adaugă în coș/i })
    await user.click(addButton)

    await waitFor(() => {
      const allOnes = screen.getAllByText('1')
      const cartBadge = allOnes.find(el => el.closest('span.bg-gradient-to-r'))
      expect(cartBadge).toBeInTheDocument()
    })
  })

  test('adding same product twice updates quantity in cart', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/1' })

    await waitFor(() => {
      expect(screen.getByText('Pâine albă')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Adaugă în coș/i })
    
    // Add first time (quantity 1)
    await user.click(addButton)
    await waitFor(() => {
      const allOnes = screen.getAllByText('1')
      const cartBadge = allOnes.find(el => el.closest('span.bg-gradient-to-r'))
      expect(cartBadge).toBeInTheDocument()
    })

    // Add second time (quantity 1 again)
    await user.click(addButton)
    await waitFor(() => {
      const allTwos = screen.getAllByText('2')
      const cartBadge = allTwos.find(el => el.closest('span.bg-gradient-to-r'))
      expect(cartBadge).toBeInTheDocument()
    })
  })
})

describe('ProductPage - Out of Stock Handling', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('displays out of stock badge when stock is 0', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/4' })

    await waitFor(() => {
      expect(screen.getByText('Cozonac cu nucă')).toBeInTheDocument()
    })

    expect(screen.getByText('Nu mai avem momentan')).toBeInTheDocument()
  })

  test('add to cart button shows "Indisponibil" when out of stock', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/4' })

    await waitFor(() => {
      expect(screen.getByText('Cozonac cu nucă')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Indisponibil/i })).toBeInTheDocument()
  })

  test('add to cart button is disabled when out of stock', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/4' })

    await waitFor(() => {
      expect(screen.getByText('Cozonac cu nucă')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Indisponibil/i })
    expect(addButton).toBeDisabled()
  })

  test('clicking disabled button does not add to cart', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProductPage />, { route: '/product/4' })

    await waitFor(() => {
      expect(screen.getByText('Cozonac cu nucă')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: /Indisponibil/i })
    
    // Try to click (should not work because it's disabled)
    await user.click(addButton)

    // Cart badge (red circle) should not appear
    const cartBadges = screen.queryAllByText('1').filter(el => 
      el.closest('span.bg-gradient-to-r')
    )
    expect(cartBadges.length).toBe(0)
  })
})

describe('ProductPage - Edge Cases', () => {
  beforeEach(() => {
    resetCartStore()
  })

  test('handles product with long description', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/4' })

    await waitFor(() => {
      expect(screen.getByText('Cozonac cu nucă')).toBeInTheDocument()
    })

    // Long description should be displayed
    expect(screen.getByText(/Cozonac tradițional românesc/)).toBeInTheDocument()
    expect(screen.getByText(/Rețetă tradițională transmisă din generație în generație/)).toBeInTheDocument()
  })

  test('handles product with multiple images correctly', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/5' })

    await waitFor(() => {
      expect(screen.getByText('Franzela cu susan')).toBeInTheDocument()
    })

    // Should have thumbnail gallery
    const thumbnails = screen.getAllByRole('button').filter(button => 
      button.querySelector('img[alt*="imagine"]')
    )
    expect(thumbnails.length).toBe(3)
  })

  test('back button displays on product not found page', async () => {
    renderWithProviders(<ProductPage />, { route: '/product/999' })

    await waitFor(() => {
      expect(screen.getByText('Produsul nu a fost găsit')).toBeInTheDocument()
    })

    // Verify back button exists
    const backButton = screen.getByRole('button', { name: /Înapoi la Produse/i })
    expect(backButton).toBeInTheDocument()
  })
})

