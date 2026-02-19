import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from '../Select'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
]

describe('Select', () => {
  test('renders with placeholder text', () => {
    render(<Select options={options} onChange={() => {}} />)
    expect(screen.getByText('Selectează o opțiune')).toBeInTheDocument()
  })

  test('displays selected option label when value is set', () => {
    render(<Select options={options} value="a" onChange={() => {}} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  test('has aria-haspopup="listbox" and aria-expanded="false"', () => {
    render(<Select options={options} onChange={() => {}} />)
    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('closes dropdown on second click', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} />)
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('calls onChange when option clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Option B'))
    expect(handleChange).toHaveBeenCalledWith('b')
  })

  test('does not call onChange for disabled option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Option C'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('opens dropdown with Enter key', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} />)
    await user.tab() // focus trigger
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('opens dropdown with Space key', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} />)
    await user.tab()
    await user.keyboard(' ')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  test('navigates with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    await user.tab()
    await user.keyboard('{Enter}') // open
    await user.keyboard('{ArrowDown}') // highlight Option A (index 0)
    await user.keyboard('{ArrowDown}') // highlight Option B (index 1)
    await user.keyboard('{Enter}') // select
    expect(handleChange).toHaveBeenCalledWith('b')
  })

  test('closes dropdown with Escape', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  test('ArrowUp wraps to last option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select options={options} onChange={handleChange} />)
    await user.tab()
    await user.keyboard('{Enter}') // open, highlightedIndex = -1
    await user.keyboard('{ArrowUp}') // wraps to last (index 2, disabled)
    // ArrowUp from -1 wraps: prev > 0 ? prev - 1 : options.length - 1 → 2
    // Option C is disabled, but ArrowUp doesn't skip — it just highlights
    // Press ArrowUp again to go to index 1 (Option B)
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')
    expect(handleChange).toHaveBeenCalledWith('b')
  })

  test('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(<Select options={options} onChange={() => {}} disabled />)
    await user.click(screen.getByRole('button'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
