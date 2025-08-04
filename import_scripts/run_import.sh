#!/bin/bash

# Product Import Runner Script
# This script makes it easy to run the dockerized product import

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if required files exist
check_files() {
    local missing_files=()
    
    if [[ ! -f "produse_procesate.json" ]]; then
        missing_files+=("produse_procesate.json")
    fi
    
    if [[ ! -f "docker-compose.yml" ]]; then
        missing_files+=("docker-compose.yml")
    fi
    
    if [[ ! -f "Dockerfile" ]]; then
        missing_files+=("Dockerfile")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_error "Missing required files: ${missing_files[*]}"
        exit 1
    fi
    
    print_success "All required files found"
}

# Setup environment file
setup_env() {
    if [[ ! -f ".env" ]]; then
        if [[ -f "env.config" ]]; then
            cp env.config .env
            print_status "Created .env file from env.config"
        else
            print_warning "No .env file found. Using default configuration."
        fi
    fi
}

# Main function
main() {
    echo "=== Product Import Runner ==="
    echo
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_files
    setup_env
    
    # Clean up any existing containers
    print_status "Cleaning up any existing containers..."
    docker compose down --remove-orphans 2>/dev/null || true
    
    echo
    print_status "Starting product import..."
    echo
    
    # Run docker compose
    if docker compose up --build; then
        echo
        print_success "Import completed successfully!"
        print_status "You can check the logs with: docker compose logs product-importer"
    else
        echo
        print_error "Import failed. Check the logs above for details."
        print_status "You can check the logs with: docker compose logs"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "clean")
        print_status "Cleaning up containers and images..."
        docker compose down --volumes --rmi all
        print_success "Cleanup completed"
        ;;
    "logs")
        print_status "Showing logs..."
        docker compose logs -f
        ;;
    "build")
        print_status "Building image only..."
        docker compose build
        print_success "Build completed"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  (no args)  Run the import (default)"
        echo "  clean      Remove all containers and images"
        echo "  logs       Show logs from containers"
        echo "  build      Build image only (don't run)"
        echo "  help       Show this help message"
        echo
        echo "Examples:"
        echo "  $0              # Run import"
        echo "  $0 clean        # Clean up everything"
        echo "  $0 logs         # View logs"
        ;;
    *)
        main
        ;;
esac 