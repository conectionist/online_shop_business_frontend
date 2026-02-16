import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TabNavigation from '../TabNavigation'

describe('TabNavigation', () => {
  test('renders all 5 tab labels', () => {
    render(<TabNavigation activeTab="edit" onTabChange={() => {}} />)
    expect(screen.getByText('Detalii')).toBeInTheDocument()
    expect(screen.getByText('Produse')).toBeInTheDocument()
    expect(screen.getByText('Produse3')).toBeInTheDocument()
    expect(screen.getByText('Comenzi')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  test('renders correct number of buttons', () => {
    render(<TabNavigation activeTab="edit" onTabChange={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  test('calls onTabChange with correct tab value when clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<TabNavigation activeTab="edit" onTabChange={handleChange} />)
    await user.click(screen.getByText('Comenzi'))
    expect(handleChange).toHaveBeenCalledWith('orders')
  })

  test('calls onTabChange for each tab', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<TabNavigation activeTab="edit" onTabChange={handleChange} />)

    const tabMap = [
      { label: 'Detalii', value: 'edit' },
      { label: 'Produse', value: 'products2' },
      { label: 'Produse3', value: 'products3' },
      { label: 'Comenzi', value: 'orders' },
      { label: 'Text', value: 'text' },
    ]

    for (const { label, value } of tabMap) {
      await user.click(screen.getByText(label))
      expect(handleChange).toHaveBeenCalledWith(value)
    }

    expect(handleChange).toHaveBeenCalledTimes(5)
  })
})
