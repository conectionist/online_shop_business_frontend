import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, matchPath } from 'react-router-dom'
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
import { lazyPage } from './utils/chunkLoad'

// The landing page ships in the main bundle. Every other page is its own chunk,
// loaded when first needed, so shoppers don't download admin code or pages
// they never open. (The admin PDF/Excel libraries are also kept out of the
// service worker precache; see vite.config.ts.)

// Shop pages: one list drives the lazy routes, the preload of the page being
// opened, and the background prefetch.
const loadCatalogPage = () => import('./pages/customer/CatalogPage')
const loadCategoryCatalogPage = () => import('./pages/customer/CategoryCatalogPage')
const loadProductPage = () => import('./pages/customer/ProductPage')
const loadCartPage = () => import('./pages/customer/CartPage')
const loadOrderForm = () => import('./pages/customer/OrderForm')
const loadOrderConfirmation = () => import('./pages/customer/OrderConfirmation')
const loadLoginPage = () => import('./pages/LoginPage')
const loadContactPage = () => import('./pages/ContactPage')
const loadPrivacyPolicy = () => import('./pages/PrivacyPolicy')
const loadTermsAndConditions = () => import('./pages/TermsAndConditions')
const loadCookiesPolicy = () => import('./pages/CookiesPolicy')
const loadReturnsPolicy = () => import('./pages/ReturnsPolicy')

const shopRoutes: { path: string; load: () => Promise<unknown>; prefetch?: boolean }[] = [
  { path: '/catalog', load: loadCatalogPage, prefetch: true },
  { path: '/catalog/category/:categoryId', load: loadCategoryCatalogPage, prefetch: true },
  { path: '/product/:productId', load: loadProductPage, prefetch: true },
  { path: '/cart', load: loadCartPage, prefetch: true },
  { path: '/order-form', load: loadOrderForm, prefetch: true },
  { path: '/order-confirmation', load: loadOrderConfirmation },
  { path: '/login', load: loadLoginPage },
  { path: '/contact', load: loadContactPage },
  { path: '/politica-confidentialitate', load: loadPrivacyPolicy },
  { path: '/termeni-si-conditii', load: loadTermsAndConditions },
  { path: '/politica-cookie-uri', load: loadCookiesPolicy },
  { path: '/politica-retur', load: loadReturnsPolicy },
]

const CatalogPage = lazyPage(loadCatalogPage)
const CategoryCatalogPage = lazyPage(loadCategoryCatalogPage)
const ProductPage = lazyPage(loadProductPage)
const CartPage = lazyPage(loadCartPage)
const OrderForm = lazyPage(loadOrderForm)
const OrderConfirmation = lazyPage(loadOrderConfirmation)
const LoginPage = lazyPage(loadLoginPage)
const ContactPage = lazyPage(loadContactPage)
const PrivacyPolicy = lazyPage(loadPrivacyPolicy)
const TermsAndConditions = lazyPage(loadTermsAndConditions)
const CookiesPolicy = lazyPage(loadCookiesPolicy)
const ReturnsPolicy = lazyPage(loadReturnsPolicy)

const ignoreFailure = () => {
  // Best effort: if this fails, the route loads (and recovers) when rendered
}

// Opening a shop page directly (e.g. a product link): start fetching its chunk
// now, in parallel with React startup and auth, instead of after first render.
const currentShopRoute = shopRoutes.find((route) => matchPath(route.path, window.location.pathname))
currentShopRoute?.load().catch(ignoreFailure)

const isShopPath = (pathname: string) => !pathname.startsWith('/admin') && pathname !== '/login'

const prefersReducedData = () =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

const prefetchShopPages = () => {
  if (!isShopPath(window.location.pathname) || prefersReducedData()) {
    return
  }
  for (const route of shopRoutes) {
    if (route.prefetch) {
      route.load().catch(ignoreFailure)
    }
  }
}

// Admin pages
const AdminDashboard = lazyPage(() => import('./pages/admin/Dashboard'))
const AdvancedOperations = lazyPage(() => import('@/pages/admin/AdvancedOperations'))
const NotificationsHome = lazyPage(() => import('@/pages/admin/notifications/NotificationsHome'))
const MySubscriptions = lazyPage(() => import('@/pages/admin/notifications/MySubscriptions'))
const SessionsList = lazyPage(() => import('./pages/admin/SessionsList'))
const CategoriesList = lazyPage(() => import('./pages/admin/CategoriesList'))
const CategoryForm = lazyPage(() => import('./pages/admin/CategoryForm'))
const ProductsList = lazyPage(() => import('./pages/admin/ProductsList'))
const ProductForm = lazyPage(() => import('./pages/admin/ProductForm'))
const UnitsList = lazyPage(() => import('./pages/admin/UnitsList'))
const UnitForm = lazyPage(() => import('./pages/admin/UnitForm'))
const DeliverySchedulesList = lazyPage(() => import('./pages/admin/DeliverySchedulesList'))
const DeliveryScheduleForm = lazyPage(() => import('./pages/admin/DeliveryScheduleForm'))
const DeliveryTypesList = lazyPage(() => import('./pages/admin/DeliveryTypesList'))
const DeliveryTypeForm = lazyPage(() => import('./pages/admin/DeliveryTypeForm'))
const PaymentMethodsList = lazyPage(() => import('./pages/admin/PaymentMethodsList'))
const PaymentMethodForm = lazyPage(() => import('./pages/admin/PaymentMethodForm'))
const BusinessDetailsList = lazyPage(() => import('./pages/admin/BusinessDetailsList'))
const SecurityPage = lazyPage(() => import('./pages/admin/SecurityPage'))
const BusinessDetailsForm = lazyPage(() => import('./pages/admin/BusinessDetailsForm'))
const ListsList = lazyPage(() => import('./pages/admin/ListsList'))
const ListForm = lazyPage(() => import('./pages/admin/ListForm'))
const ListProducts = lazyPage(() => import('./pages/admin/ListProducts'))
const ListManagement = lazyPage(() => import('./pages/admin/ListManagement'))
const Statistics = lazyPage(() => import('./pages/admin/Statistics'))

// Warms the main shop page chunks once the page has fully loaded and the
// browser is idle, so moving from the landing page to the catalog, a product
// or the cart doesn't wait on the network. Skipped in the admin area, on the
// login page and when the shopper has data saver on.
function PrefetchShopPages() {
  useEffect(() => {
    let idleId: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(prefetchShopPages, { timeout: 5000 })
      } else {
        timer = setTimeout(prefetchShopPages, 1000)
      }
    }
    if (document.readyState === 'complete') {
      schedule()
    } else {
      window.addEventListener('load', schedule, { once: true })
    }
    return () => {
      window.removeEventListener('load', schedule)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      clearTimeout(timer)
    }
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