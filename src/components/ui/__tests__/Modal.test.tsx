import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  children: <p>Modal content</p>,
}

beforeEach(() => {
  vi.clearAllMocks()
  document.body.style.overflow = ''
})

describe('Modal', () => {
  test('renders nothing when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  test('renders children when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  test('renders title', () => {
    render(<Modal {...defaultProps} title="My Title" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  test('renders close button by default', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /închide modal/i })).toBeInTheDocument()
  })

  test('hides close button when showCloseButton=false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} title="Title" />)
    expect(screen.queryByRole('button', { name: /închide modal/i })).not.toBeInTheDocument()
  })

  test('does not render header when no title and showCloseButton=false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    // No h3 title and no close button means no header border-b section
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /închide modal/i })).not.toBeInTheDocument()
  })

  test('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /închide modal/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('calls onClose on Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('calls onClose on backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(<Modal {...defaultProps} onClose={onClose} />)
    const backdrop = container.querySelector('[aria-hidden="true"]')!
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  test('does not call onClose when modal content clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByText('Modal content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  test('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} />)
    expect(document.body.style.overflow).toBe('hidden')
  })
})
