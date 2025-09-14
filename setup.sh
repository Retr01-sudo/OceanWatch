#!/bin/bash

# OceanGuard MVP Setup Script
echo "🌊 Setting up OceanGuard MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd packages/backend-api
npm install
cd ../..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd packages/web-app
npm install
cd ../..

# Create environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f packages/backend-api/.env ]; then
    cp packages/backend-api/env.example packages/backend-api/.env
    echo "📝 Created .env file. Please edit packages/backend-api/.env with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Database setup instructions
echo ""
echo "🗄️ Database Setup Required:"
echo "1. Create PostgreSQL database:"
echo "   createdb oceanguard"
echo ""
echo "2. Enable PostGIS extension:"
echo "   psql oceanguard -c \"CREATE EXTENSION IF NOT EXISTS postgis;\""
echo ""
echo "3. Update database credentials in packages/backend-api/.env"
echo ""
echo "4. Initialize database with sample data:"
echo "   cd packages/backend-api && npm run init-db && cd ../.."
echo ""

echo "🚀 Setup complete! To start the application:"
echo "   npm run dev"
echo ""
echo "This will start:"
echo "   - Backend API on http://localhost:3001"
echo "   - Frontend app on http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "   Citizen: citizen@oceanguard.com / password"
echo "   Official: admin@oceanguard.com / password"

