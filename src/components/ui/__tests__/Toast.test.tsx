import { render, screen, act, fireEvent } from '@testing-library/react'
import Toast from '../Toast'
import { ToastProvider, useToast } from '../ToastContainer'

// ─── Toast unit tests ────────────────────────────────────────────

describe('Toast — unit', () => {
  test('renders title', () => {
    render(<Toast id="1" type="success" title="Success!" onClose={() => {}} />)
    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  test('renders message when provided', () => {
    render(<Toast id="1" type="info" title="Info" message="Details here" onClose={() => {}} />)
    expect(screen.getByText('Details here')).toBeInTheDocument()
  })

  test('does not render message when not provided', () => {
    render(<Toast id="1" type="info" title="Info" onClose={() => {}} />)
    expect(screen.queryByText('Details here')).not.toBeInTheDocument()
  })

  test('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Toast id="42" type="error" title="Error" onClose={onClose} duration={99999} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledWith('42')
  })
})

describe('Toast — auto-dismiss', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('auto-dismisses after default duration (5000ms)', () => {
    const onClose = vi.fn()
    render(<Toast id="1" type="success" title="Done" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onClose).toHaveBeenCalledWith('1')
  })

  test('auto-dismisses with custom duration', () => {
    const onClose = vi.fn()
    render(<Toast id="2" type="warning" title="Warning" duration={2000} onClose={onClose} />)
    act(() => { vi.advanceTimersByTime(1999) })
    expect(onClose).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(1) })
    expect(onClose).toHaveBeenCalledWith('2')
  })
})

// ─── ToastProvider integration tests ─────────────────────────────

const TestConsumer = ({ action }: { action: (ctx: ReturnType<typeof useToast>) => void }) => {
  const toast = useToast()
  return <button onClick={() => action(toast)}>trigger</button>
}

describe('ToastProvider — integration', () => {
  test('showToast adds a toast to the screen', () => {
    render(
      <ToastProvider>
        <TestConsumer action={(ctx) => ctx.showToast({ type: 'success', title: 'Saved!', duration: 99999 })} />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  test('hideToast removes a toast via close button', () => {
    render(
      <ToastProvider>
        <TestConsumer action={(ctx) => ctx.showToast({ type: 'info', title: 'Temp', duration: 99999 })} />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText('Temp')).toBeInTheDocument()
    // The toast has a close button — click it to remove
    const closeButtons = screen.getAllByRole('button')
    // First button is "trigger", second is the toast close button
    const toastCloseButton = closeButtons[closeButtons.length - 1]
    fireEvent.click(toastCloseButton)
    expect(screen.queryByText('Temp')).not.toBeInTheDocument()
  })

  test('renders multiple toasts', () => {
    let callCount = 0
    render(
      <ToastProvider>
        <TestConsumer action={(ctx) => {
          callCount++
          ctx.showToast({ type: 'info', title: `Toast ${callCount}`, duration: 99999 })
        }} />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('trigger'))
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
  })
})

describe('ToastProvider — auto-dismiss', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('toast auto-dismisses through provider', () => {
    render(
      <ToastProvider>
        <TestConsumer action={(ctx) => ctx.showToast({ type: 'success', title: 'Bye', duration: 3000 })} />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText('Bye')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(3000) })
    expect(screen.queryByText('Bye')).not.toBeInTheDocument()
  })
})

// ─── useToast outside provider ───────────────────────────────────

describe('useToast', () => {
  test('does not throw outside provider (default context is no-op)', () => {
    // createContext has a non-null default value, so useContext never returns falsy.
    // The if(!context) throw on line 58 of ToastContainer.tsx is dead code.
    const Comp = () => {
      const ctx = useToast()
      ctx.showToast({ type: 'info', title: 'Test' })
      return <div>rendered</div>
    }
    expect(() => render(<Comp />)).not.toThrow()
  })
})
