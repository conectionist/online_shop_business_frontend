# Online Shop Frontend - Production Deployment

## Quick Start

1. **Download the deployment files:**
   ```bash
   # User downloads these files from your repository
   ```

2. **Deploy with one command:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000

## What's Included

- **docker-compose.yml**: Simple service definition
- **deploy.sh**: Automated deployment script
- **env.example**: Environment configuration (usually empty)

## How It Works

The frontend image is **pre-built** with all environment variables embedded:

- ✅ **No environment setup needed** - Everything is baked in
- ✅ **One image works everywhere** - Dev, staging, production
- ✅ **Simple deployment** - Just pull and run
- ✅ **Secure** - No sensitive data in deployment files

## Customization

If you need different settings, contact the development team to build a new image with your specific configuration.

## Troubleshooting

```bash
# Check logs
docker compose logs frontend

# Restart service
docker compose restart frontend

# Full reset
docker compose down && docker compose up -d
```
