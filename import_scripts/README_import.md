# Product Import Script

This script imports products from `produse_procesate.json` into your backend API.

## Prerequisites

1. **Python 3.7+** installed
2. **Backend API** running and accessible
3. **Admin credentials** configured (username/password)
4. **Dependencies** installed

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Before running the script, make sure to:

1. **Update the API URL** in `import_products.py`:
   ```python
   API_BASE_URL = "http://localhost:8001/api/v1"  # Change this to your backend URL
   ```

2. **Configure admin credentials** (default: admin/adminpass123):
   ```python
   ADMIN_USERNAME = "admin"  # Change to your admin username
   ADMIN_PASSWORD = "adminpass123"  # Change to your admin password
   ```

3. **Ensure your backend is running** and accessible at the configured URL

4. **Verify the JSON file** `produse_procesate.json` exists in the same directory

## Usage

Run the import script:

```bash
python import_products.py
```

## What the script does

1. **Logs in** to get authentication token
2. **Reads** `produse_procesate.json`
3. **Checks existing categories** and creates new ones if needed
4. **Checks existing units** and creates new ones if needed  
5. **Creates products** with proper category and unit associations
6. **Creates a list** with all imported products
7. **Logs progress** with timestamps

## Expected Output

```
=== Product Import Script ===
API Base URL: http://localhost:8001/api/v1
Admin Username: admin

[14:30:15] Starting product import...
[14:30:15] Logging in to get authentication token...
[14:30:15] Login successful!
[14:30:15] Checking existing categories...
[14:30:16] Created category: Brutarie (ID: 1)
[14:30:16] Created category: Fructe (ID: 2)
[14:30:16] Created category: Deliciosenii de cofetarie (ID: 3)
[14:30:16] Created category: Tartinabile Camara cu di tati (ID: 4)
[14:30:16] Created category: Tartinabile Andreea (ID: 5)
[14:30:16] Created category: Bere Artizanala Beer House (ID: 6)
[14:30:16] Checking existing units...
[14:30:17] Created unit: gr (ID: 1)
[14:30:17] Created unit: buc (ID: 2)
[14:30:17] Created unit: caserola (ID: 3)
[14:30:17] Created unit: borcanul (ID: 4)
[14:30:17] Created unit: l (ID: 5)
[14:30:17] Creating products...
[14:30:18] Created product: Pâine cu secara (ID: 1)
[14:30:18] Created product: Pâine cu faina integrala grâu (ID: 2)
...
[14:30:25] Product import completed! 27/27 products created successfully.
[14:30:25] Creating list with all imported products...
[14:30:25] Created list: Toate produsele importate (ID: 1)
[14:30:26] Added product 1 to list 1 with quantity 600
[14:30:26] Added product 2 to list 1 with quantity 500
...
[14:30:28] List creation completed! 27/27 products added to list.

=== Import Complete ===
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your backend API is running
2. **Authentication Error**: Check that admin credentials are correct and API authentication is working
3. **JSON Parse Error**: Check that `produse_procesate.json` is valid JSON
4. **Duplicate Categories/Units**: The script handles duplicates gracefully by checking existing entities first

### Error Messages

- `Error logging in`: Authentication failed (check credentials)
- `Error fetching categories`: API endpoint not accessible
- `Error creating category`: Category creation failed (check API logs)
- `Warning: Category 'X' not found`: Category mapping issue
- `Error creating product`: Product creation failed (check required fields)

## Data Structure

The script expects `produse_procesate.json` to have this structure:

```json
{
  "products": [
    {
      "nume": "Product Name",
      "description": "Optional description",
      "pret": 12.50,
      "unitate": "gr",
      "cantitate": 500,
      "category_name": "Category Name"
    }
  ],
  "categories": [
    {
      "name": "Category Name"
    }
  ]
}
```

## Notes

- **ID Handling**: The script ignores the `id` fields in the JSON file since the backend assigns its own IDs
- **Error Recovery**: If the script fails partway through, you can run it again - it will skip existing categories/units
- **Logging**: All operations are logged with timestamps for debugging 