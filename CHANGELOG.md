# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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