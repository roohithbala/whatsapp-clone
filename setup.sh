#!/bin/bash
# Installation Script - Run this to set up the project

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WhatsApp User Handling Module Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Step 1: Install Backend Dependencies
echo -e "\n${YELLOW}[Step 1/5] Installing Backend Dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi

# Step 2: Check for .env file
echo -e "\n${YELLOW}[Step 2/5] Checking for .env file...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created. Please edit it with your JWT_SECRET${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 3: Check MongoDB
echo -e "\n${YELLOW}[Step 3/5] Checking MongoDB Connection...${NC}"
# Note: This is a simple check, adjust based on your needs
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB is installed${NC}"
    echo -e "${YELLOW}  Make sure MongoDB service is running!${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not found in PATH${NC}"
    echo -e "${YELLOW}  Please ensure MongoDB is running separately${NC}"
fi

# Step 4: Frontend Setup (optional)
echo -e "\n${YELLOW}[Step 4/5] Frontend Setup...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Frontend Dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend node_modules already exists${NC}"
fi

# Step 5: Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Edit backend/.env file with your JWT_SECRET"
echo -e "2. Ensure MongoDB is running (mongod)"
echo -e "3. In backend folder: ${BLUE}npx nodemon server.js${NC}"
echo -e "4. In frontend folder (new terminal): ${BLUE}npm start${NC}"
echo -e "\n${YELLOW}Testing:${NC}"
echo -e "- Register 2 users (Alice and Bob) with different emails"
echo -e "- Test login functionality"
echo -e "- Check MongoDB for user data"
echo -e "\nDocumentation: See IMPLEMENTATION_SUMMARY.md"
echo -e "${BLUE}========================================${NC}"
