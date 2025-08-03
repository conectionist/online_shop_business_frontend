#!/usr/bin/env python3
"""
Script to import products from produse_procesate.json into the backend API.
This script will:
1. Login to get authentication token
2. Create categories (if they don't exist)
3. Create units (if they don't exist)
4. Create products with the given data
5. Create a list with all imported products
"""

import json
import requests
import time
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001/api/v1")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpass123")
HEADERS = {
    "accept": "application/json"
}

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
        
    def log(self, message: str):
        """Print timestamped log message"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
    
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
    
    def create_category(self, name: str) -> Optional[int]:
        """Create a category and return its ID"""
        try:
            data = {"name": name}
            response = self.session.post(f"{self.api_base_url}/categories/", data=data)
            response.raise_for_status()
            category = response.json()
            self.log(f"Created category: {name} (ID: {category['id']})")
            return category["id"]
        except requests.exceptions.RequestException as e:
            self.log(f"Error creating category '{name}': {e}")
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
            self.log(f"Created unit: {denumire} (ID: {unit['id']})")
            return unit["id"]
        except requests.exceptions.RequestException as e:
            self.log(f"Error creating unit '{denumire}': {e}")
            return None
    
    def create_product(self, product: Product) -> bool:
        """Create a product"""
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
            
            self.log(f"Sending product data: {dict([(k, v[1]) for k, v in files])}")
            self.log(f"Session headers: {dict(self.session.headers)}")
            response = self.session.post(f"{self.api_base_url}/products/", files=files)
            response.raise_for_status()
            created_product = response.json()
            self.log(f"Created product: {product.nume} (ID: {created_product['id']})")
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"Error creating product '{product.nume}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                self.log(f"Response status: {e.response.status_code}")
                self.log(f"Response body: {e.response.text}")
            return False
    
    def ensure_categories_exist(self, categories: List[Category]) -> Dict[str, int]:
        """Ensure all categories exist, create if they don't"""
        self.log("Checking existing categories...")
        existing_categories = self.get_existing_categories()
        
        for category in categories:
            if category.name in existing_categories:
                category.id = existing_categories[category.name]
                self.log(f"Category already exists: {category.name} (ID: {category.id})")
            else:
                category.id = self.create_category(category.name)
                if category.id:
                    existing_categories[category.name] = category.id
        
        return existing_categories
    
    def ensure_units_exist(self, units: List[Unit]) -> Dict[str, int]:
        """Ensure all units exist, create if they don't"""
        self.log("Checking existing units...")
        existing_units = self.get_existing_units()
        
        for unit in units:
            if unit.denumire in existing_units:
                unit.id = existing_units[unit.denumire]
                self.log(f"Unit already exists: {unit.denumire} (ID: {unit.id})")
            else:
                unit.id = self.create_unit(unit.denumire)
                if unit.id:
                    existing_units[unit.denumire] = unit.id
        
        return existing_units
    
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
                # Truncate description to 45 characters
                short_description = list_data.description[:45]
                data["mesaj_introducere"] = short_description
            
            response = self.session.post(f"{self.api_base_url}/liste", json=data)
            response.raise_for_status()
            created_list = response.json()
            self.log(f"Created list: {list_data.nume} (ID: {created_list['id']})")
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
        
        # Extract categories and units from products
        categories = []
        units = []
        products = []
        
        # Process categories
        for cat_data in data["categories"]:
            categories.append(Category(name=cat_data["name"]))
        
        # Process products and extract unique units
        unit_names = set()
        for prod_data in data["products"]:
            unit_names.add(prod_data["unitate"])
        
        for unit_name in unit_names:
            units.append(Unit(denumire=unit_name))
        
        # Ensure categories and units exist
        categories_map = self.ensure_categories_exist(categories)
        units_map = self.ensure_units_exist(units)
        
        # Debug: Log the mappings
        self.log(f"Category mappings: {categories_map}")
        self.log(f"Unit mappings: {units_map}")
        
        # Create products
        self.log("Creating products...")
        success_count = 0
        total_count = len(data["products"])
        created_products = []  # Store created product IDs
        
        for prod_data in data["products"]:
            # Map category name to ID
            category_name = prod_data["category_name"]
            category_id = categories_map.get(category_name)
            
            # Map unit name to ID
            unit_name = prod_data["unitate"]
            unit_id = units_map.get(unit_name)
            
            # Debug: Log the mapping for this product
            self.log(f"Product '{prod_data['nume']}': category '{category_name}' -> ID {category_id}, unit '{unit_name}' -> ID {unit_id}")
            
            if not category_id:
                self.log(f"Warning: Category '{category_name}' not found for product '{prod_data['nume']}'")
                continue
            
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
            
            if self.create_product(product):
                success_count += 1
                # Store the product ID for later use (we'll need to get it from the response)
                # For now, we'll use the original ID from the JSON as a reference
                created_products.append({
                    "original_id": prod_data["id"],
                    "name": prod_data["nume"],
                    "cantitate": prod_data["cantitate"]
                })
        
        self.log(f"Product import completed! {success_count}/{total_count} products created successfully.")
        
        # Create a list with all products
        if created_products:
            self.log("Creating list with all imported products...")
            
            # Create the list
            list_data = ProductList(
                nume="Toate produsele importate",
                description=f"Listă cu toate produsele importate din {json_file_path}. Total: {len(created_products)} produse."
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
                    for product_info in created_products:
                        product_id = products_map.get(product_info["name"])
                        if product_id:
                            if self.add_product_to_list(list_id, product_id, product_info["cantitate"]):
                                added_count += 1
                        else:
                            self.log(f"Warning: Could not find product '{product_info['name']}' in API")
                    
                    self.log(f"List creation completed! {added_count}/{len(created_products)} products added to list.")
                    
                except requests.exceptions.RequestException as e:
                    self.log(f"Error fetching products for list creation: {e}")
            else:
                self.log("Failed to create list.")
        else:
            self.log("No products were created, skipping list creation.")

def main():
    """Main function"""
    print("=== Product Import Script ===")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Admin Username: {ADMIN_USERNAME}")
    print()
    
    # Create importer
    importer = ProductImporter(API_BASE_URL)
    
    # Import products
    importer.import_products("produse_procesate.json")
    
    print("\n=== Import Complete ===")

if __name__ == "__main__":
    main() 