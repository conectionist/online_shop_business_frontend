# Backend API Requirements - Merchant Identification Information

## 📋 **Overview**

This document outlines the required API extensions for the `BusinessDetails` model to ensure full legal compliance for online commerce in Romania. These fields are **mandatory by law** and must be implemented before the site goes live.

## 🔴 **Critical Fields Required**

### **1. business_name** (String, max 100)
- **Purpose**: Official company name as registered with authorities
- **Legal Requirement**: Mandatory for all online commerce sites
- **Current Status**: ❌ Missing from API
- **Frontend Usage**: Will replace hardcoded `getAppName()` from config
- **Example**: "SC PCMA SRL" or "Paine cu Maia de la Andreea"

### **2. registration_number** (String, max 20)
- **Purpose**: Official registration number at Trade Registry (J/XX/XXXX/XXXX format)
- **Legal Requirement**: Mandatory for all online commerce sites
- **Current Status**: ❌ Missing from API
- **Frontend Usage**: Will be displayed in footer
- **Example**: "J22/1234/2020" or "J40/1234/2020"

### **3. CUI** (String, max 16)
- **Purpose**: Fiscal identification code (ROXXXXXXXXX format)
- **Legal Requirement**: Mandatory for all online commerce sites
- **Current Status**: ❌ Missing from API
- **Frontend Usage**: Will be displayed in footer
- **Example**: "RO12345678" or "RO87654321"

### **4. email** (String, max 100)
- **Purpose**: Official business email address
- **Legal Requirement**: Mandatory for consumer contact
- **Current Status**: ❌ Missing from API
- **Frontend Usage**: Will be displayed in footer and contact page
- **Example**: "contact@pcma.ro" or "office@pcma.ro"

### **5. operating_hours** (String, max 150)
- **Purpose**: Free-text business operating hours (displayed as-is)
- **Legal Requirement**: Mandatory for transparency
- **Current Status**: ❌ Missing from API
- **Frontend Usage**: Will be displayed in footer
- **Examples**:
  - "Luni - Vineri: 8:00 - 18:00; Sâmbătă: 8:00 - 14:00; Duminică: Închis"
  - "L-V 9-17 / S 10-14 / D închis"

### **6. representative** (String, max 100)
- **Purpose**: Legal representative name and position
- **Legal Requirement**: Required for compliance
- **Current Status**: ❌ Missing from API
- **Priority**: 🟡 High (not critical)
- **Frontend Usage**: Will be displayed in footer
- **Example**: "Andreea Popescu - Administrator" or "Ion Ionescu - Director General"

## 🎯 **Implementation Details**

### **API Endpoint**
- **Model**: `BusinessDetails`
- **Endpoint**: `/api/v1/business-details/`
- **Method**: GET (existing)

### **Database Changes**
- Add new columns to `business_details` table:
  - `business_name` VARCHAR(100)
  - `registration_number` VARCHAR(20)
  - `CUI` VARCHAR(16)
  - `email` VARCHAR(100)
  - `operating_hours` VARCHAR(150)
  - `representative` VARCHAR(100)

### **Data Validation**
- `business_name`: Required, max 100 characters
- `registration_number`: Required, regex ^[JF][0-9]{2}/[0-9]{1,6}/[0-9]{4}$ (e.g., J22/1234/2020)
- `CUI`: Required, regex ^(RO)?[0-9]{2,10}$ (optional RO prefix)
- `email`: Required, valid email format, max 100 characters
- `operating_hours`: Required, free-text, max 150 characters
- `representative`: Optional, max 100 characters

### **Migration Strategy**
1. Add new columns with NULL constraint initially
2. Update existing records with placeholder data
3. Make fields required after data population
4. Update API documentation

## 📅 **Timeline**

- **Priority**: 🔴 CRITICAL - Must be implemented before site launch
- **Estimated Effort**: 1-2 days for backend implementation
- **Testing Required**: API endpoint testing, data validation, frontend integration

## 🔗 **Related Frontend Changes**

After backend implementation, frontend will:
1. Update `businessInfo.ts` utility functions
2. Display all new fields in footer
3. Update contact page with new information
4. Remove hardcoded values from config

## 📚 **Legal References**

- **OUG 34/2014**: Consumer rights protection
- **ANPC Requirements**: Merchant identification obligations
- **GDPR Compliance**: Contact information transparency

## ❓ **Questions for Backend Team**

1. Do you need additional field specifications?
2. Are there any database constraints we should consider?
3. Should we implement field validation on backend or frontend?
4. Do you need sample data for testing?

---

**Contact**: Frontend Team  
**Priority**: 🔴 CRITICAL - Legal Compliance Requirement  
**Deadline**: Before site launch
