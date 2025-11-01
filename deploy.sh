#!/bin/bash

# Stop on any error
set -e

echo "🚀 Starting deployment of Engineering Enterprise Motors Quote System..."

# Pull latest images
echo "� Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p postgres-data

# Start the application
echo "🚀 Starting the application..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"

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