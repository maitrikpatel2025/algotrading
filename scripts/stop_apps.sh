#!/bin/bash

# =============================================================================
# Forex Trading App - Stop All Services
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stopping Forex Trading App services...${NC}"

# Kill any running start.sh processes
echo -e "${GREEN}Killing start.sh processes...${NC}"
pkill -f "start.sh" 2>/dev/null

# Kill start_all.sh processes
echo -e "${GREEN}Killing start_all.sh processes...${NC}"
pkill -f "start_all.sh" 2>/dev/null

# Kill server processes
echo -e "${GREEN}Killing server processes...${NC}"
pkill -f "server.py" 2>/dev/null
pkill -f "app.py" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

# Kill React processes
echo -e "${GREEN}Killing React processes...${NC}"
pkill -f "react-scripts" 2>/dev/null
pkill -f "node.*start" 2>/dev/null

# Kill bot processes
echo -e "${GREEN}Killing bot processes...${NC}"
pkill -f "run.py" 2>/dev/null

# Kill processes on specific ports
echo -e "${GREEN}Killing processes on ports 3000, 5000, and 8000...${NC}"
lsof -ti:3000,5000,8000 2>/dev/null | xargs kill -9 2>/dev/null

echo -e "${GREEN}✓ All services stopped successfully!${NC}"
