#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking ADW and Application Ports...${NC}"
echo ""

# Check main application ports
# 3000: React dev server (Create React App)
# 8000: FastAPI backend server
# 8001: ADW Webhook server
echo -e "${GREEN}Main Application Ports:${NC}"
for port in 3000 8000 8001; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        process=$(ps -p $pid -o comm= 2>/dev/null)
        echo -e "${RED}  Port $port: IN USE (PID: $pid, Process: $process)${NC}"
    else
        echo -e "${GREEN}  Port $port: Available${NC}"
    fi
done

echo ""

# Check isolated ADW backend ports
# Deterministically assigned based on ADW ID (supports 15 concurrent instances)
# Configured in: adws/adw_modules/worktree_ops.py
echo -e "${GREEN}Isolated ADW Backend Ports (9100-9114):${NC}"
in_use_count=0
for port in {9100..9114}; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        process=$(ps -p $pid -o comm= 2>/dev/null)
        echo -e "${RED}  Port $port: IN USE (PID: $pid, Process: $process)${NC}"
        ((in_use_count++))
    fi
done
if [ $in_use_count -eq 0 ]; then
    echo -e "${GREEN}  All backend ports available${NC}"
fi

echo ""

# Check isolated ADW frontend ports
# Deterministically assigned based on ADW ID (supports 15 concurrent instances)
# Configured in: adws/adw_modules/worktree_ops.py
echo -e "${GREEN}Isolated ADW Frontend Ports (9200-9214):${NC}"
in_use_count=0
for port in {9200..9214}; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        process=$(ps -p $pid -o comm= 2>/dev/null)
        echo -e "${RED}  Port $port: IN USE (PID: $pid, Process: $process)${NC}"
        ((in_use_count++))
    fi
done
if [ $in_use_count -eq 0 ]; then
    echo -e "${GREEN}  All frontend ports available${NC}"
fi

echo ""

# Show any active worktrees
# Worktrees are stored in trees/{adw_id}/ directory
# Each worktree has its own isolated environment with dedicated ports
echo -e "${GREEN}Active Git Worktrees:${NC}"
worktree_count=$(git worktree list | grep -c "trees/")
if [ $worktree_count -gt 0 ]; then
    git worktree list | grep "trees/" | while read -r line; do
        echo -e "${YELLOW}  $line${NC}"
    done
else
    echo -e "${GREEN}  No isolated worktrees found${NC}"
fi