import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import SEO from './components/SEO'
import ScrollToTop from './components/ScrollToTop'
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/Dashboard'
import CategoriesList from './pages/admin/CategoriesList'
import CategoryForm from './pages/admin/CategoryForm'
import ProductsList from './pages/admin/ProductsList'
import ProductForm from './pages/admin/ProductForm'
import UnitsList from './pages/admin/UnitsList'
import UnitForm from './pages/admin/UnitForm'
import DeliverySchedulesList from './pages/admin/DeliverySchedulesList'
import DeliveryScheduleForm from './pages/admin/DeliveryScheduleForm'
import DeliveryTypesList from './pages/admin/DeliveryTypesList'
import DeliveryTypeForm from './pages/admin/DeliveryTypeForm'
import PaymentMethodsList from './pages/admin/PaymentMethodsList'
import PaymentMethodForm from './pages/admin/PaymentMethodForm'
import BusinessDetailsList from './pages/admin/BusinessDetailsList'
import BusinessDetailsForm from './pages/admin/BusinessDetailsForm'
import ListsList from './pages/admin/ListsList'
import ListForm from './pages/admin/ListForm'
import ListProducts from './pages/admin/ListProducts'
import ListManagement from './pages/admin/ListManagement'
import CartPage from './pages/customer/CartPage'
import OrderForm from './pages/customer/OrderForm'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import ProductPage from './pages/customer/ProductPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsAndConditions from './pages/TermsAndConditions'
import AppLayout from './components/layout/AppLayout'
import CookiesPolicy from './pages/CookiesPolicy'
import ReturnsPolicy from './pages/ReturnsPolicy'
import ContactPage from './pages/ContactPage'
import { queryClient } from './lib/queryClient'
import { ToastProvider } from './components/ui/ToastContainer'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
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
            <Route path="lists" element={<ListsList />} />
            <Route path="lists/new" element={<ListForm />} />
            <Route path="lists/:id/edit" element={<ListForm />} />
            <Route path="lists/:id/products" element={<ListProducts />} />
            <Route path="lists/:id/manage" element={<ListManagement />} />
            {/* Future admin routes will go here */}
          </Route>

          {/* Admin routes are already handled above */}

          {/* Catch all - redirect to welcome */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* React Query Devtools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App 