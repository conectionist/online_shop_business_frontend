#!/usr/bin/env python3
"""
Script to import products from produse_procesate.json into the backend API.
This script will:
1. Create categories (if they don't exist)
2. Create units (if they don't exist)
3. Create products with the given data
"""

import json
import requests
import time
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8001/api/v1")
HEADERS = {
    "Content-Type": "application/x-www-form-urlencoded",
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

class ProductImporter:
    def __init__(self, api_base_url: str):
        self.api_base_url = api_base_url
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        
        # Cache for created entities
        self.categories_cache: Dict[str, int] = {}
        self.units_cache: Dict[str, int] = {}
        
    def log(self, message: str):
        """Print timestamped log message"""
        timestamp = time.strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
    
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
            data = {
                "nume": product.nume,
                "cantitate": product.cantitate,
                "pret": product.pret,
                "unitati_id": product.unitati_id,
                "category_id": product.category_id
            }
            
            if product.description:
                data["description"] = product.description
            
            response = self.session.post(f"{self.api_base_url}/products/", data=data)
            response.raise_for_status()
            created_product = response.json()
            self.log(f"Created product: {product.nume} (ID: {created_product['id']})")
            return True
        except requests.exceptions.RequestException as e:
            self.log(f"Error creating product '{product.nume}': {e}")
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
    
    def import_products(self, json_file_path: str):
        """Main import function"""
        self.log("Starting product import...")
        
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
        
        # Create products
        self.log("Creating products...")
        success_count = 0
        total_count = len(data["products"])
        
        for prod_data in data["products"]:
            # Map category name to ID
            category_name = prod_data["category_name"]
            category_id = categories_map.get(category_name)
            
            # Map unit name to ID
            unit_name = prod_data["unitate"]
            unit_id = units_map.get(unit_name)
            
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
                description=prod_data["description"],
                category_id=category_id,
                unitati_id=unit_id
            )
            
            if self.create_product(product):
                success_count += 1
        
        self.log(f"Import completed! {success_count}/{total_count} products created successfully.")

def main():
    """Main function"""
    print("=== Product Import Script ===")
    print(f"API Base URL: {API_BASE_URL}")
    print()
    
    # Create importer
    importer = ProductImporter(API_BASE_URL)
    
    # Import products
    importer.import_products("produse_procesate.json")
    
    print("\n=== Import Complete ===")

if __name__ == "__main__":
    main() 