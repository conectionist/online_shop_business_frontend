#!/usr/bin/env python3
"""
Script to import products from produse_procesate.json into the backend API.
This script will:
1. Login to get authentication token
2. Get all existing categories, units, and products from the server
3. Create only categories that don't already exist (extracted from products)
4. Create only units that don't already exist
5. Create only products that don't already exist
6. Update existing products that have different information in the JSON
7. Log detailed information about what was created, updated, or skipped
"""

import json
import requests
import time
import os
import sys
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001/api/v1")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpass123")
HEADERS = {
    "accept": "application/json"
}

# Add process ID to logs to identify duplicate runs
PROCESS_ID = os.getpid()

@dataclass
class Category:
    name: str
    id: Optional[int] = None

@dataclass
class Unit:
    denumire: str
    id: Optional[int] = None

@dataclass
class Product:
    nume: str
    cantitate: int
    pret: float
    description: Optional[str]
    category_id: int
    unitati_id: int

@dataclass
class ProductList:
    nume: str
    description: Optional[str] = None
    id: Optional[int] = None

class ProductImporter:
    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.access_token = None
        
        # Cache for created entities
        self.categories_cache: Dict[str, int] = {}
        self.units_cache: Dict[str, int] = {}
        self.products_cache: Dict[str, Dict] = {}
        
        # Statistics tracking
        self.stats = {
            'categories': {'created': 0, 'updated': 0, 'skipped': 0},
            'units': {'created': 0, 'updated': 0, 'skipped': 0},
            'products': {'created': 0, 'updated': 0, 'skipped': 0}
        }
        
    def log(self, message: str):
        """Print timestamped log message with process ID"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] [PID:{PROCESS_ID}] {message}")
    
    def login(self) -> bool:
        """Login to get access token"""
        try:
            self.log("Logging in to get authentication token...")
            login_data = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = self.session.post(
                f"{self.api_base_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            login_response = response.json()
            self.access_token = login_response["access_token"]
            
            # Update session headers with authorization
            self.session.headers.update({
                "Authorization": f"Bearer {self.access_token}"
            })
            
            self.log("Login successful!")
            return True
            
        except requests.exceptions.RequestException as e:
            self.log(f"Error logging in: {e}")
            return False
    
    def get_existing_categories(self) -> Dict[str, int]:
        """Get existing categories from the API"""
        try:
            response = self.session.get(f"{self.api_base_url}/categories/")
            response.raise_for_status()
            categories = response.json()
            
            # Create a mapping of category name to ID
            return {cat["name"]: cat["id"] for cat in categories}
        except requests.exceptions.RequestException as e:
            self.log(f"Error fetching categories: {e}")
            return {}
    
    def get_existing_units(self) -> Dict[str, int]:
        """Get existing units from the API"""
        try:
            response = self.session.get(f"{self.api_base_url}/unitati")
            response.raise_for_status()
            units = response.json()
            
            # Create a mapping of unit denumire to ID
            return {unit["denumire"]: unit["id"] for unit in units}
        except requests.exceptions.RequestException as e:
            self.log(f"Error fetching units: {e}")
            return {}
    
    def get_existing_products(self) -> Dict[str, Dict]:
        """Get existing products from the API"""
        try:
            response = self.session.get(f"{self.api_base_url}/products/")
            response.raise_for_status()
            products = response.json()
            
            # Create a mapping of product name to product data (case-insensitive)
            products_map = {}
            for prod in products:
                product_name = prod["nume"]
                # Store with original case
                products_map[product_name] = prod
                # Store with lowercase for case-insensitive comparison
                products_map[product_name.lower()] = prod
                # Store with normalized lowercase (remove diacritics) for better matching
                normalized_name = self.normalize_string(product_name.lower())
                products_map[normalized_name] = prod
            
            self.log(f"Fetched {len(products)} existing products from API")
            
            # Debug: log all product names to help identify the issue
            if len(products) > 0:
                all_names = [prod["nume"] for prod in products]
                self.log(f"All existing product names: {all_names}")
            
            return products_map
        except requests.exceptions.RequestException as e:
            self.log(f"Error fetching products: {e}")
            return {}
    
    def normalize_string(self, text: str) -> str:
        """Normalize string by removing diacritics and converting to lowercase"""
        import unicodedata
        # Normalize unicode characters and remove diacritics
        normalized = unicodedata.normalize('NFD', text)
        # Remove diacritics (combining characters)
        normalized = ''.join(c for c in normalized if not unicodedata.combining(c))
        return normalized.lower()
    
    def product_exists(self, product_name: str, existing_products: Dict[str, Dict]) -> Tuple[bool, Optional[Dict]]:
        """Check if a product exists (case-insensitive) and return the product data if found"""
        # Try exact match first
        if product_name in existing_products:
            return True, existing_products[product_name]
        
        # Try case-insensitive match
        product_name_lower = product_name.lower()
        if product_name_lower in existing_products:
            return True, existing_products[product_name_lower]
        
        # Try normalized match (remove diacritics)
        normalized_name = self.normalize_string(product_name)
        if normalized_name in existing_products:
            return True, existing_products[normalized_name]
        
        # Debug: log some sample existing product names to help debug
        if len(existing_products) > 0:
            # Get original product names (not the normalized keys)
            original_names = []
            for key, product in existing_products.items():
                if key == product["nume"]:  # Only add original names, not the normalized ones
                    original_names.append(key)
            
            sample_names = original_names[:10]  # Show more names
            self.log(f"  Debug: Looking for '{product_name}' (normalized: '{normalized_name}')")
            self.log(f"  Debug: Sample existing product names: {sample_names}")
        
        return False, None
    
    def get_product_by_name(self, product_name: str) -> Optional[Dict]:
        """Get a product by name from the API (useful for fallback after 409 errors)"""
        try:
            # Try to get all products and find the one we need
            response = self.session.get(f"{self.api_base_url}/products/")
            response.raise_for_status()
            products = response.json()
            
            # Search for the product (case-insensitive and normalized)
            product_name_lower = product_name.lower()
            product_name_normalized = self.normalize_string(product_name)
            
            for product in products:
                existing_name = product["nume"]
                if (existing_name.lower() == product_name_lower or 
                    self.normalize_string(existing_name) == product_name_normalized):
                    return product
            
            return None
        except requests.exceptions.RequestException as e:
            self.log(f"Error fetching product '{product_name}': {e}")
            return None
    
    def verify_product_update(self, product_id: int, expected_product: Product):
        """Verify that a product update was successful by fetching the product and comparing"""
        try:
            response = self.session.get(f"{self.api_base_url}/products/{product_id}")
            response.raise_for_status()
            actual_product = response.json()
            
            self.log(f"  Verification - Expected vs Actual:")
            self.log(f"    cantitate: {expected_product.cantitate} vs {actual_product.get('cantitate')}")
            self.log(f"    pret: {expected_product.pret} vs {actual_product.get('pret')}")
            self.log(f"    unitati_id: {expected_product.unitati_id} vs {actual_product.get('unitati_id')}")
            self.log(f"    category_id: {expected_product.category_id} vs {actual_product.get('category_id')}")
            self.log(f"    description: '{expected_product.description}' vs '{actual_product.get('description')}'")
            
            # Check if all fields match
            all_match = (
                actual_product.get('cantitate') == expected_product.cantitate and
                actual_product.get('pret') == expected_product.pret and
                actual_product.get('unitati_id') == expected_product.unitati_id and
                actual_product.get('category_id') == expected_product.category_id and
                actual_product.get('description') == expected_product.description
            )
            
            if all_match:
                self.log(f"  ✅ Verification successful - all fields match")
            else:
                self.log(f"  ⚠️  Verification failed - some fields don't match")
                
        except requests.exceptions.RequestException as e:
            self.log(f"  ❌ Error verifying product update: {e}")
    
    def create_category(self, name: str) -> Optional[int]:
        """Create a category and return its ID"""
        try:
            data = {"name": name}
            response = self.session.post(f"{self.api_base_url}/categories/", data=data)
            response.raise_for_status()
            category = response.json()
            self.log(f"✅ CREATED category: {name} (ID: {category['id']})")
            self.stats['categories']['created'] += 1
            return category["id"]
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Error creating category '{name}': {e}")
            return None
    
    def create_unit(self, denumire: str) -> Optional[int]:
        """Create a unit and return its ID"""
        try:
            data = {"denumire": denumire}
            response = self.session.post(f"{self.api_base_url}/unitati", json=data, headers={
                'Content-Type': 'application/json',
            })
            response.raise_for_status()
            unit = response.json()
            self.log(f"✅ CREATED unit: {denumire} (ID: {unit['id']})")
            self.stats['units']['created'] += 1
            return unit["id"]
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Error creating unit '{denumire}': {e}")
            return None
    
    def create_product(self, product: Product) -> Optional[int]:
        """Create a product and return its ID"""
        try:
            # Create form data as tuples (field_name, (None, value, content_type))
            files = [
                ("nume", (None, str(product.nume), "text/plain")),
                ("cantitate", (None, str(product.cantitate), "text/plain")),
                ("pret", (None, str(product.pret), "text/plain")),
                ("unitati_id", (None, str(product.unitati_id), "text/plain")),
                ("category_id", (None, str(product.category_id), "text/plain"))
            ]
            
            if product.description:
                files.append(("description", (None, product.description, "text/plain")))
            
            response = self.session.post(f"{self.api_base_url}/products/", files=files)
            response.raise_for_status()
            created_product = response.json()
            self.log(f"✅ CREATED product: {product.nume} (ID: {created_product['id']})")
            self.stats['products']['created'] += 1
            return created_product['id']
        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 409:
                # Product already exists - this is a fallback for when the initial fetch missed it
                self.log(f"⚠️  Product '{product.nume}' already exists (409 conflict) - fetching existing product")
                self.stats['products']['skipped'] += 1
                
                # Try to get the existing product
                existing_product = self.get_product_by_name(product.nume)
                if existing_product:
                    self.log(f"✅ Found existing product '{product.nume}' (ID: {existing_product['id']})")
                    return existing_product['id']
                else:
                    self.log(f"⚠️  Could not find existing product '{product.nume}' after 409 error")
                    return None
            else:
                self.log(f"❌ Error creating product '{product.nume}': {e}")
                if hasattr(e, 'response') and e.response is not None:
                    self.log(f"Response status: {e.response.status_code}")
                    self.log(f"Response body: {e.response.text}")
                return None
    
    def update_product(self, product_id: int, product: Product) -> bool:
        """Update a product via PATCH using FormData (like the frontend)"""
        try:
            # Build the form data (like the frontend does)
            form_data = {}
            form_data['cantitate'] = str(product.cantitate)
            form_data['pret'] = str(product.pret)
            form_data['unitati_id'] = str(product.unitati_id)
            form_data['category_id'] = str(product.category_id)
            
            # Handle description field - if it's None, send empty string to clear it
            if product.description is not None:
                form_data['description'] = product.description
            else:
                # If description is None, send empty string to clear the existing description
                form_data['description'] = ''
            
            # Log what we're sending
            self.log(f"  Sending PATCH FormData: {form_data}")
            
            # Send PATCH request with FormData (not JSON)
            response = self.session.patch(f"{self.api_base_url}/products/{product_id}", data=form_data)
            response.raise_for_status()
            
            # Log what the API returned
            updated_product = response.json()
            self.log(f"  API returned: {updated_product}")
            
            # Verify the update by fetching the product again
            self.verify_product_update(product_id, product)
            
            self.log(f"🔄 UPDATED product: {product.nume} (ID: {product_id})")
            self.stats['products']['updated'] += 1
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"❌ Error updating product '{product.nume}' (ID: {product_id}): {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.log(f"Response status: {e.response.status_code}")
                self.log(f"Response body: {e.response.text}")
            return False
    
    def products_are_equal(self, existing_product: Dict, new_product: Product) -> bool:
        """Compare existing product with new product data"""
        # Handle description comparison - treat None and empty string as equal
        existing_desc = existing_product.get("description") or ""
        new_desc = new_product.description or ""
        
        return (
            existing_product["cantitate"] == new_product.cantitate and
            existing_product["pret"] == new_product.pret and
            existing_product["unitati_id"] == new_product.unitati_id and
            existing_product["category_id"] == new_product.category_id and
            existing_desc == new_desc
        )
    
    def show_product_differences(self, existing_product: Dict, new_product: Product, categories_map: Dict[str, int] = None, units_map: Dict[str, int] = None):
        """Show detailed differences between existing and new product data"""
        differences = []
        
        if existing_product["cantitate"] != new_product.cantitate:
            differences.append(f"cantitate: {existing_product['cantitate']} → {new_product.cantitate}")
        
        if existing_product["pret"] != new_product.pret:
            differences.append(f"pret: {existing_product['pret']} → {new_product.pret}")
        
        if existing_product["unitati_id"] != new_product.unitati_id:
            # Try to show unit names if available
            unit_diff = f"unitati_id: {existing_product['unitati_id']} → {new_product.unitati_id}"
            if units_map:
                # Find unit names by ID
                old_unit_name = "unknown"
                new_unit_name = "unknown"
                for unit_name, unit_id in units_map.items():
                    if unit_id == existing_product["unitati_id"]:
                        old_unit_name = unit_name
                    if unit_id == new_product.unitati_id:
                        new_unit_name = unit_name
                unit_diff += f" ({old_unit_name} → {new_unit_name})"
            differences.append(unit_diff)
        
        if existing_product["category_id"] != new_product.category_id:
            # Try to show category names if available
            cat_diff = f"category_id: {existing_product['category_id']} → {new_product.category_id}"
            if categories_map:
                # Find category names by ID
                old_cat_name = "unknown"
                new_cat_name = "unknown"
                for cat_name, cat_id in categories_map.items():
                    if cat_id == existing_product["category_id"]:
                        old_cat_name = cat_name
                    if cat_id == new_product.category_id:
                        new_cat_name = cat_name
                cat_diff += f" ({old_cat_name} → {new_cat_name})"
            differences.append(cat_diff)
        
        existing_desc = existing_product.get("description")
        if existing_desc != new_product.description:
            differences.append(f"description: '{existing_desc}' → '{new_product.description}'")
        
        if differences:
            self.log(f"  Changes detected:")
            for diff in differences:
                self.log(f"    {diff}")
        else:
            self.log(f"  No differences found (this shouldn't happen)")
    
    def extract_categories_from_products(self, products_data: List[Dict]) -> List[Category]:
        """Extract unique categories from products data"""
        category_names = set()
        for product in products_data:
            # Handle both current structure (category_name) and future structure (category)
            category_name = product.get("category") or product.get("category_name")
            if category_name:
                category_names.add(category_name)
        
        return [Category(name=name) for name in category_names]
    
    def process_categories(self, categories: List[Category]) -> Dict[str, int]:
        """Process categories: create only those that don't exist"""
        self.log("=== Processing Categories ===")
        existing_categories = self.get_existing_categories()
        
        for category in categories:
            if category.name in existing_categories:
                category.id = existing_categories[category.name]
                self.log(f"⏭️  SKIPPED category: {category.name} (ID: {category.id}) - already exists")
                self.stats['categories']['skipped'] += 1
            else:
                category.id = self.create_category(category.name)
                if category.id:
                    existing_categories[category.name] = category.id
        
        return existing_categories
    
    def process_units(self, units: List[Unit]) -> Dict[str, int]:
        """Process units: create only those that don't exist"""
        self.log("=== Processing Units ===")
        existing_units = self.get_existing_units()
        
        for unit in units:
            if unit.denumire in existing_units:
                unit.id = existing_units[unit.denumire]
                self.log(f"⏭️  SKIPPED unit: {unit.denumire} (ID: {unit.id}) - already exists")
                self.stats['units']['skipped'] += 1
            else:
                unit.id = self.create_unit(unit.denumire)
                if unit.id:
                    existing_units[unit.denumire] = unit.id
        
        return existing_units
    
    def process_products(self, products: List[Product], categories_map: Dict[str, int] = None, units_map: Dict[str, int] = None) -> List[Dict]:
        """Process products: create new ones, update existing ones, skip unchanged ones"""
        self.log("=== Processing Products ===")
        self.log(f"Processing {len(products)} products from JSON file")
        existing_products = self.get_existing_products()
        processed_products = []
        
        for i, product in enumerate(products, 1):
            self.log(f"Processing {i}/{len(products)}: {product.nume}")
            
            # Check if product exists (case-insensitive)
            exists, existing_product_data = self.product_exists(product.nume, existing_products)
            
            if exists:
                # Check if the product data is different
                if self.products_are_equal(existing_product_data, product):
                    self.log(f"⏭️  Product '{product.nume}' already exists. No updates needed.")
                    self.stats['products']['skipped'] += 1
                    processed_products.append({
                        "id": existing_product_data["id"],
                        "name": product.nume,
                        "cantitate": product.cantitate
                    })
                else:
                    self.log(f"🔄  Product '{product.nume}' exists but has different data. Updating...")
                    # Show what's different
                    self.show_product_differences(existing_product_data, product, categories_map, units_map)
                    
                    # Update the product
                    if self.update_product(existing_product_data["id"], product):
                        processed_products.append({
                            "id": existing_product_data["id"],
                            "name": product.nume,
                            "cantitate": product.cantitate
                        })
            else:
                self.log(f"✅  Creating new product '{product.nume}'...")
                # Create new product
                product_id = self.create_product(product)
                if product_id:
                    processed_products.append({
                        "id": product_id,
                        "name": product.nume,
                        "cantitate": product.cantitate
                    })
                else:
                    self.log(f"⚠️  Failed to create product '{product.nume}' - will be skipped")
        
        self.log(f"Product processing complete. Processed {len(processed_products)} products successfully.")
        return processed_products
    
    def get_existing_delivery_types(self) -> Dict[str, int]:
        """Get existing delivery types from the API"""
        try:
            response = self.session.get(f"{self.api_base_url}/tipuri-livrare")
            response.raise_for_status()
            delivery_types = response.json()
            
            # Create a mapping of delivery type name to ID
            return {dt["denumire"]: dt["id"] for dt in delivery_types}
        except requests.exceptions.RequestException as e:
            self.log(f"Error fetching delivery types: {e}")
            return {}

    def assign_delivery_types_to_list(self, list_id: int, delivery_type_ids: List[int]) -> bool:
        """Assign delivery types to a list"""
        try:
            # Use the replace endpoint to assign all delivery types at once
            response = self.session.put(
                f"{self.api_base_url}/liste/{list_id}/delivery-types",
                json=delivery_type_ids
            )
            response.raise_for_status()
            self.log(f"Successfully assigned {len(delivery_type_ids)} delivery types to list {list_id}")
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"Error assigning delivery types to list {list_id}: {e}")
            return False

    def create_list(self, list_data: ProductList) -> Optional[int]:
        """Create a list and return its ID"""
        try:
            from datetime import datetime
            
            data = {
                "data": datetime.now().strftime("%Y-%m-%d"),  # Required field - use current date
                "is_current": True,       # Required field - make this the current list
                "orare_livrari_id": 1     # Required field - use default delivery schedule ID
            }
            
            if list_data.description:
                # Truncate description to 100 characters
                short_description = list_data.description[:100]
                data["mesaj_introducere"] = short_description
            
            response = self.session.post(f"{self.api_base_url}/liste", json=data)
            response.raise_for_status()
            created_list = response.json()
            self.log(f"Created list: {list_data.nume} (ID: {created_list['id']})")
            
            # Assign all available delivery types to the list
            delivery_types = self.get_existing_delivery_types()
            if delivery_types:
                delivery_type_ids = list(delivery_types.values())
                if self.assign_delivery_types_to_list(created_list['id'], delivery_type_ids):
                    self.log(f"Assigned {len(delivery_type_ids)} delivery types to list {created_list['id']}")
                else:
                    self.log(f"Warning: Failed to assign delivery types to list {created_list['id']}")
            else:
                self.log(f"Warning: No delivery types found to assign to list {created_list['id']}")
            
            return created_list["id"]
        except requests.exceptions.RequestException as e:
            self.log(f"Error creating list '{list_data.nume}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.log(f"Response status: {e.response.status_code}")
                self.log(f"Response body: {e.response.text}")
            return None
    
    def add_product_to_list(self, list_id: int, product_id: int, cantitate: int = 1) -> bool:
        """Add a product to a list"""
        try:
            data = {
                "stoc_produs": cantitate
            }
            
            response = self.session.post(f"{self.api_base_url}/liste/{list_id}/products/{product_id}", json=data)
            response.raise_for_status()
            self.log(f"Added product {product_id} to list {list_id} with quantity {cantitate}")
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"Error adding product {product_id} to list {list_id}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.log(f"Response status: {e.response.status_code}")
                self.log(f"Response body: {e.response.text}")
            return False
    
    def print_summary(self):
        """Print summary of all operations"""
        self.log("=== IMPORT SUMMARY ===")
        
        for entity_type, stats in self.stats.items():
            self.log(f"{entity_type.title()}:")
            self.log(f"  ✅ Created: {stats['created']}")
            self.log(f"  🔄 Updated: {stats['updated']}")
            self.log(f"  ⏭️  Skipped: {stats['skipped']}")
            self.log(f"  📊 Total processed: {stats['created'] + stats['updated'] + stats['skipped']}")
            self.log("")
    
    def import_products(self, json_file_path: str):
        """Main import function"""
        self.log("Starting product import...")
        
        # Login first
        if not self.login():
            self.log("Failed to login. Cannot proceed with import.")
            return
        
        # Load JSON data
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.log(f"Error: File {json_file_path} not found")
            return
        except json.JSONDecodeError as e:
            self.log(f"Error: Invalid JSON in {json_file_path}: {e}")
            return
        
        # Extract categories from products (no longer from separate categories array)
        categories = self.extract_categories_from_products(data["products"])
        
        # Extract unique units from products
        units = []
        unit_names = set()
        for prod_data in data["products"]:
            unit_names.add(prod_data["unitate"])
        
        for unit_name in unit_names:
            units.append(Unit(denumire=unit_name))
        
        # Process categories and units
        categories_map = self.process_categories(categories)
        units_map = self.process_units(units)
        
        # Process products
        product_objects = []
        for prod_data in data["products"]:
            # Get category name (handle both current and future structure)
            category_name = prod_data.get("category") or prod_data.get("category_name")
            if not category_name:
                self.log(f"Warning: No category found for product '{prod_data['nume']}'")
                continue
            
            # Map category name to ID
            category_id = categories_map.get(category_name)
            if not category_id:
                self.log(f"Warning: Category '{category_name}' not found for product '{prod_data['nume']}'")
                continue
            
            # Map unit name to ID
            unit_name = prod_data["unitate"]
            unit_id = units_map.get(unit_name)
            if not unit_id:
                self.log(f"Warning: Unit '{unit_name}' not found for product '{prod_data['nume']}'")
                continue
            
            product = Product(
                nume=prod_data["nume"],
                cantitate=prod_data["cantitate"],
                pret=prod_data["pret"],
                description=prod_data["description"] if prod_data["description"] else None,
                category_id=category_id,
                unitati_id=unit_id
            )
            product_objects.append(product)
        
        # Process all products
        processed_products = self.process_products(product_objects, categories_map, units_map)
        
        # Print summary
        self.print_summary()
        
        # Create a list with all products
        if processed_products:
            self.log("Creating list with all processed products...")
            
            # Get introduction message from JSON if available
            introduction_message = data.get("mesaj_introducere", f"Listă cu toate produsele procesate din {json_file_path}. Total: {len(processed_products)} produse.")
            
            # Create the list
            list_data = ProductList(
                nume="Toate produsele importate",
                description=introduction_message
            )
            
            list_id = self.create_list(list_data)
            
            if list_id:
                # Get all products to map them to the list
                try:
                    response = self.session.get(f"{self.api_base_url}/products/")
                    response.raise_for_status()
                    all_products = response.json()
                    
                    # Create a mapping of product name to ID
                    products_map = {prod["nume"]: prod["id"] for prod in all_products}
                    
                    # Add products to the list
                    added_count = 0
                    for product_info in processed_products:
                        product_id = product_info.get("id") or products_map.get(product_info["name"])
                        if product_id:
                            if self.add_product_to_list(list_id, product_id, product_info["cantitate"]):
                                added_count += 1
                        else:
                            self.log(f"Warning: Could not find product '{product_info['name']}' in API")
                    
                    self.log(f"List creation completed! {added_count}/{len(processed_products)} products added to list.")
                    
                except requests.exceptions.RequestException as e:
                    self.log(f"Error fetching products for list creation: {e}")
            else:
                self.log("Failed to create list.")
        else:
            self.log("No products were processed, skipping list creation.")

def main():
    """Main function"""
    print(f"=== Product Import Script (PID: {PROCESS_ID}) ===")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Admin Username: {ADMIN_USERNAME}")
    print()
    
    # Create importer
    importer = ProductImporter(API_BASE_URL)
    
    # Import products
    importer.import_products("produse_procesate.json")
    
    print(f"\n=== Import Complete (PID: {PROCESS_ID}) ===")

if __name__ == "__main__":
    main() 