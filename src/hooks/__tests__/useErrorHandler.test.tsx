import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/ToastContainer'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useErrorHandler', () => {
  test('returns expected shape', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper })
    expect(result.current).toHaveProperty('handleError')
    expect(result.current).toHaveProperty('errorDetails')
    expect(result.current).toHaveProperty('showErrorModal')
    expect(result.current).toHaveProperty('hideErrorModal')
  })

  test('initial state: showErrorModal is false, errorDetails is null', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper })
    expect(result.current.showErrorModal).toBe(false)
    expect(result.current.errorDetails).toBeNull()
  })

  describe('handleError (non-friendly errors)', () => {
    test('sets showErrorModal to true', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('Server error'), 'testing')
      })

      expect(result.current.showErrorModal).toBe(true)
      consoleSpy.mockRestore()
    })

    test('sets errorDetails with userAction and timestamp', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('fail'), 'saving product')
      })

      expect(result.current.errorDetails).not.toBeNull()
      expect(result.current.errorDetails!.userAction).toBe('saving product')
      expect(result.current.errorDetails!.timestamp).toBeDefined()
      consoleSpy.mockRestore()
    })

    test('sets errorDetails.url to window.location.href', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('fail'), 'test')
      })

      expect(result.current.errorDetails!.url).toBe(window.location.href)
      consoleSpy.mockRestore()
    })

    test('logs console.error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('fail'), 'test')
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    test('handles AxiosError with response.data.detail string', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      const axiosError = {
        isAxiosError: true,
        response: { status: 500, data: { detail: 'Internal server error' } },
        message: 'Request failed',
      }

      act(() => {
        result.current.handleError(axiosError, 'test')
      })

      expect(result.current.errorDetails!.message).toBeDefined()
      consoleSpy.mockRestore()
    })
  })

  describe('handleError (friendly 409 error)', () => {
    test('does NOT set showErrorModal for 409', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      const conflictError = {
        response: { status: 409, data: { detail: 'Duplicate name' } },
        message: 'Conflict',
      }

      act(() => {
        result.current.handleError(conflictError, 'test')
      })

      expect(result.current.showErrorModal).toBe(false)
      expect(result.current.errorDetails).toBeNull()
      consoleSpy.mockRestore()
    })

    test('still logs console.error for 409', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      const conflictError = {
        response: { status: 409, data: { detail: 'Dup' } },
        message: 'Conflict',
      }

      act(() => {
        result.current.handleError(conflictError, 'test')
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('handleError with showToastNotification=false', () => {
    test('still sets showErrorModal for non-friendly errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('fail'), 'test', false)
      })

      expect(result.current.showErrorModal).toBe(true)
      consoleSpy.mockRestore()
    })
  })

  describe('hideErrorModal', () => {
    test('resets showErrorModal and errorDetails', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useErrorHandler(), { wrapper })

      act(() => {
        result.current.handleError(new Error('fail'), 'test')
      })
      expect(result.current.showErrorModal).toBe(true)

      act(() => {
        result.current.hideErrorModal()
      })
      expect(result.current.showErrorModal).toBe(false)
      expect(result.current.errorDetails).toBeNull()
      consoleSpy.mockRestore()
    })
  })
})
