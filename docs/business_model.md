# Business Model Documentation

## Overview

This application follows a **unique business model** that differs significantly from traditional e-commerce platforms. Understanding this model is crucial for development decisions and feature implementation.

## Core Business Model

### **List-Based Product Availability**

Unlike traditional online shops where customers can browse and purchase products at any time, this application operates on a **list-based model**:

- **No Continuous Product Browsing**: Customers cannot browse all available products at any time
- **Published Lists Only**: Customers can only see and purchase products from **published lists**
- **Time-Limited Availability**: Products are only available when a list is actively published
- **Single Active List**: Usually only one list is available at a time

### **Customer Experience Flow**

```
Customer visits site
         ↓
Is there a published list?
         ↓
    ┌─────────┐    ┌─────────────┐
    │   NO    │    │     YES     │
    └─────────┘    └─────────────┘
         ↓                ↓
Show "not available"    Show published list
message from business   with products, delivery
settings               options, payment methods
         ↓                ↓
Customer cannot buy      Customer can add items
anything               to cart and place order
```

## Key Business Rules

### **1. List Publishing Controls Everything**

- **No Published List = No Sales**: If no list is published, customers cannot purchase anything
- **Published List = Shopping Interface**: When a list is published, customers see the exact products and options defined in that list
- **List Content is Final**: What's in the published list is exactly what customers can buy

### **2. Product Availability is List-Dependent**

- **Products Not Always Available**: Products may be available in some lists but not others
- **Stock Per List**: Each list can have different stock levels for the same product
- **Time-Based Availability**: Products are only available during the list's active period

### **3. Single List Focus**

- **One List at a Time**: Typically only one list is published and active
- **Clear Customer Experience**: No confusion about which products are available
- **Simplified Decision Making**: Customers don't need to choose between multiple lists

## Technical Implications

### **Customer Interface Design**

- **No Product Catalog**: Traditional product browsing is not needed
- **List-Centric Navigation**: Customer interface focuses on the current published list
- **Simple Cart System**: Only cart functionality needed (no user accounts)
- **Business Message Integration**: Custom messages when no list is available

### **Admin Interface Design**

- **List Management**: Core functionality revolves around creating and managing lists
- **List Preview**: Admins need to see exactly what customers will see
- **Publishing Controls**: Ability to publish/unpublish lists
- **Product Assignment**: Add/remove products from lists with stock levels

### **Data Architecture**

- **List-Product Relationships**: Products are linked to lists with specific stock levels
- **List-Delivery Relationships**: Delivery types are assigned per list
- **Business Settings**: Global settings for when no list is available
- **No User Accounts**: Customer data is minimal (just cart)

## Use Cases

### **Typical Business Scenarios**

1. **Weekly Fresh Produce**
   - Admin creates list for "Week of August 1st"
   - Adds fresh produce with stock levels
   - Publishes list on Monday
   - Customers can order until Sunday
   - Unpublishes list on Sunday night

2. **Special Event Orders**
   - Admin creates list for "Weekend Special"
   - Adds specific products for the event
   - Publishes list for limited time
   - Customers order only during event period

3. **Seasonal Products**
   - Admin creates list for "Holiday Special"
   - Adds seasonal items with limited availability
   - Publishes for holiday period only

### **Customer Journey Examples**

**Scenario 1: No Published List**
```
Customer visits site
→ Sees business message: "Orders closed until Monday"
→ Cannot browse products
→ Cannot add items to cart
→ Can see business contact information
```

**Scenario 2: Published List Available**
```
Customer visits site
→ Sees published list with products
→ Browses products grouped by categories
→ Adds items to cart
→ Sees delivery options and payment methods
→ Places order
```

## Development Guidelines

### **Frontend Development**

- **Customer Interface**: Focus on list display, not product browsing
- **Admin Interface**: Emphasize list management and preview functionality
- **Mobile-First**: Design for mobile customers
- **Business Integration**: Use business settings for messaging

### **Feature Priorities**

1. **List Management**: Core functionality for admins
2. **List Display**: Accurate customer view of published lists
3. **Cart System**: Simple shopping functionality
4. **Business Settings**: Control over customer messaging

### **What NOT to Build**

- **Product Catalog**: Traditional product browsing
- **User Accounts**: Customer registration/login
- **Order History**: Customer order tracking
- **Product Reviews**: Customer feedback system
- **Wishlists**: Customer saved items

## Business Benefits

### **For Business Owners**

- **Inventory Control**: Only show products you actually have
- **Demand Management**: Control when customers can order
- **Simplified Operations**: Focus on one list at a time
- **Flexible Scheduling**: Publish lists when ready

### **For Customers**

- **Clear Availability**: Know exactly what's available
- **No Confusion**: Single list to choose from
- **Fresh Products**: Know products are currently available
- **Simple Experience**: Straightforward ordering process

## Technical Architecture

### **Data Relationships**

```
Business Details (Global Settings)
    ↓
Lists (Time-based Product Collections)
    ↓
List Products (Products with Stock Levels)
    ↓
List Delivery Types (Delivery Options per List)
    ↓
Cart (Customer Shopping Session)
```

### **Key Entities**

- **Business Details**: Global settings and messaging
- **Lists**: Time-based product collections
- **Products**: Available items in the system
- **List Products**: Products assigned to specific lists with stock
- **Delivery Types**: Shipping/pickup options
- **Payment Methods**: Payment options
- **Cart**: Customer shopping session

This business model creates a focused, controlled shopping experience that benefits both business owners and customers by ensuring product availability and simplifying the ordering process. 