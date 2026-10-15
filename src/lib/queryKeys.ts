// Query keys for all API entities
// This ensures consistent caching and invalidation across the app

export const queryKeys = {
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.categories.details(), id] as const,
  },

  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.products.details(), id] as const,
    byCategory: (categoryId: number) => 
      [...queryKeys.products.lists(), { categoryId }] as const,
  },

  // Lists (Shopping Lists)
  lists: {
    all: ['lists'] as const,
    lists: () => [...queryKeys.lists.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.lists.lists(), filters] as const,
    details: () => [...queryKeys.lists.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.lists.details(), id] as const,
  },

  // Units
  units: {
    all: ['units'] as const,
    lists: () => [...queryKeys.units.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.units.lists(), filters] as const,
    details: () => [...queryKeys.units.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.units.details(), id] as const,
  },

  // Business Details
  business: {
    all: ['business'] as const,
    details: () => [...queryKeys.business.all, 'details'] as const,
  },

  // Delivery Types
  deliveryTypes: {
    all: ['delivery-types'] as const,
    lists: () => [...queryKeys.deliveryTypes.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.deliveryTypes.lists(), filters] as const,
    details: () => [...queryKeys.deliveryTypes.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.deliveryTypes.details(), id] as const,
  },

  // Payment Methods
  paymentMethods: {
    all: ['payment-methods'] as const,
    lists: () => [...queryKeys.paymentMethods.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.paymentMethods.lists(), filters] as const,
    details: () => [...queryKeys.paymentMethods.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.paymentMethods.details(), id] as const,
  },

  // Payment Types
  paymentTypes: {
    all: ['payment-types'] as const,
    lists: () => [...queryKeys.paymentTypes.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.paymentTypes.lists(), filters] as const,
  },

  // Delivery Schedules
  deliverySchedules: {
    all: ['delivery-schedules'] as const,
    lists: () => [...queryKeys.deliverySchedules.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.deliverySchedules.lists(), filters] as const,
    details: () => [...queryKeys.deliverySchedules.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.deliverySchedules.details(), id] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) => 
      [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.orders.details(), id] as const,
  },

  // System
  system: {
    all: ['system'] as const,
    config: () => [...queryKeys.system.all, 'config'] as const,
    nextDeliveryDate: (referenceDate?: string) =>
      [...queryKeys.system.all, 'next-delivery-date', referenceDate] as const,
  },

  // Statistics (admin)
  statistics: {
    all: ['statistics'] as const,
    overview: (range: Record<string, any>) =>
      [...queryKeys.statistics.all, 'overview', range] as const,
    products: (range: Record<string, any>) =>
      [...queryKeys.statistics.all, 'products', range] as const,
    customers: (range: Record<string, any>) =>
      [...queryKeys.statistics.all, 'customers', range] as const,
    currentList: () => [...queryKeys.statistics.all, 'current-list'] as const,
  },
};

// Helper function to invalidate related queries
export const invalidateQueries = {
  // Invalidate all category-related queries
  categories: () => queryKeys.categories.all,
  
  // Invalidate all product-related queries
  products: () => queryKeys.products.all,
  
  // Invalidate all list-related queries
  lists: () => queryKeys.lists.all,
  
  // Invalidate all unit-related queries
  units: () => queryKeys.units.all,
  
  // Invalidate business details
  business: () => queryKeys.business.details(),
  
  // Invalidate all delivery type-related queries
  deliveryTypes: () => queryKeys.deliveryTypes.all,
  
  // Invalidate all payment method-related queries
  paymentMethods: () => queryKeys.paymentMethods.all,
  
  // Invalidate all delivery schedule-related queries
  deliverySchedules: () => queryKeys.deliverySchedules.all,
  
  // Invalidate all order-related queries
  orders: () => queryKeys.orders.all,
}; 