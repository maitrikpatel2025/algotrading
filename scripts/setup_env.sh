#!/bin/bash

# =============================================================================
# Environment Setup Script
# =============================================================================
# Creates .env files for all components from templates
# =============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🔧 FOREX TRADING APP - ENV SETUP                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../app" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================================================
# Setup Server .env
# =============================================================================
echo "📦 Setting up Server environment..."
if [ -f "$APP_DIR/server/.env" ]; then
    echo -e "${YELLOW}⚠️  Server .env already exists, skipping...${NC}"
else
    if [ -f "$APP_DIR/server/env.example" ]; then
        cp "$APP_DIR/server/env.example" "$APP_DIR/server/.env"
        echo -e "${GREEN}✅ Created app/server/.env${NC}"
        echo -e "${YELLOW}   Please edit this file with your actual API credentials!${NC}"
    else
        echo -e "${RED}❌ Server env.example not found!${NC}"
    fi
fi

# =============================================================================
# Setup Client .env
# =============================================================================
echo ""
echo "🖥️  Setting up Client environment..."
if [ -f "$APP_DIR/client/.env" ]; then
    echo -e "${YELLOW}⚠️  Client .env already exists, skipping...${NC}"
else
    if [ -f "$APP_DIR/client/env.example" ]; then
        cp "$APP_DIR/client/env.example" "$APP_DIR/client/.env"
        echo -e "${GREEN}✅ Created app/client/.env${NC}"
    else
        # Create minimal client .env
        echo "REACT_APP_API_URL=http://localhost:5000/api" > "$APP_DIR/client/.env"
        echo -e "${GREEN}✅ Created app/client/.env with default API URL${NC}"
    fi
fi

# =============================================================================
# Setup Bot .env
# =============================================================================
echo ""
echo "🤖 Setting up Bot environment..."
if [ -f "$APP_DIR/bot/.env" ]; then
    echo -e "${YELLOW}⚠️  Bot .env already exists, skipping...${NC}"
else
    if [ -f "$APP_DIR/bot/env.example" ]; then
        cp "$APP_DIR/bot/env.example" "$APP_DIR/bot/.env"
        echo -e "${GREEN}✅ Created app/bot/.env${NC}"
        echo -e "${YELLOW}   Please edit this file with your actual API credentials!${NC}"
    else
        echo -e "${RED}❌ Bot env.example not found!${NC}"
    fi
fi

# =============================================================================
# Create Bot data directory if needed
# =============================================================================
echo ""
echo "📂 Checking Bot data directory..."
if [ ! -d "$APP_DIR/bot/data" ]; then
    mkdir -p "$APP_DIR/bot/data"
    echo -e "${GREEN}✅ Created app/bot/data directory${NC}"
else
    echo -e "${YELLOW}⚠️  Bot data directory already exists${NC}"
fi

if [ ! -f "$APP_DIR/bot/data/instruments.json" ]; then
    echo -e "${RED}❌ instruments.json not found in bot/data!${NC}"
    echo -e "${YELLOW}   Please ensure instruments.json exists for the bot to work.${NC}"
else
    echo -e "${GREEN}✅ instruments.json found${NC}"
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           ✅ ENVIRONMENT SETUP COMPLETE                      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║  IMPORTANT: Edit these files with your actual credentials:   ║"
echo "║                                                               ║"
echo "║  1. app/server/.env - OpenFX API & Supabase credentials      ║"
echo "║  2. app/bot/.env    - Same as server (can copy server's)     ║"
echo "║  3. app/client/.env - API URL (usually fine as default)      ║"
echo "║                                                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
