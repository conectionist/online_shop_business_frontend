# Product Import Scripts

This directory contains everything needed to import products from `produse_procesate.json` into your backend API.

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
cd import_scripts
./run_import.sh
```

### Option 2: Manual Docker
```bash
cd import_scripts
docker compose up --build
```

### Option 3: Python (Local)
```bash
cd import_scripts
pip install -r requirements.txt
python import_products.py
```

## 📁 File Structure

```
import_scripts/
├── 🐳 Docker Files
│   ├── Dockerfile              # Python container definition
│   ├── docker-compose.yml      # Multi-service orchestration
│   └── .dockerignore          # Build optimization
│
├── 🐍 Python Files
│   ├── import_products.py      # Main import script
│   └── requirements.txt        # Python dependencies
│
├── 📊 Data Files
│   └── produse_procesate.json # Product data to import
│
├── ⚙️ Configuration
│   ├── env.config             # Environment template
│   └── run_import.sh          # Easy runner script
│
└── 📚 Documentation
    ├── README.md              # This file
    ├── README_docker.md       # Docker-specific docs
    └── README_import.md       # Original Python docs
```

## 🎯 Features

### ✅ **Smart Import Logic**
- **Duplicate Prevention**: Checks existing categories/units before creating
- **ID Mapping**: Uses backend-assigned IDs, ignores JSON IDs
- **Error Recovery**: Can be re-run safely if interrupted
- **Progress Logging**: Timestamped logs for debugging

### ✅ **Docker Integration**
- **Health Check**: Waits for backend to be ready
- **Environment Configurable**: Easy API URL configuration
- **Isolated Network**: Clean container communication
- **Volume Mounting**: Read-only data access

### ✅ **Easy Usage**
- **One-Command Runner**: `./run_import.sh`
- **Multiple Options**: Docker, Docker Compose, or Python
- **Comprehensive Logging**: Clear progress and error messages
- **Cleanup Tools**: Easy container and image management

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:8001/api/v1` | Backend API endpoint |

### Backend URLs

```bash
# Local backend
API_BASE_URL=http://localhost:8001/api/v1

# Docker backend (same network)
API_BASE_URL=http://backend:8001/api/v1

# Remote backend
API_BASE_URL=http://your-server:8001/api/v1
```

## 📊 Expected Results

The script will create:

### Categories (6)
- **Brutarie** - All bread and bakery items
- **Fructe** - Fresh fruits  
- **Deliciosenii de cofetarie** - Pastries and desserts
- **Tartinabile Camara cu di tati** - Spreads from Camara
- **Tartinabile Andreea** - Spreads from Andreea
- **Bere Artizanala Beer House** - Artisanal beer

### Units (5)
- **gr** - Grams
- **buc** - Pieces
- **caserola** - Casserole containers
- **borcanul** - Jars
- **l** - Liters

### Products (27)
All products from `produse_procesate.json` with proper category and unit associations.

## 🛠️ Commands

### Docker Commands
```bash
# Run import
./run_import.sh

# View logs
./run_import.sh logs

# Clean up
./run_import.sh clean

# Build only
./run_import.sh build
```

### Manual Docker
```bash
# Run with compose
docker compose up --build

# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Python (Local)
```bash
# Install dependencies
pip install -r requirements.txt

# Run import
python import_products.py
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not accessible**
   ```bash
   # Check if backend is running
   curl http://localhost:8001/api/v1/categories
   ```

2. **Docker not running**
   ```bash
   # Start Docker service
   sudo systemctl start docker
   ```

3. **Import fails**
   ```bash
   # Check logs
   docker compose logs product-importer
   ```

### Debug Mode
```bash
# Run interactively
docker compose run --rm product-importer python import_products.py

# Check network
docker compose exec product-importer curl $API_BASE_URL/categories
```

## 📝 Notes

- **Idempotent**: Safe to run multiple times
- **Environment Aware**: Uses environment variables for configuration
- **Health Check**: Waits for backend readiness
- **Error Handling**: Graceful error recovery
- **Logging**: Comprehensive progress tracking

## 🔄 Integration

### With Main Project
If your backend is part of a larger Docker setup:

```bash
# Use backend service name
API_BASE_URL=http://backend:8001/api/v1 ./run_import.sh
```

### Standalone
For standalone usage:

```bash
# Use localhost
API_BASE_URL=http://localhost:8001/api/v1 ./run_import.sh
```

---

**Ready to import your products?** Run `./run_import.sh` and watch the magic happen! 🎉 