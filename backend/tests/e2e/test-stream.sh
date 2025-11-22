#!/bin/bash
# Quick test script for SSE streaming endpoint
# 
# Usage Options:
#   1. Full flow (recommended): ./test-stream.sh
#   2. Direct stream: ./test-stream.sh <sessionId> <messageId> <agentType> <query>
#
# For full flow, it will:
#   1. Call /chat/send to create a message
#   2. Use the returned streamUrl to stream the response

if [ $# -eq 0 ]; then
  # Full flow: Call /chat/send first, then stream
  echo "🚀 Full E2E Flow (Send → Stream)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  SESSION_ID=$(uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || echo "550e8400-e29b-41d4-a716-446655440000")
  QUERY="What is portfolio diversification?"
  
  echo "📤 Step 1: Creating message..."
  SEND_RESPONSE=$(curl -s -X POST "http://localhost:4000/chat/send" \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\": \"${SESSION_ID}\", \"content\": \"${QUERY}\", \"userId\": \"test-user\"}")
  
  MESSAGE_ID=$(echo "$SEND_RESPONSE" | jq -r '.messageId' 2>/dev/null)
  STREAM_URL=$(echo "$SEND_RESPONSE" | jq -r '.streamUrl' 2>/dev/null)
  
  if [ -z "$MESSAGE_ID" ] || [ "$MESSAGE_ID" == "null" ]; then
    echo "❌ Failed: $SEND_RESPONSE"
    exit 1
  fi
  
  echo "✅ Message ID: ${MESSAGE_ID}"
  echo ""
  echo "📥 Step 2: Streaming response..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  URL="http://localhost:4000${STREAM_URL}"
else
  # Direct stream with provided params
  SESSION_ID="${1}"
  MESSAGE_ID="${2}"
  AGENT_TYPE="${3:-FINANCE}"
  QUERY="${4:-What%20is%20portfolio%20diversification%3F}"
  
  URL="http://localhost:4000/chat/stream/${SESSION_ID}/${MESSAGE_ID}?agentType=${AGENT_TYPE}&query=${QUERY}"
  
  echo "🔍 Testing SSE Stream Endpoint (Direct)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "URL: ${URL}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""

# Stream with formatting
if command -v jq &> /dev/null; then
  curl -N -s "${URL}" | while IFS= read -r line; do
    if [[ $line == data:* ]]; then
      json="${line#data: }"
      type=$(echo "$json" | jq -r '.type' 2>/dev/null)
      content=$(echo "$json" | jq -r '.content // ""' 2>/dev/null)
      error=$(echo "$json" | jq -r '.error.message // ""' 2>/dev/null)
      
      case "$type" in
        DELTA)
          echo -n "$content"
          ;;
        COMPLETE)
          echo ""
          echo "✅ Stream completed"
          ;;
        ERROR)
          echo ""
          echo "❌ Error: $error"
          ;;
      esac
    fi
  done
else
  # Fallback without jq
  curl -N "${URL}"
fi

echo ""
