#!/bin/bash

# =============================================================================
# Start Frontend Client (React)
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖥️  Starting Forex Trading Dashboard (React)...${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../app/client"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    if [ -f "env.example" ]; then
        cp env.example .env
    else
        echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    fi
    echo -e "${GREEN}✅ Created .env with default settings${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo -e "${GREEN}✅ Client starting at http://localhost:3000${NC}"
echo ""
npm start
