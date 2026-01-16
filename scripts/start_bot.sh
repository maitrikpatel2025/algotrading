#!/bin/bash

# =============================================================================
# Start Trading Bot
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Starting Forex Trading Bot...${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../app/bot"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found!${NC}"
    echo "   Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}   Please edit app/bot/.env with your actual credentials!${NC}"
    else
        # Try to copy from server
        if [ -f "../server/.env" ]; then
            cp ../server/.env .env
            echo -e "${GREEN}   Copied .env from server${NC}"
        else
            echo -e "${RED}   ❌ env.example not found. Please create .env manually.${NC}"
            exit 1
        fi
    fi
fi

# Check if data/instruments.json exists
if [ ! -f "./data/instruments.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: data/instruments.json not found!${NC}"
    echo "   The bot requires instrument data to run."
    echo "   Please ensure instruments.json exists in app/bot/data/"
fi

# Check if UV is available or use server's venv
if [ -d "../server/.venv" ]; then
    echo -e "${GREEN}Using server's UV virtual environment${NC}"
    # Add server to PYTHONPATH for shared modules
    export PYTHONPATH="$SCRIPT_DIR/../app/server:$PYTHONPATH"
    # Activate the server's .venv and run from bot directory
    source ../server/.venv/bin/activate
    python run.py
elif [ -d "../server/venv" ]; then
    echo -e "${GREEN}Using server's virtual environment${NC}"
    source ../server/venv/bin/activate
    
    # Install bot-specific dependencies if needed
    pip install -r requirements.txt --quiet 2>/dev/null
    
    # Run the bot
    python run.py
else
    echo -e "${RED}❌ No Python environment found!${NC}"
    echo "   Please run start_server.sh first to create the environment."
    exit 1
fi
