import { queryKeys, invalidateQueries } from '@/lib/queryKeys'

describe('queryKeys', () => {
  // Test the standard CRUD pattern shared by most entities
  const standardEntities = [
    { name: 'categories', key: 'categories' },
    { name: 'products', key: 'products' },
    { name: 'lists', key: 'lists' },
    { name: 'units', key: 'units' },
    { name: 'deliveryTypes', key: 'delivery-types' },
    { name: 'paymentMethods', key: 'payment-methods' },
    { name: 'deliverySchedules', key: 'delivery-schedules' },
    { name: 'orders', key: 'orders' },
  ] as const

  describe.each(standardEntities)('$name', ({ name, key }) => {
    const entity = queryKeys[name as keyof typeof queryKeys] as any

    test('.all returns the base key', () => {
      expect(entity.all).toEqual([key])
    })

    test('.lists() extends .all with "list"', () => {
      expect(entity.lists()).toEqual([key, 'list'])
    })

    test('.list(filters) includes filters in key', () => {
      const filters = { search: 'test', page: 1 }
      expect(entity.list(filters)).toEqual([key, 'list', filters])
    })
  })

  // Entities that have detail keys
  const entitiesWithDetails = [
    'categories', 'products', 'lists', 'units',
    'deliveryTypes', 'paymentMethods', 'deliverySchedules', 'orders',
  ] as const

  describe.each(entitiesWithDetails)('%s detail keys', (name) => {
    const entity = queryKeys[name as keyof typeof queryKeys] as any

    test('.details() extends .all with "detail"', () => {
      const all = entity.all
      expect(entity.details()).toEqual([...all, 'detail'])
    })

    test('.detail(id) includes id in key', () => {
      expect(entity.detail(42)).toEqual([...entity.details(), 42])
    })
  })

  describe('products — special keys', () => {
    test('.byCategory(categoryId) includes categoryId in filter object', () => {
      expect(queryKeys.products.byCategory(5)).toEqual([
        'products', 'list', { categoryId: 5 },
      ])
    })
  })

  describe('paymentTypes — limited keys', () => {
    test('.all returns ["payment-types"]', () => {
      expect(queryKeys.paymentTypes.all).toEqual(['payment-types'])
    })

    test('.lists() extends .all with "list"', () => {
      expect(queryKeys.paymentTypes.lists()).toEqual(['payment-types', 'list'])
    })

    test('does not have details()', () => {
      expect((queryKeys.paymentTypes as any).details).toBeUndefined()
    })
  })

  describe('business — limited keys', () => {
    test('.all returns ["business"]', () => {
      expect(queryKeys.business.all).toEqual(['business'])
    })

    test('.details() extends .all with "details"', () => {
      expect(queryKeys.business.details()).toEqual(['business', 'details'])
    })
  })

  describe('system', () => {
    test('.all returns ["system"]', () => {
      expect(queryKeys.system.all).toEqual(['system'])
    })

    test('.config() extends .all with "config"', () => {
      expect(queryKeys.system.config()).toEqual(['system', 'config'])
    })

    test('.nextDeliveryDate() includes reference date', () => {
      expect(queryKeys.system.nextDeliveryDate('2026-02-14')).toEqual([
        'system', 'next-delivery-date', '2026-02-14',
      ])
    })

    test('.nextDeliveryDate() works without reference date', () => {
      expect(queryKeys.system.nextDeliveryDate()).toEqual([
        'system', 'next-delivery-date', undefined,
      ])
    })
  })

  describe('cache invalidation correctness', () => {
    test('child keys are prefixed by parent key', () => {
      // This is crucial: invalidating queryKeys.products.all should
      // also invalidate any query whose key starts with ['products']
      const allKey = queryKeys.products.all
      const listKey = queryKeys.products.lists()
      const detailKey = queryKeys.products.details()

      expect(listKey.slice(0, allKey.length)).toEqual(allKey)
      expect(detailKey.slice(0, allKey.length)).toEqual(allKey)
    })

    test('different filters produce different keys', () => {
      const key1 = queryKeys.products.list({ search: 'bread' })
      const key2 = queryKeys.products.list({ search: 'milk' })
      expect(key1).not.toEqual(key2)
    })

    test('same filters produce structurally equal keys', () => {
      const key1 = queryKeys.products.list({ search: 'bread' })
      const key2 = queryKeys.products.list({ search: 'bread' })
      expect(key1).toEqual(key2)
    })
  })
})

describe('invalidateQueries', () => {
  test('categories() returns categories.all', () => {
    expect(invalidateQueries.categories()).toEqual(queryKeys.categories.all)
  })

  test('products() returns products.all', () => {
    expect(invalidateQueries.products()).toEqual(queryKeys.products.all)
  })

  test('lists() returns lists.all', () => {
    expect(invalidateQueries.lists()).toEqual(queryKeys.lists.all)
  })

  test('units() returns units.all', () => {
    expect(invalidateQueries.units()).toEqual(queryKeys.units.all)
  })

  test('business() returns business.details()', () => {
    expect(invalidateQueries.business()).toEqual(queryKeys.business.details())
  })

  test('deliveryTypes() returns deliveryTypes.all', () => {
    expect(invalidateQueries.deliveryTypes()).toEqual(queryKeys.deliveryTypes.all)
  })

  test('paymentMethods() returns paymentMethods.all', () => {
    expect(invalidateQueries.paymentMethods()).toEqual(queryKeys.paymentMethods.all)
  })

  test('deliverySchedules() returns deliverySchedules.all', () => {
    expect(invalidateQueries.deliverySchedules()).toEqual(queryKeys.deliverySchedules.all)
  })

  test('orders() returns orders.all', () => {
    expect(invalidateQueries.orders()).toEqual(queryKeys.orders.all)
  })
})
