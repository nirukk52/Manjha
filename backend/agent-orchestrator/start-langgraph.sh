#!/bin/bash
# Startup script for LangGraph Studio with environment variables

echo "🚀 Starting LangGraph Studio with environment variables..."
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    echo "✅ Loading .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found!"
    exit 1
fi

echo ""
echo "Verifying API keys:"
if [ -n "$OPENAI_API_KEY" ]; then
    echo "✅ OPENAI_API_KEY: ${OPENAI_API_KEY:0:20}..."
else
    echo "❌ OPENAI_API_KEY not set!"
fi

if [ -n "$LANGSMITH_API_KEY" ]; then
    echo "✅ LANGSMITH_API_KEY: ${LANGSMITH_API_KEY:0:20}..."
else
    echo "⚠️  LANGSMITH_API_KEY not set (optional)"
fi

echo ""
echo "🎨 Starting LangGraph Studio..."
echo ""

# Start LangGraph CLI
npx @langchain/langgraph-cli dev

