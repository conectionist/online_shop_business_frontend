# Dockerized Product Import Script

This directory contains a dockerized version of the product import script that can import products from `produse_procesate.json` into your backend API.

## 📁 File Structure

```
import_scripts/
├── Dockerfile                 # Docker image definition
├── docker-compose.yml         # Docker Compose configuration
├── import_products.py         # Main import script
├── produse_procesate.json    # Product data to import
├── requirements.txt           # Python dependencies
├── env.config                # Environment configuration
├── README_import.md          # Original documentation
└── README_docker.md          # This file
```

## 🐳 Quick Start

### Prerequisites

1. **Docker** and **Docker Compose** installed
2. **Backend API** running and accessible
3. **Admin credentials** configured
4. **Product data** in `produse_procesate.json`

### 1. Configure Environment

Copy the environment configuration:
```bash
cp env.config .env
```

Edit `.env` to match your backend URL and admin credentials:
```bash
# API Configuration
API_BASE_URL=http://localhost:8001/api/v1

# Authentication Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpass123
```

### 2. Run the Import

```bash
# Build and run with Docker Compose
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

### 3. Check Results

```bash
# View logs
docker compose logs product-importer

# Follow logs in real-time
docker compose logs -f product-importer
```

## 🔧 Advanced Usage

### Environment Variables

You can override the default configuration:

```bash
# Set API URL via environment variable
API_BASE_URL=http://my-backend:8001/api/v1 docker compose up

# Or export for the session
export API_BASE_URL=http://my-backend:8001/api/v1
docker compose up
```

### Docker Commands

```bash
# Build only (without running)
docker compose build

# Run without rebuilding
docker compose up

# Run in detached mode
docker compose up -d

# Stop containers
docker compose down

# Remove containers and images
docker compose down --rmi all

# View logs
docker compose logs

# Execute commands in container
docker compose exec product-importer python import_products.py
```

### Health Check

The setup includes a health check service that waits for the backend API to be ready before starting the import:

```bash
# Check health check logs
docker compose logs backend-health-check
```

## 🏗️ Architecture

### Services

1. **backend-health-check**: 
   - Uses `curlimages/curl` to check if backend is ready
   - Waits for `/categories` endpoint to respond
   - Ensures import doesn't start before backend is ready

2. **product-importer**:
   - Python script container
   - Imports categories, units, and products
   - Uses environment variables for configuration

### Network

- **import-network**: Isolated bridge network for communication
- Services can communicate with external backend via host networking

### Volumes

- **produse_procesate.json**: Read-only mount of product data
- Environment variables: Configurable API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **Backend not accessible**:
   ```bash
   # Check if backend is running
   curl http://localhost:8001/api/v1/categories
   
   # Check health check logs
   docker compose logs backend-health-check
   ```

2. **Import fails**:
   ```bash
   # Check import logs
   docker compose logs product-importer
   
   # Run manually for debugging
   docker compose exec product-importer python import_products.py
   ```

3. **Network issues**:
   ```bash
   # Check network connectivity
   docker compose exec product-importer curl $API_BASE_URL/categories
   ```

### Debug Mode

Run with verbose logging:
```bash
# Set debug environment
DEBUG=1 docker compose up

# Or run interactively
docker compose run --rm product-importer python import_products.py
```

### Cleanup

```bash
# Remove everything
docker compose down --volumes --rmi all

# Remove only containers
docker compose down
```

## 📊 Expected Output

```
backend-health-check    | Waiting for backend API to be ready...
backend-health-check    | Backend not ready, waiting...
backend-health-check    | Backend is ready!
product-importer       | === Product Import Script ===
product-importer       | API Base URL: http://localhost:8001/api/v1
product-importer       | 
product-importer       | [14:30:15] Starting product import...
product-importer       | [14:30:15] Checking existing categories...
product-importer       | [14:30:16] Created category: Brutarie (ID: 1)
product-importer       | [14:30:16] Created category: Fructe (ID: 2)
product-importer       | [14:30:16] Created category: Deliciosenii de cofetarie (ID: 3)
product-importer       | [14:30:16] Created category: Tartinabile Camara cu di tati (ID: 4)
product-importer       | [14:30:16] Created category: Tartinabile Andreea (ID: 5)
product-importer       | [14:30:16] Created category: Bere Artizanala Beer House (ID: 6)
product-importer       | [14:30:16] Checking existing units...
product-importer       | [14:30:17] Created unit: gr (ID: 1)
product-importer       | [14:30:17] Created unit: buc (ID: 2)
product-importer       | [14:30:17] Created unit: caserola (ID: 3)
product-importer       | [14:30:17] Created unit: borcanul (ID: 4)
product-importer       | [14:30:17] Created unit: l (ID: 5)
product-importer       | [14:30:17] Creating products...
product-importer       | [14:30:18] Created product: Pâine cu secara (ID: 1)
product-importer       | [14:30:18] Created product: Pâine cu faina integrala grâu (ID: 2)
product-importer       | ...
product-importer       | [14:30:25] Import completed! 27/27 products created successfully.
product-importer       | 
product-importer       | === Import Complete ===
```

## 🔄 Integration with Main Project

### With Frontend Development

If your backend is running in the main project's Docker setup:

```bash
# From the main project directory
cd import_scripts

# Use the backend service name
API_BASE_URL=http://backend:8001/api/v1 docker compose up
```

### Standalone Usage

For standalone usage with a local backend:

```bash
cd import_scripts
API_BASE_URL=http://localhost:8001/api/v1 docker compose up
```

## 📝 Notes

- **Idempotent**: Can be run multiple times safely
- **Health Check**: Waits for backend to be ready
- **Environment Configurable**: Easy to adapt to different setups
- **Logging**: Comprehensive logging for debugging
- **Error Handling**: Graceful error recovery 