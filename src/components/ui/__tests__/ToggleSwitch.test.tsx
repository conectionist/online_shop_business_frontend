import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToggleSwitch from '../ToggleSwitch'

describe('ToggleSwitch', () => {
  test('renders with role="switch"', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  test('has aria-checked="true" when checked', () => {
    render(<ToggleSwitch checked={true} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  test('has aria-checked="false" when unchecked', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  test('renders label text', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} label="Dark mode" />)
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  test('calls onChange with toggled value on click', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ToggleSwitch checked={false} onChange={handleChange} />)
    await user.click(screen.getByRole('switch'))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  test('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ToggleSwitch checked={false} onChange={handleChange} disabled />)
    await user.click(screen.getByRole('switch'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('is disabled when disabled prop set', () => {
    render(<ToggleSwitch checked={false} onChange={() => {}} disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
