# UI Testing Roadmap

This document outlines comprehensive UI tests that should be added to ensure existing UI flows remain functional when changes are made. Tests are organized by priority and complexity.

## Current Test Setup

- **Framework**: Vitest + React Testing Library + MSW
- **Environment**: JSDOM (headless)
- **Dockerized**: Yes, runs in CI/CD pipeline
- **Coverage**: Basic smoke tests implemented

## Test Categories

### 1. Customer-Facing UI Flows (High Priority)

#### 1.1 Welcome Page & Navigation - COMPLETED!
- **File**: `src/pages/__tests__/WelcomePage.test.tsx`
- **Tests**:
  - Renders welcome message and business info
  - Displays current published list
  - Shows product categories
  - Navigation links work correctly
  - PWA install prompt appears when available

#### 1.2 Product Browsing & Selection - COMPLETED!
- **File**: `src/pages/customer/__tests__/ProductPage.test.tsx`
- **Tests**:
  - Product details display correctly
  - Add to cart functionality works
  - Quantity selection updates price
  - Product images load and display
  - Related products suggestions

#### 1.3 Shopping Cart Flow
- **File**: `src/pages/customer/__tests__/CartPage.test.tsx`
- **Tests**:
  - Cart displays added items correctly
  - Quantity updates work
  - Remove items functionality
  - Total price calculation
  - Empty cart state
  - Navigate to checkout

#### 1.4 Order Form & Checkout
- **File**: `src/pages/customer/__tests__/OrderForm.test.tsx`
- **Tests**:
  - Form validation (required fields)
  - Delivery type selection
  - Payment method selection
  - Address input (when required)
  - Phone number validation
  - Order submission opens WhatsApp
  - Empty cart redirect

#### 1.5 Order Confirmation
- **File**: `src/pages/customer/__tests__/OrderConfirmation.test.tsx`
- **Tests**:
  - Order details display correctly
  - Copy order text functionality
  - WhatsApp link generation
  - Navigation back to products
  - Missing order data redirect

### 2. Authentication & Protected Routes (High Priority)

#### 2.1 Login Flow
- **File**: `src/pages/__tests__/LoginPage.test.tsx`
- **Tests**:
  - Login form renders correctly
  - Form validation (username/password)
  - Successful login redirects to admin
  - Failed login shows error message
  - Remember me functionality
  - Password visibility toggle

#### 2.2 Protected Route Access
- **File**: `src/components/__tests__/ProtectedRoute.test.tsx`
- **Tests**:
  - Unauthenticated users redirected to login
  - Authenticated users can access protected routes
  - Loading state during auth validation
  - Token refresh handling
  - Redirect preserves intended destination

#### 2.3 Authentication State Management
- **File**: `src/components/__tests__/AuthInitializer.test.tsx`
- **Tests**:
  - App initialization with valid token
  - App initialization with expired token
  - Loading state during initialization
  - Token validation on startup

### 3. Admin Panel UI Flows (Medium Priority)

#### 3.1 Admin Dashboard
- **File**: `src/pages/admin/__tests__/Dashboard.test.tsx`
- **Tests**:
  - Dashboard renders correctly
  - Statistics display
  - Quick action buttons work
  - Recent orders list
  - Navigation to other admin sections

#### 3.2 Product Management
- **File**: `src/pages/admin/__tests__/ProductForm.test.tsx`
- **Tests**:
  - Create new product form
  - Edit existing product form
  - Form validation (required fields)
  - Image upload functionality
  - Category selection
  - Unit selection
  - Price and quantity inputs
  - Save/cancel actions

#### 3.3 List Management
- **File**: `src/pages/admin/__tests__/ListForm.test.tsx`
- **Tests**:
  - Create new list form
  - Edit existing list form
  - Date selection
  - Delivery schedule selection
  - Message and details input
  - Publish/unpublish toggle
  - Expiration date setting

#### 3.4 Business Details Management
- **File**: `src/pages/admin/__tests__/BusinessDetailsForm.test.tsx`
- **Tests**:
  - Business information form
  - Contact details input
  - Legal information (CUI, registration)
  - Delivery tax configuration
  - Form validation
  - Save functionality

### 4. UI Components (Medium Priority)

#### 4.1 Form Components
- **File**: `src/components/ui/__tests__/Input.test.tsx`
- **Tests**:
  - Input rendering with labels
  - Error state display
  - Helper text display
  - Left/right icons
  - Validation states
  - Accessibility attributes

- **File**: `src/components/ui/__tests__/Button.test.tsx`
- **Tests**:
  - Button variants (primary, secondary, outline, ghost, danger)
  - Button sizes (sm, md, lg)
  - Loading state
  - Disabled state
  - Icon positioning
  - Click handlers

- **File**: `src/components/ui/__tests__/Select.test.tsx`
- **Tests**:
  - Select dropdown functionality
  - Option selection
  - Placeholder text
  - Error states
  - Disabled state

#### 4.2 Layout Components
- **File**: `src/components/layout/__tests__/Header.test.tsx`
- **Tests**:
  - User dropdown menu
  - Logout functionality
  - Authentication state display
  - Navigation links

- **File**: `src/components/layout/__tests__/AppLayout.test.tsx`
- **Tests**:
  - Layout structure
  - Footer inclusion
  - Content area rendering

#### 4.3 Interactive Components
- **File**: `src/components/ui/__tests__/Modal.test.tsx`
- **Tests**:
  - Modal open/close functionality
  - Escape key handling
  - Backdrop click to close
  - Focus management
  - Body scroll prevention

- **File**: `src/components/ui/__tests__/TabNavigation.test.tsx`
- **Tests**:
  - Tab switching functionality
  - Active tab highlighting
  - Tab content rendering

### 5. Error Handling & Edge Cases (Low Priority)

#### 5.1 Error States
- **File**: `src/components/__tests__/ErrorHandling.test.tsx`
- **Tests**:
  - Network error handling
  - Form validation errors
  - Authentication errors
  - Error modal display
  - Toast notifications

#### 5.2 Loading States
- **File**: `src/components/__tests__/LoadingStates.test.tsx`
- **Tests**:
  - Loading spinners
  - Skeleton screens
  - Button loading states
  - Form submission loading

#### 5.3 Empty States
- **File**: `src/components/__tests__/EmptyStates.test.tsx`
- **Tests**:
  - Empty cart state
  - No products found
  - No orders found
  - Empty list states

### 6. Integration Tests (Low Priority)

#### 6.1 Complete User Journeys
- **File**: `src/__tests__/UserJourneys.test.tsx`
- **Tests**:
  - Complete shopping flow (browse → add to cart → checkout → confirm)
  - Admin product management flow (create → edit → delete)
  - Authentication flow (login → access admin → logout)

#### 6.2 Cross-Component Interactions
- **File**: `src/__tests__/CrossComponent.test.tsx`
- **Tests**:
  - Cart updates across pages
  - Authentication state persistence
  - Theme consistency
  - Navigation state management

## Test Implementation Guidelines

### Test Structure
```typescript
describe('Component/Page Name', () => {
  beforeEach(() => {
    // Setup test data and mocks
  });

  test('should render correctly', () => {
    // Basic rendering test
  });

  test('should handle user interactions', async () => {
    // User interaction tests
  });

  test('should handle error states', () => {
    // Error handling tests
  });
});
```

### MSW Handlers Required
- Authentication endpoints (`/auth/login`, `/auth/refresh`)
- Product CRUD operations (`/products`)
- Category operations (`/categories`)
- Order operations (`/orders`)
- Business details (`/business-details`)
- List operations (`/lists`)
- File upload endpoints

### Test Data Factories
Create reusable test data factories for:
- Products with various states
- Orders with different statuses
- User authentication states
- Business details
- Categories and units

### Accessibility Testing
Include basic accessibility tests:
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Focus management

## Priority Implementation Order

1. **Phase 1**: Customer-facing flows (Welcome, Product, Cart, Order)
2. **Phase 2**: Authentication flows (Login, Protected Routes)
3. **Phase 3**: Admin panel forms (Product, List, Business Details)
4. **Phase 4**: UI components (Input, Button, Modal)
5. **Phase 5**: Error handling and edge cases
6. **Phase 6**: Integration tests and user journeys

## Success Metrics

- **Coverage**: Aim for 80%+ coverage of user-facing code
- **Reliability**: Tests should be stable and not flaky
- **Speed**: Test suite should complete in under 2 minutes
- **Maintenance**: Tests should be easy to update when UI changes

## Notes

- All tests should use MSW for API mocking
- Tests should be deterministic and not depend on external services
- Use `userEvent` for realistic user interactions
- Mock external dependencies (WhatsApp, file uploads)
- Test both happy paths and error scenarios
- Include Romanian text validation where applicable
