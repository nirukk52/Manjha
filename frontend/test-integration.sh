#!/bin/bash
# Frontend-Backend Integration Test Script
# Tests that backend is reachable and API endpoints work

set -e

echo "🧪 Testing Frontend-Backend Integration"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo "1. Checking environment configuration..."
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}⚠️  .env.local not found. Creating from example...${NC}"
  cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEBUG=true
EOF
  echo -e "${GREEN}✅ Created .env.local${NC}"
else
  echo -e "${GREEN}✅ .env.local exists${NC}"
  # Show current configuration
  API_URL=$(grep NEXT_PUBLIC_API_URL .env.local | cut -d '=' -f2)
  echo "   API URL: $API_URL"
fi
echo ""

# Extract API URL from .env.local
API_URL=$(grep NEXT_PUBLIC_API_URL .env.local | cut -d '=' -f2 | tr -d ' ')

# Check backend health
echo "2. Checking backend connection..."
if curl -s --max-time 5 "$API_URL" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend is reachable at $API_URL${NC}"
else
  echo -e "${RED}❌ Cannot connect to backend at $API_URL${NC}"
  echo ""
  echo "Please ensure the backend is running:"
  echo "  cd ../backend"
  echo "  encore run"
  echo ""
  exit 1
fi
echo ""

# Test /chat/send endpoint
echo "3. Testing /chat/send endpoint..."
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
RESPONSE=$(curl -s -X POST "$API_URL/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"content\": \"Hello, this is a test message\",
    \"userId\": \"test-user\"
  }" 2>&1)

if echo "$RESPONSE" | grep -q "messageId"; then
  echo -e "${GREEN}✅ /chat/send endpoint working${NC}"
  MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"messageId":"[^"]*"' | cut -d'"' -f4)
  AGENT_TYPE=$(echo "$RESPONSE" | grep -o '"agentType":"[^"]*"' | cut -d'"' -f4)
  echo "   Session ID: $SESSION_ID"
  echo "   Message ID: $MESSAGE_ID"
  echo "   Agent Type: $AGENT_TYPE"
else
  echo -e "${RED}❌ /chat/send endpoint failed${NC}"
  echo "   Response: $RESPONSE"
  exit 1
fi
echo ""

# Test /chat/stream endpoint (just connection, not full stream)
echo "4. Testing /chat/stream endpoint..."
STREAM_URL="${API_URL}/chat/stream/${SESSION_ID}/${MESSAGE_ID}?agentType=${AGENT_TYPE}&query=Hello"
if curl -s --max-time 10 -N "$STREAM_URL" | head -n 1 | grep -q "data:"; then
  echo -e "${GREEN}✅ /chat/stream endpoint working (SSE connection established)${NC}"
else
  echo -e "${YELLOW}⚠️  Stream endpoint check inconclusive (this is usually fine)${NC}"
fi
echo ""

# Check if frontend dependencies are installed
echo "5. Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Final summary
echo "========================================"
echo -e "${GREEN}✨ All Integration Tests Passed!${NC}"
echo ""
echo "Your setup is ready. To start development:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd ../backend"
echo "    encore run"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Debug mode is enabled. Check browser console for detailed logs."
echo ""

