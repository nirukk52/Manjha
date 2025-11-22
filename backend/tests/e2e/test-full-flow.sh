#!/bin/bash
# Complete E2E test: Send message → Stream response
# Usage: ./test-full-flow.sh [sessionId] [query]

SESSION_ID="${1:-$(uuidgen)}"
QUERY="${2:-What is portfolio diversification?}"
ENCODED_QUERY=$(echo -n "$QUERY" | jq -sRr @uri 2>/dev/null || python3 -c "import urllib.parse; print(urllib.parse.quote('$QUERY'))" 2>/dev/null || echo "$QUERY")

echo "🚀 Complete E2E Test Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Session ID: ${SESSION_ID}"
echo "Query: ${QUERY}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Send message
echo "📤 Step 1: Sending message..."
SEND_RESPONSE=$(curl -s -X POST "http://localhost:4000/chat/send" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"${SESSION_ID}\",
    \"content\": \"${QUERY}\",
    \"userId\": \"test-user\"
  }")

echo "$SEND_RESPONSE" | jq '.' 2>/dev/null || echo "$SEND_RESPONSE"
echo ""

# Extract messageId and streamUrl
MESSAGE_ID=$(echo "$SEND_RESPONSE" | jq -r '.messageId' 2>/dev/null)
STREAM_URL=$(echo "$SEND_RESPONSE" | jq -r '.streamUrl' 2>/dev/null)

if [ -z "$MESSAGE_ID" ] || [ "$MESSAGE_ID" == "null" ]; then
  echo "❌ Failed to get messageId from /chat/send"
  echo "Response: $SEND_RESPONSE"
  exit 1
fi

echo "✅ Message created: ${MESSAGE_ID}"
echo ""

# Step 2: Stream response
echo "📥 Step 2: Streaming response..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$STREAM_URL" ] && [ "$STREAM_URL" != "null" ]; then
  # Use the streamUrl from response
  STREAM_ENDPOINT="http://localhost:4000${STREAM_URL}"
else
  # Fallback: construct URL manually
  AGENT_TYPE=$(echo "$SEND_RESPONSE" | jq -r '.agentType' 2>/dev/null || echo "FINANCE")
  STREAM_ENDPOINT="http://localhost:4000/chat/stream/${SESSION_ID}/${MESSAGE_ID}?agentType=${AGENT_TYPE}&query=${ENCODED_QUERY}"
fi

echo "Stream URL: ${STREAM_ENDPOINT}"
echo ""

# Stream with formatting
if command -v jq &> /dev/null; then
  curl -N -s "${STREAM_ENDPOINT}" | while IFS= read -r line; do
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
          echo ""
          echo "✅ Stream completed successfully"
          ;;
        ERROR)
          echo ""
          echo ""
          echo "❌ Stream error: $error"
          ;;
      esac
    fi
  done
else
  # Fallback without jq
  curl -N "${STREAM_ENDPOINT}"
fi

echo ""



