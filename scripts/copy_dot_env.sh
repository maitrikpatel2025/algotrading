#!/bin/bash

# =============================================================================
# Copy Environment Files
# =============================================================================
# Copies env.example files to .env files for all components
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "Setting up environment files..."

# Server .env
if [ -f "$PROJECT_ROOT/app/server/env.example" ]; then
    if [ ! -f "$PROJECT_ROOT/app/server/.env" ]; then
        cp "$PROJECT_ROOT/app/server/env.example" "$PROJECT_ROOT/app/server/.env"
        echo -e "${GREEN}✅ Created app/server/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  app/server/.env already exists, skipping${NC}"
    fi
else
    echo -e "${RED}❌ app/server/env.example not found${NC}"
fi

# Client .env
if [ -f "$PROJECT_ROOT/app/client/env.example" ]; then
    if [ ! -f "$PROJECT_ROOT/app/client/.env" ]; then
        cp "$PROJECT_ROOT/app/client/env.example" "$PROJECT_ROOT/app/client/.env"
        echo -e "${GREEN}✅ Created app/client/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  app/client/.env already exists, skipping${NC}"
    fi
else
    # Create default client .env
    if [ ! -f "$PROJECT_ROOT/app/client/.env" ]; then
        echo "REACT_APP_API_URL=http://localhost:5000/api" > "$PROJECT_ROOT/app/client/.env"
        echo -e "${GREEN}✅ Created app/client/.env with defaults${NC}"
    fi
fi

# Bot .env
if [ -f "$PROJECT_ROOT/app/bot/env.example" ]; then
    if [ ! -f "$PROJECT_ROOT/app/bot/.env" ]; then
        cp "$PROJECT_ROOT/app/bot/env.example" "$PROJECT_ROOT/app/bot/.env"
        echo -e "${GREEN}✅ Created app/bot/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  app/bot/.env already exists, skipping${NC}"
    fi
else
    echo -e "${RED}❌ app/bot/env.example not found${NC}"
fi

echo ""
echo -e "${GREEN}Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit app/server/.env with your OpenFX API credentials"
echo "  2. Edit app/bot/.env (or copy from server/.env)"
echo "  3. Run ./scripts/start.sh to start the application"
