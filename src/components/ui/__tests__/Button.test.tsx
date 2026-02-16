import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'
import { Button } from '../Button'

describe('Button', () => {
  test('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('passes through HTML button attributes', () => {
    render(<Button type="submit" aria-label="Submit form">Go</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  test('renders all 5 variants without error', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
      unmount()
    })
  })

  test('renders all 3 sizes without error', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      expect(screen.getByRole('button', { name: size })).toBeInTheDocument()
      unmount()
    })
  })

  test('shows spinner when loading', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  test('hides icon when loading', () => {
    const { container } = render(<Button loading icon={Search}>Loading</Button>)
    // Spinner should be present
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    // Only one SVG (the spinner), not the Search icon
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(1)
  })

  test('disables button when loading', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('disables button when disabled prop set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('renders icon on the left by default', () => {
    render(<Button icon={Search}>Search</Button>)
    const button = screen.getByRole('button')
    // Icon (SVG) should be before the text node
    const firstChild = button.firstElementChild
    expect(firstChild?.tagName).toBe('svg')
  })

  test('renders icon on the right when iconPosition="right"', () => {
    render(<Button icon={Search} iconPosition="right">Search</Button>)
    const button = screen.getByRole('button')
    // Icon (SVG) should be after the text node
    const lastChild = button.lastElementChild
    expect(lastChild?.tagName).toBe('svg')
  })

  test('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
