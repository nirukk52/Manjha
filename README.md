# Manjha - Your AI Trading Coach

> **Trading Journal + Portfolio Intelligence Chat + Knowledge Graph**  
> *Turn your trading data into insights through conversation*

## Vision

Manjha is an **AI-powered trading journal** that helps traders improve through intelligent conversation and automated insights. Ask questions about your trades, get instant analysis with charts, and build a personalized knowledge base that learns from every trade you make.

**For non-coders who want professional-grade insights without complexity.**

## What Makes Manjha Different?

Traditional trading journals ([Edgewonk](https://edgewonk.com/), [TraderSync](https://tradersync.com), [TradesViz](https://www.tradesviz.com/)) require manual analysis and complex dashboards. Manjha brings **conversational intelligence** to trading:

- 💬 **Chat-First Interface** - Ask "Why am I losing on Fridays?" and get instant analysis
- 🧠 **Knowledge Graph** - Builds a living memory of your trading patterns, strategies, and lessons
- 📊 **Auto-Generated Widgets** - Every answer comes with visual proof (charts, heatmaps, performance breakdowns)
- 🔗 **Connected Accounts** - Sync trades from Robinhood, Zerodha, Interactive Brokers, and more
- 🎯 **Your AI Coach** - Acts as performance analyst, strategist, planner, and discipline coach

## How It Works

Ask a question about your portfolio, and Manjha returns **three synchronized outputs**:

### 1. Direct Answer (Chat)
A clean, scrollable chat panel that gives plain-language explanations to any question about P&L, holdings, risk, or behavior patterns.

### 2. Chart/Widget Output
Instantly see matching visuals: P&L charts, sector exposure, win/loss streaks, trade heat maps, pattern analysis.

### 3. Mental Model Output
Get personalized discipline frameworks: decision flows, risk rules, trading habits, strategy diagrams that crystallize concepts into actionable models.

**Pin any chart or insight to your persistent board** for later reference and journaling.

Behind the chat window sits a **full trading journal layer** with calendar view, trade summaries, and behavioral insights - always accessible, never in the way.

### Example Questions

- "Why is my P&L negative this month, and what should I fix?"
- "Show me my best performing strategy"
- "When do I cut winners too early?"
- "What's my average hold time on profitable trades?"
- "How does my performance differ between market open vs close?"

The app layout:
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| +------------------------------------------------------------------+                                                                                                              |
| | The rest of the                                                  |                                                                                                              |
| | background is an trading                                         |                                                                                                              |
| | journal, with calendar                                           |                                                                                                              |
| | view, and other friendly                                         |                                                                                                              |
| | views to understand your                                         |                                                                                                              |
| | portfolio at a glance.                                           |                                                                                                              |
| +------------------------------------------------------------------+                                                                                                              |
|                                                                                                                                                                                   |
|                                                                                                  +---------------------------------------------------+                            |
|                                                                                                  | Pinned charts/                                    |                            |
|                                                                                                  | widgets,                                          |                            |
|                                                                                                  | from the chat appear                              |                            |
|                                                                                                  | here.                                             |                            |
|                                                                                                  +---------------------------------------------------+                            |
|                                                                                                                                                                                   |
|                                                                                                                                                                                   |
|                                 +-----------------------------------------------------------------------------------------------------------------------+                         |
|                                 | This is chat window.                                                                                                  |                         |
|                                 | It can be dynamically rolled up or                                                                                    |                         |
|                                 | down by selecting the options/tabs                                                                                    |                         |
|                                 | below.                                                                                                                |                         |
|                                 |                                                                                                                       |                         |
|                                 | First window will be text answer to                                                                                   |                         |
|                                 | the question.                                                                                                         |                         |
|                                 | Second a chart/widget showing that                                                                                    |                         |
|                                 | answer.                                                                                                               |                         |
|                                 | Third flow-chart mental model                                                                                         |                         |
|                                 | created for you to remember the                                                                                       |                         |
|                                 | concept, flow, or a discipline engine.                                                                                |                         |
|                                 +-----------------------------------------------------------------------------------------------------------------------+                         |
|                                                                                                                                                                                   |
|                                 +--------------+-----------------------+-----------------------+                                                                                  |
|                                 | Answer       | Chart format answer   | Option 3              |                                                                                  |
|                                 +--------------+-----------------------+-----------------------+                                                                                  |
|                                 +-----------------------------------------------------------------------------------------------------------------------+                         |
|                                 | Why is my P&L negative this month, and what should I fix?                                                             |                         |
|                                 +-----------------------------------------------------------------------------------------------------------------------+                         |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

## Competitive Landscape

We're inspired by the best trading journals in the market, but taking a fundamentally different approach:

| Tool | Strength | Manjha's Approach |
|------|----------|-------------------|
| **[Edgewonk](https://edgewonk.com/)** | 200+ broker imports, pattern detection | ✅ Auto imports + AI explains patterns in chat |
| **[TraderSync](https://tradersync.com)** | Comprehensive audit reports | ✅ Ask questions, get instant analysis vs static reports |
| **[TradesViz](https://www.tradesviz.com/)** | Advanced visualizations | ✅ Generate charts on-demand through conversation |
| **[Trader Sage](https://tradersage.ai/)** | Plaid integration for sync | ✅ Similar sync + knowledge graph that remembers context |
| **[Notion Templates](https://www.notion.com/templates/category/trading-journal)** | Flexible journaling | ✅ Structure + AI intelligence that learns |

### Our Unique Edge

**Chat + Knowledge Graph + Multi-Agent Intelligence**

While others require traders to navigate dashboards and run manual analyses, Manjha lets you **ask questions in plain English** and receive:
- Instant analysis powered by specialized AI agents
- Visual proof through auto-generated widgets
- Context that builds over time through knowledge graph
- Insights that non-coders can access without learning complex tools

## Product Roadmap

### Phase 1: Foundation (Current)
- ✅ Multi-agent chat system with LangGraph
- ✅ Real-time streaming responses
- ✅ Message classification (finance vs general)
- 🚧 User authentication & session management
- 🚧 Portfolio data import (manual CSV/form entry)

### Phase 2: Intelligence Layer
- 📋 Trade journaling (manual entry)
- 📋 Performance analysis agents (win rate, R-multiple, drawdown tracking)
- 📋 Pattern detection (time-based, strategy-based, instrument-based)
- 📋 Widget generation from chat (charts, heatmaps, calendars)
- 📋 Knowledge graph integration (remembers your context)

### Phase 3: Connected Accounts
- 📋 Broker integrations (Robinhood, Zerodha, Interactive Brokers)
- 📋 Automated trade import via Plaid or direct APIs
- 📋 Real-time portfolio monitoring
- 📋 Advanced risk metrics (VaR, position sizing)

### Phase 4: Coach & Planner
- 📋 Personalized trading playbook generation
- 📋 Strategy backtesting with your historical data
- 📋 Behavioral analysis (when do you cut winners early?)
- 📋 Goal tracking and accountability

**Legend**: ✅ Done | 🚧 In Progress | 📋 Planned

## Architecture & Specifications

### Multi-Agent System
- **[Multi-Agent Architecture](./specs/002-multi-agent-architecture/README.md)** - Scalable 50-100 agent architecture
  - Three-layer pattern (LangGraph, Agents, Services)
  - Supervisor → Specialist hierarchy
  - Context-aware personalization
  - Inspired by [AWS financial analysis agent pattern](https://aws.amazon.com/blogs/machine-learning/build-an-intelligent-financial-analysis-agent-with-langgraph-and-strands-agents/)

### Features
- **[Finance Chat Agent](./specs/001-finance-chat-agent/spec.md)** - AI-powered financial assistant with streaming responses
  - Real-time chat with portfolio analysis
  - LangGraph orchestration
  - LangSmith tracing

## Tech Stack

### Backend (Agent Intelligence)
- **Encore.ts** - Type-safe service framework for microservices
- **LangGraph** - Multi-agent orchestration (supervisor → specialist pattern)
- **PostgreSQL + pgvector** - Trade data, user data, and vector search
- **LangChain** - Agent framework and LLM tooling
- **Graphiti (via MCP)** - Knowledge graph for building trader memory

### Frontend (Dumb Presentation)
- **Next.js** - React framework with server components
- **Tailwind CSS + shadcn/ui** - Beautiful, accessible components
- **React Query** - Server state management
- **WebSocket/SSE** - Real-time streaming for chat

### Integrations (Planned)
- **Plaid** - Secure broker account connections
- **Kite Connect API** - Zerodha integration
- **Robinhood API** - US retail broker integration
- **Interactive Brokers API** - Professional trader integration

### Observability
- **LangSmith** - Agent tracing and debugging
- **LangGraph Studio** - Local multi-agent visualization
- **Centralized logging** - All services log through common module

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Encore CLI (`npm install -g encore`)
- LangSmith API key (for agent tracing)
- OpenAI API key (for LLMs)

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd Manjha

# Backend setup
cd backend
npm install
encore run  # Starts all backend services

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev  # Starts Next.js on http://localhost:3000
```

### Running Tests

```bash
# Backend E2E tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

See [Architecture Documentation](./specs/002-multi-agent-architecture/README.md) for detailed system design.
