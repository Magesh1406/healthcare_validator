#!/bin/bash
# PASTE THIS IN scripts/deploy.sh
# Deploy Healthcare Provider Validator

set -e  # Exit on error

echo "🚀 Starting deployment of Healthcare Provider Validator..."

# Check dependencies
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "📦 Checking dependencies..."
check_dependency docker
check_dependency docker-compose
check_dependency git
check_dependency curl

# Load environment
if [ -f .env.production ]; then
    echo "🔧 Loading production environment..."
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "⚠️  .env.production not found. Using defaults."
fi

# Build and push Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend \
    alembic upgrade head

# Start services
echo "🔄 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check health
echo "🏥 Checking service health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ All services are healthy!"

    # Print deployment info
    echo ""
    echo "🎉 Deployment Successful!"
    echo "========================"
    echo "Frontend URL: https://healthcare-provider-validator.vercel.app"
    echo "Backend API: https://api.healthcare-provider.com"
    echo "API Docs: https://api.healthcare-provider.com/api/docs"
    echo ""
    echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 To stop services: docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Services are not healthy. Status code: $HEALTH_STATUS"
    echo "View logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi