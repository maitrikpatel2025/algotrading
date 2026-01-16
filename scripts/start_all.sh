#!/bin/bash

# =============================================================================
# Forex Trading App - Start All Services (Server + Client)
# =============================================================================
# This is an alias for start.sh - use start.sh for the full-featured version
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Run the main start script
exec "$SCRIPT_DIR/start.sh"
