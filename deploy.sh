#!/bin/bash

# Stop on any error
set -e

echo "🚀 Starting deployment of Engineering Enterprise Motors Quote System..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

# Load Docker images
echo "📦 Loading Docker images..."
docker load -i ./images/frontend.tar
docker load -i ./images/backend.tar
docker load -i ./images/postgres.tar

# Copy environment file
echo "📄 Setting up environment variables..."
cp .env.production .env

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p postgres-data

# Start the application
echo "🚀 Starting the application..."
docker-compose up -d

# Wait for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
docker-compose exec backend npm run prisma:migrate

echo "✅ Deployment complete! The application should be available at:"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:4000"
echo ""
echo "To view the logs, run: docker-compose logs -f"
echo "To stop the application, run: docker-compose down"