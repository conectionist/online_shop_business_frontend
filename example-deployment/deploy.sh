#!/bin/bash

# Simple deployment script for the frontend
echo "🚀 Deploying Online Shop Frontend..."

# Pull the latest image
echo "📥 Pulling latest image..."
docker compose pull

# Start the services
echo "🔄 Starting services..."
docker compose up -d

# Check status
echo "✅ Checking deployment status..."
docker compose ps

echo "🎉 Deployment complete!"
echo "🌐 Frontend available at: http://localhost:3000"
