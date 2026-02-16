import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  test('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('renders label linked to input via auto-generated id', () => {
    render(<Input label="Email" />)
    // getByLabelText validates the htmlFor↔id linkage
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  test('uses provided id over auto-generated', () => {
    render(<Input id="custom-id" label="Name" />)
    const input = screen.getByLabelText('Name')
    expect(input).toHaveAttribute('id', 'custom-id')
  })

  test('displays error message', () => {
    render(<Input error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  test('hides helperText when error is present', () => {
    render(<Input error="Bad value" helperText="Enter your email" />)
    expect(screen.getByText('Bad value')).toBeInTheDocument()
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  test('displays helperText when no error', () => {
    render(<Input helperText="Enter your email" />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })

  test('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon" />} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  test('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon" />} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  test('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Name" />)
    const input = screen.getByLabelText('Name')
    await user.type(input, 'hello')
    expect(input).toHaveValue('hello')
  })
})
