#!/bin/bash

# =============================================================================
# Start Backend Server (FastAPI with UV)
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Forex Trading API Server (FastAPI)...${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../app/server"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found!${NC}"
    echo "   Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}   Please edit app/server/.env with your actual credentials!${NC}"
    else
        echo -e "${RED}   ❌ env.example not found. Please create .env manually.${NC}"
        exit 1
    fi
fi

# Check if UV is installed
if command -v uv &> /dev/null; then
    echo -e "${GREEN}Using UV package manager${NC}"
    
    # Sync dependencies
    echo "Syncing dependencies with UV..."
    uv sync --quiet 2>/dev/null || uv pip install -e . --quiet 2>/dev/null
    
    # Start the FastAPI server with UV
    echo -e "${GREEN}✅ Server starting at http://localhost:8000${NC}"
    echo -e "${BLUE}📚 API Docs available at http://localhost:8000/docs${NC}"
    echo ""
    uv run python server.py
else
    echo -e "${YELLOW}UV not found, using pip...${NC}"
    
    # Fallback to venv + pip
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi

    source venv/bin/activate
    pip install -r requirements.txt --quiet 2>/dev/null || pip install -e . --quiet
    
    echo -e "${GREEN}✅ Server starting at http://localhost:8000${NC}"
    echo -e "${BLUE}📚 API Docs available at http://localhost:8000/docs${NC}"
    echo ""
    python server.py
fi
