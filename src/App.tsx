import { lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import SEO from './components/SEO'
import ScrollToTop from './components/ScrollToTop'
import WelcomePage from './pages/WelcomePage'
import AppLayout from './components/layout/AppLayout'
import { queryClient } from './lib/queryClient'
import { ToastProvider } from './components/ui/ToastContainer'
import AuthInitializer from './components/AuthInitializer'
import { usePublishedList } from './hooks/useLists'
import { useCartStore } from './stores/cartStore'

// The landing page ships in the main bundle. Every other page is its own chunk,
// loaded when first visited, so shoppers don't download admin code (PDF and
// Excel export, drag and drop) or pages they never open.

// Shop pages. The main ones are also prefetched once the landing page is idle.
const loadCatalogPage = () => import('./pages/customer/CatalogPage')
const loadCategoryCatalogPage = () => import('./pages/customer/CategoryCatalogPage')
const loadProductPage = () => import('./pages/customer/ProductPage')
const loadCartPage = () => import('./pages/customer/CartPage')
const loadOrderForm = () => import('./pages/customer/OrderForm')

const CatalogPage = lazy(loadCatalogPage)
const CategoryCatalogPage = lazy(loadCategoryCatalogPage)
const ProductPage = lazy(loadProductPage)
const CartPage = lazy(loadCartPage)
const OrderForm = lazy(loadOrderForm)
const OrderConfirmation = lazy(() => import('./pages/customer/OrderConfirmation'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'))
const ReturnsPolicy = lazy(() => import('./pages/ReturnsPolicy'))

const prefetchShopPages = () => {
  for (const load of [loadCatalogPage, loadCategoryCatalogPage, loadProductPage, loadCartPage, loadOrderForm]) {
    load().catch(() => {
      // Prefetch is best effort; the route retries when visited
    })
  }
}

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdvancedOperations = lazy(() => import('@/pages/admin/AdvancedOperations'))
const NotificationsHome = lazy(() => import('@/pages/admin/notifications/NotificationsHome'))
const MySubscriptions = lazy(() => import('@/pages/admin/notifications/MySubscriptions'))
const SessionsList = lazy(() => import('./pages/admin/SessionsList'))
const CategoriesList = lazy(() => import('./pages/admin/CategoriesList'))
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'))
const ProductsList = lazy(() => import('./pages/admin/ProductsList'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))
const UnitsList = lazy(() => import('./pages/admin/UnitsList'))
const UnitForm = lazy(() => import('./pages/admin/UnitForm'))
const DeliverySchedulesList = lazy(() => import('./pages/admin/DeliverySchedulesList'))
const DeliveryScheduleForm = lazy(() => import('./pages/admin/DeliveryScheduleForm'))
const DeliveryTypesList = lazy(() => import('./pages/admin/DeliveryTypesList'))
const DeliveryTypeForm = lazy(() => import('./pages/admin/DeliveryTypeForm'))
const PaymentMethodsList = lazy(() => import('./pages/admin/PaymentMethodsList'))
const PaymentMethodForm = lazy(() => import('./pages/admin/PaymentMethodForm'))
const BusinessDetailsList = lazy(() => import('./pages/admin/BusinessDetailsList'))
const SecurityPage = lazy(() => import('./pages/admin/SecurityPage'))
const BusinessDetailsForm = lazy(() => import('./pages/admin/BusinessDetailsForm'))
const ListsList = lazy(() => import('./pages/admin/ListsList'))
const ListForm = lazy(() => import('./pages/admin/ListForm'))
const ListProducts = lazy(() => import('./pages/admin/ListProducts'))
const ListManagement = lazy(() => import('./pages/admin/ListManagement'))
const Statistics = lazy(() => import('./pages/admin/Statistics'))

// Warms the shop page chunks after the first load, so moving from the landing
// page to the catalog, a product or the cart doesn't wait on the network.
function PrefetchShopPages() {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetchShopPages, { timeout: 5000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = setTimeout(prefetchShopPages, 3000)
    return () => clearTimeout(timer)
  }, [])
  return null
}

function CartListSync() {
  const { data: publishedList } = usePublishedList()
  const purgeItemsNotInList = useCartStore((s) => s.purgeItemsNotInList)
  useEffect(() => {
    if (publishedList?.id) {
      purgeItemsNotInList(publishedList.id)
    }
  }, [publishedList?.id, purgeItemsNotInList])
  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartListSync />
      <PrefetchShopPages />
      <ToastProvider>
      <AuthInitializer>
      <Router>
        {/* Default SEO component for the entire app */}
        <SEO />
        
        {/* Scroll to top on route change */}
        <ScrollToTop />
        
        <Routes>
          {/* Public routes (wrapped with AppLayout for global footer) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-form" element={<OrderForm />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/category/:categoryId" element={<CategoryCatalogPage />} />
            <Route path="/politica-confidentialitate" element={<PrivacyPolicy />} />
            <Route path="/politica-cookie-uri" element={<CookiesPolicy />} />
            <Route path="/politica-retur" element={<ReturnsPolicy />} />
            <Route path="/termeni-si-conditii" element={<TermsAndConditions />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Protected admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="units" element={<UnitsList />} />
            <Route path="units/new" element={<UnitForm />} />
            <Route path="units/:id/edit" element={<UnitForm />} />
            <Route path="delivery-schedules" element={<DeliverySchedulesList />} />
            <Route path="delivery-schedules/new" element={<DeliveryScheduleForm />} />
            <Route path="delivery-schedules/:id/edit" element={<DeliveryScheduleForm />} />
            <Route path="delivery-types" element={<DeliveryTypesList />} />
            <Route path="delivery-types/new" element={<DeliveryTypeForm />} />
            <Route path="delivery-types/:id/edit" element={<DeliveryTypeForm />} />
            <Route path="payment-methods" element={<PaymentMethodsList />} />
            <Route path="payment-methods/new" element={<PaymentMethodForm />} />
            <Route path="payment-methods/:id/edit" element={<PaymentMethodForm />} />
            <Route path="business-details" element={<BusinessDetailsList />} />
            <Route path="business-details/new" element={<BusinessDetailsForm />} />
            <Route path="business-details/:id/edit" element={<BusinessDetailsForm />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="lists" element={<ListsList />} />
            <Route path="lists/new" element={<ListForm />} />
            <Route path="lists/:id/edit" element={<ListForm />} />
            <Route path="lists/:id/products" element={<ListProducts />} />
            <Route path="lists/:id/manage" element={<ListManagement />} />
            <Route path="advanced" element={<AdvancedOperations />} />
            <Route path="advanced/notifications" element={<NotificationsHome />} />
            <Route path="advanced/notifications/my-subscriptions" element={<MySubscriptions />} />
            <Route path="sessions" element={<SessionsList />} />
            <Route path="statistics" element={<Statistics />} />
            {/* Future admin routes will go here */}
          </Route>

          {/* Admin routes are already handled above */}

          {/* Catch all - redirect to welcome */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AuthInitializer>
      
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App 