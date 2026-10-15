import { describe, test, expect, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/testUtils'
import {
  createTestCurrentListStats,
  createTestCustomerStats,
  createTestProductStats,
  createTestStatsOverview,
} from '@/test/mocks/handlers'
import { toISODate } from '@/components/features/admin/statistics/format'
import { CurrentListStats } from '@/types/statistics'
import Statistics from '../Statistics'

const API = 'http://localhost:8001/api/v1'

describe('Statistics page', () => {
  test('renders KPIs, comparison deltas and sections from the API', async () => {
    renderWithProviders(<Statistics />)

    expect(screen.getByRole('heading', { name: 'Statistici' })).toBeInTheDocument()
    expect(await screen.findByText('12.480 RON')).toBeInTheDocument()
    expect(screen.getByText('186')).toBeInTheDocument()
    // 12480 vs 11534 -> +8,2%
    expect(screen.getByText('+8,2%')).toBeInTheDocument()
    expect(screen.getByText('71,3%')).toBeInTheDocument()

    // Current list and stock warnings
    expect(await screen.findByText('Livrare: Joi, 15 octombrie')).toBeInTheDocument()
    const docket = screen.getByRole('region', { name: 'Lista curentă' })
    expect(within(docket).getByText('20 de bucăți comandate')).toBeInTheDocument()

    // Products, customers, breakdowns
    expect((await screen.findAllByText('Cozonac cu nucă')).length).toBeGreaterThan(0)
    expect(await screen.findByText('Elena Florea')).toBeInTheDocument()
    expect(screen.getByText('Ridicare de la sediu')).toBeInTheDocument()
  })

  test('shows empty states when there is no data', async () => {
    server.use(
      http.get(`${API}/statistics/overview`, () =>
        HttpResponse.json({
          period: { start_date: null, end_date: null, list_count: 0, previous_start_date: null, previous_end_date: null, previous_list_count: 0 },
          summary: { revenue: 0, orders: 0, average_order_value: 0, items_sold: 0, unique_customers: 0, returning_customers: 0, repeat_customer_rate: 0, cancelled_orders: 0, cancelled_rate: 0 },
          previous_summary: null,
          lists: [],
          delivery_types: [],
          payment_methods: [],
          heatmap: [],
        })
      )
    )
    renderWithProviders(<Statistics />)

    expect(await screen.findByText('Nicio listă cu comenzi în perioada selectată')).toBeInTheDocument()
    expect((await screen.findAllByText('Nu există date pentru perioada selectată.')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('fără comparație').length).toBeGreaterThan(0)
  })

  test('the period dropdown requests delivery-date ranges', async () => {
    const requested: string[] = []
    server.use(
      http.get(`${API}/statistics/overview`, ({ request }) => {
        requested.push(new URL(request.url).search)
        return HttpResponse.json(createTestStatsOverview())
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    const select = screen.getByRole('combobox', { name: 'Perioadă' })
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Ultima săptămână',
      'Ultimele 15 zile',
      'Ultima lună',
      'Ultimele 2 luni',
      'Ultimele 3 luni',
      'Ultimele 6 luni',
      'Ultimele 12 luni',
      'Anul acesta',
      'Toată perioada',
      'Interval personalizat…',
    ])
    // Opens on the last month; presets end today, leaving the open list to the docket
    const today = toISODate(new Date())
    expect(select).toHaveValue('months1')
    await waitFor(() => expect(requested[0]).toMatch(new RegExp(`^\\?start_date=\\d{4}-\\d{2}-\\d{2}&end_date=${today}$`)))

    await user.selectOptions(select, 'Anul acesta')
    await waitFor(() => expect(requested).toContain(`?start_date=${new Date().getFullYear()}-01-01&end_date=${today}`))
    await user.selectOptions(select, 'Toată perioada')
    await waitFor(() => expect(requested).toContain(`?end_date=${today}`))

    await user.selectOptions(select, 'Interval personalizat…')
    expect(screen.getByLabelText('De la')).toBeInTheDocument()
    expect(screen.getByLabelText('Până la')).toBeInTheDocument()
  })

  test('a custom range starts from the dates on screen and loads only a valid range', async () => {
    const requested: string[] = []
    server.use(
      http.get(`${API}/statistics/overview`, ({ request }) => {
        requested.push(new URL(request.url).search)
        return HttpResponse.json(createTestStatsOverview())
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    await waitFor(() => expect(requested).toHaveLength(1))
    const [, start, end] = /start_date=([\d-]+)&end_date=([\d-]+)/.exec(requested[0])!

    await user.selectOptions(screen.getByRole('combobox', { name: 'Perioadă' }), 'Interval personalizat…')
    const from = screen.getByLabelText('De la')
    expect(from).toHaveValue(start)
    expect(screen.getByLabelText('Până la')).toHaveValue(end)

    // A start after the end is explained, not requested
    fireEvent.change(from, { target: { value: '2099-01-01' } })
    expect(await screen.findByRole('alert')).toHaveTextContent('înaintea datei de sfârșit')

    fireEvent.change(from, { target: { value: '2020-01-01' } })
    await waitFor(() => expect(requested).toContain(`?start_date=2020-01-01&end_date=${end}`))
    expect(requested).toHaveLength(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('sections whose request failed say so instead of showing an empty state', async () => {
    const fail = () => HttpResponse.json({ detail: 'Eroare' }, { status: 500 })
    server.use(
      http.get(`${API}/statistics/products`, fail),
      http.get(`${API}/statistics/current-list`, fail)
    )
    renderWithProviders(<Statistics />)

    expect(await screen.findByText('Nu s-a putut încărca lista curentă.')).toBeInTheDocument()
    // Top products, categories, sold-out and unsold products
    await waitFor(() => expect(screen.getAllByText('Nu s-au putut încărca datele.')).toHaveLength(4))
    expect(screen.queryByText('Toate produsele oferite s-au vândut cel puțin o dată.')).not.toBeInTheDocument()
    // Sections fed by the requests that succeeded still render
    expect(await screen.findByText('Elena Florea')).toBeInTheDocument()
  })

  test('the trend chart marks the current list as in progress only while it takes orders', async () => {
    const currentListClosing = (offsetMs: number) => {
      const stats = createTestCurrentListStats()
      return { ...stats, list: { ...stats.list, expiration_date: new Date(Date.now() + offsetMs).toISOString() } }
    }
    const legend = 'Lista curentă – încă primește comenzi'

    server.use(http.get(`${API}/statistics/current-list`, () => HttpResponse.json(currentListClosing(60 * 60 * 1000))))
    const { unmount } = renderWithProviders(<Statistics />)
    expect(await screen.findByText(legend)).toBeInTheDocument()
    unmount()

    server.use(http.get(`${API}/statistics/current-list`, () => HttpResponse.json(currentListClosing(-60 * 60 * 1000))))
    renderWithProviders(<Statistics />)
    expect(await screen.findByText('Nu se mai pot primi comenzi')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Joi, 15 oct: 5\.880 RON$/ })).toBeInTheDocument()
    expect(screen.queryByText(legend)).not.toBeInTheDocument()
  })

  test('the live docket lists the products that sold out and links to the list', async () => {
    renderWithProviders(<Statistics />)

    expect(await screen.findByRole('link', { name: /Vezi cele 88 de comenzi/ })).toHaveAttribute(
      'href',
      '/admin/lists/216/manage?tab=orders'
    )
    const docket = screen.getByRole('region', { name: 'Lista curentă' })
    expect(within(docket).getByRole('link', { name: /Gestionează produsele/ })).toHaveAttribute(
      'href',
      '/admin/lists/216/manage?tab=products2'
    )
    const soldOut = within(docket).getByRole('list', { name: 'Produse epuizate' })
    expect(within(soldOut).getByText('Cozonac cu nucă')).toBeInTheDocument()
    expect(within(soldOut).getByText('20 de bucăți comandate')).toBeInTheDocument()
  })

  describe('the docket names the list by whether it takes orders', () => {
    const withList = (list: Partial<NonNullable<CurrentListStats['list']>> | null) =>
      server.use(
        http.get(`${API}/statistics/current-list`, () => {
          const stats = createTestCurrentListStats()
          return HttpResponse.json({ ...stats, list: list && { ...stats.list, ...list } })
        })
      )
    const hour = 60 * 60 * 1000

    test('a published list before its expiration date is the current list', async () => {
      withList({ expiration_date: new Date(Date.now() + 26 * hour).toISOString() })
      renderWithProviders(<Statistics />)

      // The loading skeleton has the same heading, so wait for the list itself
      expect(await screen.findByText('Publicată')).toBeInTheDocument()
      const docket = screen.getByRole('region', { name: 'Lista curentă' })
      expect(within(docket).getByText(/Se pot primi comenzi · lista expiră în/)).toHaveTextContent(
        'Se pot primi comenzi · lista expiră în 1 zi 1 oră'
      )
    })

    test('a published list without an expiration date takes orders', async () => {
      withList({ expiration_date: null })
      renderWithProviders(<Statistics />)

      expect(await screen.findByText('Se pot primi comenzi')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Lista curentă' })).toHaveTextContent('Publicată')
    })

    test('a published list past its expiration date is the latest list, expired', async () => {
      withList({ expiration_date: new Date(Date.now() - hour).toISOString() })
      renderWithProviders(<Statistics />)

      const docket = await screen.findByRole('region', { name: 'Ultima listă' })
      expect(within(docket).getByText('Expirată')).toBeInTheDocument()
      expect(within(docket).getByText('Nu se mai pot primi comenzi')).toBeInTheDocument()
    })

    test('an unpublished list is the latest list, a draft', async () => {
      withList({ is_published: false })
      renderWithProviders(<Statistics />)

      const docket = await screen.findByRole('region', { name: 'Ultima listă' })
      expect(within(docket).getByText('Ciornă')).toBeInTheDocument()
      expect(within(docket).getByText('Nu se pot primi comenzi încă')).toBeInTheDocument()
    })

    test('without any list there is no docket', async () => {
      withList(null)
      renderWithProviders(<Statistics />)

      await screen.findByText('12.480 RON')
      // The loading skeleton has the docket's heading; once the request is done the card is gone
      await waitFor(() =>
        expect(screen.queryByRole('region', { name: /Lista curentă|Ultima listă/ })).not.toBeInTheDocument()
      )
      expect(screen.queryByText(/Livrare:/)).not.toBeInTheDocument()
    })
  })

  test('the docket says when nothing has sold out yet', async () => {
    server.use(
      http.get(`${API}/statistics/current-list`, () =>
        HttpResponse.json({ ...createTestCurrentListStats(), sold_out: [] })
      )
    )
    renderWithProviders(<Statistics />)

    expect(await screen.findByText('Niciun produs epuizat până acum')).toBeInTheDocument()
  })

  test('shows how often products sold out in the period', async () => {
    renderWithProviders(<Statistics />)

    expect(await screen.findByText('Epuizat în 3 din 4 liste')).toBeInTheDocument()
  })

  test('long product lists open with "Vezi toate"', async () => {
    const sellOuts = Array.from({ length: 9 }, (_, i) => ({
      product_id: 100 + i, name: `Produs ${i + 1}`, category_name: null, sold_out: 1, offered: 2,
    }))
    server.use(
      http.get(`${API}/statistics/products`, () =>
        HttpResponse.json({ ...createTestProductStats(), sell_outs: sellOuts })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    await user.click(await screen.findByRole('button', { name: 'Vezi toate (9)' }))
    expect(screen.getByText('Produs 9')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Arată mai puțin' })).toBeInTheDocument()
  })

  test('top customers can be ranked by orders or by value', async () => {
    const customer = (name: string, orders: number, revenue: number) => ({
      name, phone_number: null, orders, lists: orders, revenue, last_order_date: '2026-10-13T16:38:00Z',
    })
    const frequent = customer('Ana Pop', 6, 300)
    const bigSpender = customer('Bogdan Rusu', 2, 900)
    server.use(
      http.get(`${API}/statistics/customers`, () =>
        HttpResponse.json({
          ...createTestCustomerStats(),
          top_customers: [bigSpender, frequent],
          top_customers_by_orders: [frequent, bigSpender],
        })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    const table = await screen.findByRole('table', { name: 'Top clienți' })
    const firstRow = () => within(table).getAllByRole('row')[1]
    await waitFor(() => expect(within(firstRow()).getByText('Ana Pop')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'După valoare' }))
    expect(within(firstRow()).getByText('Bogdan Rusu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'După valoare' })).toHaveAttribute('aria-pressed', 'true')
  })

  describe('top customers show 10 at a time', () => {
    const withCustomers = (count: number) => {
      const customers = Array.from({ length: count }, (_, i) => ({
        name: `Client ${i + 1}`, phone_number: null, orders: count - i, lists: count - i, revenue: 1000 - i,
        last_order_date: '2026-10-13T16:38:00Z',
      }))
      server.use(
        http.get(`${API}/statistics/customers`, () =>
          HttpResponse.json({ ...createTestCustomerStats(), top_customers: customers, top_customers_by_orders: customers })
        )
      )
    }
    // Header row excluded
    const shownRows = () => within(screen.getByRole('table', { name: 'Top clienți' })).getAllByRole('row').length - 1

    test('each click adds the next 10', async () => {
      withCustomers(25)
      const user = userEvent.setup()
      renderWithProviders(<Statistics />)

      await user.click(await screen.findByRole('button', { name: 'Vezi încă 10 clienți' }))
      expect(shownRows()).toBe(20)
      await user.click(screen.getByRole('button', { name: 'Vezi încă 5 clienți' }))
      expect(shownRows()).toBe(25)
      expect(screen.getByText('Client 25')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Vezi încă/ })).not.toBeInTheDocument()
    })

    test('says when the API maximum of 100 is reached', async () => {
      withCustomers(100)
      const user = userEvent.setup()
      renderWithProviders(<Statistics />)

      await screen.findByRole('button', { name: 'Vezi încă 10 clienți' })
      expect(shownRows()).toBe(10)
      for (let shown = 10; shown < 100; shown += 10) {
        await user.click(screen.getByRole('button', { name: 'Vezi încă 10 clienți' }))
      }
      expect(shownRows()).toBe(100)
      expect(screen.getByText('Sunt afișați primii 100 de clienți.')).toBeInTheDocument()
    })
  })

  test('the trend chart shows a tooltip per list and has a table view', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    await user.hover(await screen.findByRole('button', { name: /Joi, 8 oct: 6\.600 RON/ }))
    const tooltip = screen.getByRole('tooltip')
    expect(within(tooltip).getByText('6.600 RON')).toBeInTheDocument()
    expect(within(tooltip).getByText('98')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tabel' }))
    expect(screen.getByRole('columnheader', { name: 'Valoare medie' })).toBeInTheDocument()
  })

  test('the heatmap summarises peak times for phones', async () => {
    renderWithProviders(<Statistics />)

    expect(await screen.findByText('Ziua de vârf')).toBeInTheDocument()
    // 14 of 17 orders came on a Wednesday
    expect(screen.getByText('82,4% din comenzi')).toBeInTheDocument()
    expect(screen.getByText('18:00 – 21:00')).toBeInTheDocument()
  })

  test('exports the summary as a CSV file named after the period', async () => {
    const createObjectURL = vi.fn(() => 'blob:stats')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
    const downloads: string[] = []
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      downloads.push(this.download)
    })
    const user = userEvent.setup()
    renderWithProviders(<Statistics />)

    await screen.findByText('12.480 RON')
    await user.click(screen.getByText('Exportă CSV'))
    await user.click(screen.getByRole('button', { name: /Sumar indicatori/ }))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(downloads).toEqual(['statistici_sumar_2026-09-24_2026-10-15.csv'])

    click.mockRestore()
    delete (URL as unknown as Record<string, unknown>).createObjectURL
    delete (URL as unknown as Record<string, unknown>).revokeObjectURL
  })
})
