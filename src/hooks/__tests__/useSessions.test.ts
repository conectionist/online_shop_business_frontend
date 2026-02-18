import { describe, test, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderHookWithQuery } from '@/test/testUtils'
import { queryKeys } from '@/lib/queryKeys'
import {
  useSessions,
  useCurrentSession,
  useRevokeSession,
  useLogoutOthers,
  useLogoutAll,
} from '@/hooks/useSessions'
import {
  useBusinessDetails,
  useBusinessDetailsSingle,
  useCreateBusinessDetails,
  useUpdateBusinessDetails,
  useDeleteBusinessDetails,
} from '@/hooks/useBusinessDetails'

const API = 'http://localhost:8001/api/v1'

const mockSessions = [
  { id: 1, user_agent: 'Chrome', created_at: '2026-01-01', is_current: true },
  { id: 2, user_agent: 'Firefox', created_at: '2026-01-02', is_current: false },
]
const mockCurrentSession = mockSessions[0]
const mockBusinessDetails = [{ id: 1, business_name: 'Test Bakery', adresa: 'Str. Test' }]

// Mock authService to prevent real logoutOthers/logoutAll side effects
vi.mock('@/services/authService', () => ({
  authService: {
    logoutOthers: vi.fn().mockResolvedValue({ message: 'ok' }),
    logoutAll: vi.fn().mockResolvedValue(undefined),
  },
}))

beforeEach(() => {
  vi.restoreAllMocks()
  server.use(
    http.get(`${API}/auth/sessions`, () => HttpResponse.json({ sessions: mockSessions })),
    http.get(`${API}/auth/sessions/current`, () => HttpResponse.json(mockCurrentSession)),
    http.delete(`${API}/auth/sessions/:id`, () => new HttpResponse(null, { status: 204 })),
    http.get(`${API}/detalii-business`, () => HttpResponse.json(mockBusinessDetails)),
    http.post(`${API}/detalii-business`, () => HttpResponse.json({ id: 2, business_name: 'New' })),
    http.put(`${API}/detalii-business/:id`, () => HttpResponse.json({ id: 1, business_name: 'Updated' })),
    http.delete(`${API}/detalii-business/:id`, () => new HttpResponse(null, { status: 204 })),
  )
})

// --- Sessions ---

describe('useSessions', () => {
  test('fetches sessions', async () => {
    const { result } = renderHookWithQuery(() => useSessions())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSessions)
  })
})

describe('useCurrentSession', () => {
  test('fetches current session', async () => {
    const { result } = renderHookWithQuery(() => useCurrentSession())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 1, is_current: true })
  })
})

describe('useRevokeSession', () => {
  test('invalidates sessions on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useRevokeSession())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(2)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['sessions'] })
  })
})

describe('useLogoutOthers', () => {
  test('invalidates sessions on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useLogoutOthers())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['sessions'] })
  })
})

describe('useLogoutAll', () => {
  test('clears entire query cache on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useLogoutAll())
    const clearSpy = vi.spyOn(queryClient, 'clear')

    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(clearSpy).toHaveBeenCalled()
  })
})

// --- Business Details ---

describe('useBusinessDetails', () => {
  test('fetches business details list', async () => {
    const { result } = renderHookWithQuery(() => useBusinessDetails())
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockBusinessDetails)
  })
})

describe('useBusinessDetailsSingle', () => {
  test('returns first item from list', async () => {
    const { result } = renderHookWithQuery(() => useBusinessDetailsSingle())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toMatchObject({ id: 1, business_name: 'Test Bakery' })
  })

  test('returns null when list is empty', async () => {
    server.use(http.get(`${API}/detalii-business`, () => HttpResponse.json([])))
    const { result } = renderHookWithQuery(() => useBusinessDetailsSingle())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })
})

describe('useCreateBusinessDetails', () => {
  test('invalidates business details on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useCreateBusinessDetails())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ business_name: 'New' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.business.details() })
  })
})

describe('useUpdateBusinessDetails', () => {
  test('invalidates business details on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useUpdateBusinessDetails())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate({ id: 1, data: { business_name: 'Updated' } as any })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.business.details() })
  })
})

describe('useDeleteBusinessDetails', () => {
  test('invalidates business details on success', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeleteBusinessDetails())
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate(1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.business.details() })
  })
})
