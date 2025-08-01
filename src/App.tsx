import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'
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
import CartPage from './pages/customer/CartPage'
import OrderForm from './pages/customer/OrderForm'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import ProductPage from './pages/customer/ProductPage'
import { queryClient } from './lib/queryClient'
import { ToastProvider } from './components/ui/ToastContainer'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />

                  {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
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
          {/* Future admin routes will go here */}
        </Route>

          {/* Cart and Order routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-form" element={<OrderForm />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/product/:productId" element={<ProductPage />} />

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