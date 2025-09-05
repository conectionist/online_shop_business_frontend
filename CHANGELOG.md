# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 2.8.0 - 2025-09-05
### Added
- Optional phone number field for customer orders
- Phone number validation with backend-consistent regex pattern
- Phone number display in order confirmations and admin interface

## 2.6.0 - 2025-09-03
### Added
- Footer component with legal links (ANPC, SOL), legal routes, and business info display.
- Utility `src/utils/businessInfo.ts` to centralize business data sourcing from `business_details` and config with TODO placeholders.

### Changed
- Integrated footer across public pages (`WelcomePage`, `CartPage`, `OrderForm`, `OrderConfirmation`, `ProductPage`, `LoginPage`).
- Updated legal compliance checklist with priorities and progress.


## [2.5.1] - 2025-09-02

### Added
- **Dynamic Sitemap Generation**: Sitemap now generated at runtime with configurable base URL
  - New `VITE_SITE_URL` environment variable for configurable site base URL
  - Sitemap automatically generated in docker-entrypoint.sh using environment configuration
  - Automatic lastmod date updates on each container restart
  - Absolute URLs generated from environment variable (sitemap protocol compliant)
  - No more static sitemap files - always fresh and environment-aware

### Technical
- **Docker Entrypoint Enhancement**: Sitemap generation moved to container startup
- **Environment Configuration**: Added `VITE_SITE_URL` to docker-compose.yml and env.example
- **Build Process**: Removed static sitemap copy from Dockerfile

## [2.5.0] - 2025-09-02

### Added
- Optional delivery tax support across the app:
  - Admin can set `Taxă livrare (RON)` in Business Details
  - Delivery tax displayed in Business Details list
  - Delivery tax applied and shown in Order Form totals when home delivery is selected
  - Delivery tax reflected in Order Confirmation and WhatsApp text
  - Note on Cart page indicating delivery tax may apply

### Technical
- Added `delivery_tax?: number` to Business Details types
- Introduced `getDeliveryTax` helper to centralize tax application logic

## [1.3.0] - 2025-09-01

### Added
- **Enhanced Orders PDF Printing**: Improved PDF generation and web display for order lists
  - Orders now display in chronological order (oldest first) for better workflow
  - Cleaner PDF output with simplified formatting for kitchen/fulfillment use
  - Removed redundant information from PDF while keeping essential order details
  - PDF title now shows "Lista Comenzi <date>" for better identification

### Changed
- **Orders Display Order**: Web interface now shows orders sorted by creation date
  - Consistent ordering between web display and PDF output
  - Better workflow for staff processing orders chronologically
- **PDF Format Simplification**: Streamlined PDF output for practical use
  - Removed command titles and list metadata for cleaner appearance
  - Eliminated duplicate total information
  - Kept essential order details (items, payment, delivery methods)

### Technical
- **Order Sorting**: Implemented chronological sorting for both web and PDF views
- **PDF Generation**: Enhanced PDF output with cleaner, more focused content
- **Code Organization**: Separated web display and PDF formatting logic for maintainability

## [Unreleased]

### Changed
- **Image Upload Limits**: Updated image upload constraints to match backend capabilities
  - Increased product image upload limit from 5MB to 25MB
  - Added consistent image validation for categories (25MB limit, JPG/PNG/WebP formats)
  - Implemented proper error handling and user feedback for category image uploads
  - Added visual feedback for validation errors in category image upload area

## [0.20.0] - 2025-08-30

### Added
- **List Delivery Type Assignment**: Admins can now specify which delivery methods are available for each list
  - Delivery type selection interface in list creation and editing forms
  - Visual checkbox-style selection with clear visual feedback
  - Automatic assignment of selected delivery types to lists after creation
  - Preview shows selected delivery methods for each list
  - Form validation ensures at least one delivery type is selected
  - Import script automatically assigns all available delivery types to imported lists

### Changed
- **List Creation Workflow**: Enhanced list creation process with delivery method configuration
  - Lists now require delivery type selection before they can be created
  - Delivery types are assigned immediately after list creation
  - Existing lists can be updated with new delivery type selections
  - Preview section shows selected delivery methods instead of all system delivery types

### Technical
- **Delivery Type Management**: Enhanced list-delivery type relationship
  - `useListDeliveryTypes` hook for fetching list-specific delivery types
  - `useReplaceListDeliveryTypes` hook for bulk delivery type assignment
  - Automatic delivery type assignment in both create and update operations
  - Import script integration for bulk delivery type assignment

## [0.19.0] - 2025-08-17

### Added
- **List Cloning Feature**: Admins can now clone existing product lists with a single click
  - Clone button added to each list in the admin interface
  - Automatically copies all list metadata, products, categories, and stock quantities
  - New cloned lists start as drafts for easy customization
  - Seamless navigation to the new cloned list for editing

## [0.18.0] - 2025-08-16

### Added
- **Complete Authentication System**: Enterprise-grade JWT-based authentication
  - Secure login/logout functionality with token management
  - Automatic token refresh with seamless user experience
  - Route protection for admin areas with authentication guards
  - API endpoint security for all protected operations
  - Beautiful loading states and user feedback throughout
  - Romanian language support for all authentication messages
  - User avatar and personalized greetings in admin interface
  - Comprehensive error handling with clear Romanian messages
  - Session management with proper cleanup on logout

### Security
- **JWT Token Authentication**: Secure token-based authentication system
  - Access tokens with automatic refresh mechanism
  - Refresh tokens for seamless session management
  - Token validation and expiration handling
  - Secure storage in localStorage with proper cleanup
  - Automatic logout on authentication failures

### User Experience
- **Enhanced Admin Interface**: Improved user experience for administrators
  - Smooth animations and transitions throughout the application
  - Loading spinners and success indicators for all operations
  - Form validation with real-time feedback
  - Disabled states during operations to prevent double-submission
  - Visual feedback for all authentication states (loading, success, error)

### Technical
- **Authentication Service**: Centralized authentication management
  - `authService.ts` with login, logout, and token refresh methods
  - `ProtectedRoute` component for route-level security
  - Enhanced `authStore` with token management capabilities
  - API client interceptors for automatic token attachment
  - Comprehensive test coverage with 50+ authentication scenarios

### API Integration
- **Protected Endpoints**: All mutable operations now require authentication
  - Categories: Create, update, delete operations protected
  - Products: Create, update, delete operations protected
  - Units: Create, update, delete operations protected
  - Delivery Types: Create, update, delete operations protected
  - Delivery Schedules: Create, update, delete operations protected
  - Payment Methods: Create, update, delete operations protected
  - Business Details: Create, update, delete operations protected
  - Lists: Create, update, delete operations protected
  - Read operations remain public for customer access

## [0.17.0] - 2025-08-01

### Added
- **Product Detail Pages**: Click on any product to view its full details
  - Larger product images with gallery view for multiple photos
  - Complete product information and description
  - Add products to cart directly from detail pages

### Fixed
- **Customer Order Flow**: Fixed routing issues in cart and order pages
  - Fixed cart page links to use correct routes (`/order-form` instead of `/customer/order-form`)
  - Fixed order form navigation to use correct confirmation route (`/order-confirmation`)
  - Fixed all customer dashboard links to use home page (`/`) instead of non-existent `/customer/dashboard`
  - Resolved issue where "Finalizează comanda" was redirecting to main page instead of checkout

## [0.16.0] - 2025-08-01

### Added
- **Customer Area Migration**: Streamlined user experience by integrating customer interface into home page
  - Migrated customer dashboard content to home page (WelcomePage)
  - Removed separate customer area routing and layout
  - Simplified navigation structure with direct access to published lists
  - Updated cart and order routes to root level (`/cart`, `/order-form`, `/order-confirmation`)

### Changed
- **Home Page**: Transformed from development setup page to customer-facing interface
  - Now shows published list or "not available" message directly
  - Includes all product display, cart functionality, and business information
  - Maintains exact same functionality as previous customer dashboard

### Technical
- **Routing Simplification**: Removed `/customer` routes and CustomerLayout
- **Import Cleanup**: Removed unused CustomerLayout and CustomerDashboard imports
- **URL Structure**: Simplified cart and order URLs for better user experience
- **Navigation Flow**: Streamlined customer journey from home page to order completion

## [0.15.0] - 2025-08-01

### Added
- **Order Placement System**: Complete order management for unique business model
  - Order form with customer information collection (name, surname)
  - Payment method selection with validation
  - Delivery type selection with dynamic address field for home delivery
  - Real-time order summary with cart items and totals
  - Form validation with user-friendly Romanian error messages
  - Order confirmation page with formatted order display
  - Copy to clipboard functionality for order text
  - Direct WhatsApp sharing integration
  - Success feedback and clear user instructions

### Technical
- **Cart Integration**: Seamless flow from cart to order placement
- **Session Storage**: Order data persistence during the order flow
- **Route Protection**: Automatic redirects for invalid order states
- **Mobile-First Design**: Responsive order forms and confirmation pages
- **TypeScript**: Full type safety for order data structures

## [0.14.0] - 2025-08-01

### Added
- **Customer Layout**: Complete customer-facing interface foundation
  - Customer header with business branding and responsive navigation
  - Customer footer with business information and contact details
  - Customer routing structure for essential pages (dashboard, cart)

## [0.13.1] - 2025-07-31

### Changed
- **UI/UX Improvements**: Enhanced list management interface
  - Fixed icon consistency: Delivery schedules now use clock icon (matches admin dashboard)
  - Removed redundant "Produse în Listă" heading from list preview
  - Enhanced category titles with prominent styling and center alignment
  - Improved delete button design: icon-only with even spacing
  - Cleaned up debug console logs from image loading functionality
  - Better button spacing in lists overview for consistent layout

## [0.13.0] - 2025-07-31

### Added
- **List Products Management**: Complete product management within lists
  - Dedicated page for managing products within specific lists
  - Product search and category filtering functionality
  - Add products to lists with stock level management
  - Remove products from lists with confirmation
  - Product statistics cards showing total products and categories
  - Real-time product display in list preview with images
  - Mobile-first product grouping by categories
  - Product image thumbnails with fallback icons

### Changed
- **List Preview Enhancement**: Improved product display in list forms
  - Products now grouped by categories for better organization
  - One product per line for mobile-first design
  - Product images with proper thumbnail display
  - Enhanced visual hierarchy with category headers
  - Improved loading states and empty states

## [0.12.0] - 2025-07-31

### Added
- **Lists Management**: Complete CRUD functionality for product lists
  - Lists overview page with search functionality
  - Create and edit list forms with live preview
  - Delete lists with confirmation modal
  - List status management (published/unpublished)

### Changed
- **Payment Methods API**: Updated to new backend structure
  - Changed from `denumire` to `name` and `description` fields
  - Updated forms to include both internal name and display description
  - Updated display logic to show appropriate fields in different contexts
  - Improved validation with separate rules for name (20 chars) and description (100 chars)

## [0.11.0] - 2025-07-30

### Added
- **Business Details Management**: Complete CRUD functionality for business details
  - Business details list page with search functionality
  - Create and edit business details forms with validation
  - Delete business details with confirmation modal

## [0.10.0] - 2025-07-30

### Added
- **Payment Methods Management**: Complete CRUD functionality for payment methods
  - Payment methods list page with search functionality
  - Create and edit payment method forms with validation
  - Delete payment methods with confirmation modal

## [0.9.0] - 2025-07-30

### Added
- **Delivery Types Management**: Complete CRUD functionality for delivery types
  - Delivery types list page with search functionality
  - Create and edit delivery type forms with validation
  - Delete delivery types with confirmation modal
  - Updated admin dashboard with clickable delivery types card

## [0.8.0] - 2025-07-30

### Added
- **Delivery Schedules Management**: Complete CRUD functionality for delivery schedules
  - Delivery schedules list page with search functionality
  - Create and edit delivery schedule forms with multi-line textarea support
  - Delete delivery schedules with confirmation modal

## [0.7.0] - 2025-07-30

### Added
- **Romanian Localization**: Complete translation of the application to Romanian
  - All user interface text translated to Romanian

## [0.6.0] - 2025-07-30

### Added
- **Dashboard Reorganization**: Complete restructure of admin dashboard
  - Organized into two main sections: Content and Settings
  - Content section: Categories, Products, Lists (coming soon)
  - Settings section: Business Details, Payment Methods, Delivery Methods, Delivery Schedules, Units, Operations (coming soon)
  - Visual distinction between implemented and upcoming features
  - Clickable cards for implemented features, non-clickable with "Coming soon" labels for upcoming features
  - Color-coded icons for easy navigation

## [0.5.0] - 2025-07-30

### Added
- **Units Management**: Complete units management system
  - Create, edit, and delete measurement units (kg, l, buc, pachet, etc.)
  - Units list with search functionality
  - Form validation and error handling
  - Integration with product forms (dropdown selection instead of ID input)
  - Navigation card in admin dashboard

## [0.4.0] - 2025-07-30

### Added
- **Enhanced Form Validation**: Comprehensive validation system for product forms
  - Real-time validation feedback as users type
  - Enhanced error styling with visual indicators and icons
  - Image validation (file size, type, format restrictions)
  - Character counters and limits for text fields
  - Success indicators for valid fields

## [0.3.0] - 2025-07-30

### Added
- **Advanced Product Management**: Enhanced product list with advanced features
  - Pagination support with customizable page sizes (5, 10, 20, 50 per page)
  - Client-side search functionality for product names and descriptions
  - Category filtering with server-side integration

## [0.2.0] - 2025-07-29

### Added
- **Product Image Upload**: You can now add images to your products
  - Upload images when creating or editing products
  - Images are displayed in the products list
  - Support for common image formats (JPG, PNG, WebP, etc.)
  - Image preview and remove functionality

## [0.1.1] - 2025-07-28

### Added
- **Product-Category Integration**: Products now work with categories
  - Select categories when creating or editing products
  - Filter products by category
  - Category names are displayed in the products list

## [0.1.0] - 2025-07-28

### Added
- **Product Management**: Complete product management system
  - Create, edit, and delete products
  - Search and filter products
  - Product forms with validation

- **Category Management**: Complete category management system
  - Create, edit, and delete categories
  - Upload images for categories
  - Search and filter categories

- **Admin Dashboard**: Foundation for the online shop admin interface
  - Modern, responsive design
  - Navigation between different sections
  - Error handling and user feedback 