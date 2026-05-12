#!/bin/bash

# Nigris SaaS Platform - Unified Management Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Nigris SaaS Platform...${NC}"

# Start Server
echo -e "${GREEN}1. Launching Backend Server (localhost:8000)...${NC}"
cd server
npm run dev &
SERVER_PID=$!

# Start Client
echo -e "\n${GREEN}2. Launching Frontend Client (localhost:3000)...${NC}"
cd ../client
npm run dev &
CLIENT_PID=$!

echo -e "\n${BLUE}Nigris is now running!${NC}"
echo -e "Backend: http://localhost:8000"
echo -e "Frontend: http://localhost:3000"
echo -e "\nPress Ctrl+C to stop both services."

# Wait for Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; echo -e '\n${BLUE}Services stopped.${NC}'; exit" INT
wait
