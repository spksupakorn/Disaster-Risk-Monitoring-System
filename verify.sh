#!/bin/bash

# Disaster Risk Monitoring System - Verification Script
# This script verifies that the project is set up correctly

echo "🔍 Disaster Risk Monitoring System - Project Verification"
echo "=========================================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version
echo ""

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  Dependencies installed ✓"
else
    echo "  ⚠️  Dependencies not installed. Run: npm install"
fi
echo ""

# Check if TypeScript builds successfully
echo "✓ Checking TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    echo "  TypeScript compilation successful ✓"
else
    echo "  ⚠️  TypeScript compilation failed. Run: npm run build"
fi
echo ""

# Check if dist folder exists
echo "✓ Checking build output..."
if [ -d "dist" ]; then
    echo "  Build output exists ✓"
    echo "  Files in dist/: $(find dist -type f | wc -l)"
else
    echo "  ⚠️  No build output found"
fi
echo ""

# Check Docker
echo "✓ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "  Docker installed ✓"
    docker --version
else
    echo "  ⚠️  Docker not found. Install from: https://www.docker.com/"
fi
echo ""

# Check Docker Compose
echo "✓ Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "  Docker Compose installed ✓"
    docker-compose --version
else
    echo "  ⚠️  Docker Compose not found"
fi
echo ""

# Check environment file
echo "✓ Checking environment configuration..."
if [ -f ".env" ]; then
    echo "  .env file exists ✓"
else
    echo "  ⚠️  .env file not found. Copy from .env.example"
fi
echo ""

# Check project structure
echo "✓ Checking project structure..."
REQUIRED_DIRS=("src/domain" "src/application" "src/infrastructure" "src/presentation")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir"
    else
        echo "  ✗ $dir missing"
    fi
done
echo ""

# Count TypeScript files
TS_FILES=$(find src -name "*.ts" | wc -l)
echo "✓ Project Statistics:"
echo "  TypeScript files: $TS_FILES"
echo "  Test files: $(find src -name "*.test.ts" | wc -l)"
echo ""

# Check critical files
echo "✓ Checking critical files..."
CRITICAL_FILES=("package.json" "tsconfig.json" "Dockerfile" "docker-compose.yml" "README.md")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file missing"
    fi
done
echo ""

echo "=========================================================="
echo "Verification complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Configure .env file with your API keys"
echo "2. Run: docker-compose up -d"
echo "3. Visit: http://localhost:3000/api-docs"
echo "4. Check health: http://localhost:3000/health"
echo ""
echo "For more information, see README.md and QUICKSTART.md"
