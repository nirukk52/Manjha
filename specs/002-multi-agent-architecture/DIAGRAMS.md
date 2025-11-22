# Architecture Diagrams

Visual representations of Manjha's multi-agent architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                     Dumb Presentation Layer                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /chat/send
                             │ GET /chat/stream
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT GATEWAY (Encore)                       │
│  - Receives messages                                             │
│  - Orchestrates full pipeline                                    │
│  - Streams responses                                             │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             ▼                                ▼
    ┌────────────────┐              ┌─────────────────┐
    │ Context        │              │ Knowledge       │
    │ Gatherer       │◄────────────►│ Updater         │
    │ (Layer 3)      │              │ (Layer 3)       │
    └────────┬───────┘              └─────────────────┘
             │
             │ UserContext
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LANGGRAPH ORCHESTRATOR                         │
│                        (Layer 1)                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Graph Nodes                           │  │
│  │                                                           │  │
│  │  START → [classify] → [analyze] → (conditional)          │  │
│  │                                      ↙  ↓  ↓  ↘          │  │
│  │                              [fin] [risk] [research] [tax] │  │
│  │                                ↓     ↓      ↓        ↓    │  │
│  │                               END   END    END      END   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Supervisors invoke specialists
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT REASONING (Layer 2)                    │
│                                                                  │
│  Supervisors (in nodes):                Specialists (called):   │
│  - Financial Supervisor      ──────►    - Fundamentals Agent    │
│  - Risk Supervisor            ──────►   - Sentiment Agent       │
│  - Research Supervisor        ──────►   - Technical Agent       │
│  - ...                                  - ... (85 more)         │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Agents use services
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICES & DATA (Layer 3)                      │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ Knowledge      │  │ Trading        │  │ Mental          │  │
│  │ Graph Service  │  │ Journal        │  │ Models          │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ Market Data    │  │ Preferences    │  │ Response        │  │
│  │ Service        │  │ Service        │  │ Formatter       │  │
│  └────────────────┘  └────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   + pgvector    │
                    └─────────────────┘
```

---

## Agent Hierarchy

```
┌──────────────────────────────────────────────────────────────────┐
│                       AGENT HIERARCHY                             │
│                        (100 agents)                               │
└──────────────────────────────────────────────────────────────────┘

                            TIER 1
                    ┌─────────────────┐
                    │  Meta-Agents    │
                    │  (3-5 agents)   │
                    └─────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    [Classifier]     [Query Analyzer]      [Router]
        │
        ▼
                            TIER 2
        ┌───────────────────────────────────────┐
        │       Domain Supervisors              │
        │       (10-15 agents)                  │
        │       *** THESE ARE GRAPH NODES ***   │
        └───────────────────────────────────────┘
                │
    ┌───────────┼────────────────────────┐
    │           │           │            │
[Financial] [Risk]    [Research]    [Portfolio]
 Supervisor  Super-    Supervisor    Supervisor
            visor         
    │           │           │            │
    ▼           ▼           ▼            ▼
                            TIER 3
        ┌───────────────────────────────────────┐
        │      Specialist Agents                │
        │      (40-85 agents)                   │
        │      *** NOT GRAPH NODES ***          │
        │      *** CALLED BY SUPERVISORS ***    │
        └───────────────────────────────────────┘


Financial Supervisor manages:
├─ Earnings Analyst
├─ Revenue Analyst
├─ Margin Analyst
├─ Growth Analyst
├─ Valuation Analyst
├─ Peer Comparison Analyst
├─ Sector Analyst
└─ Geographic Analyst

Risk Supervisor manages:
├─ Market Risk Analyst
├─ Credit Risk Analyst
├─ Liquidity Risk Analyst
├─ Operational Risk Analyst
├─ Regulatory Risk Analyst
├─ Concentration Risk Analyst
├─ Tail Risk Analyst
└─ Stress Test Analyst

Research Supervisor manages:
├─ News Analyst
├─ Sentiment Analyst
├─ Industry Trends Analyst
├─ Competitor Analyst
├─ Market Intelligence Analyst
└─ Economic Indicators Analyst

... (7 more supervisors with their specialists)
```

---

## Graph Nodes vs Agents

### What You See in LangGraph Studio

```
┌─────────────────────────────────────────────────────────────┐
│             LANGGRAPH VISUALIZATION                          │
│             (15-20 nodes, clean structure)                   │
└─────────────────────────────────────────────────────────────┘

                    START
                      ↓
              ┌───────────────┐
              │   classify    │  ← Node (contains classifier agent)
              └───────────────┘
                      ↓
              ┌───────────────┐
              │ analyze_query │  ← Node (contains analyzer agent)
              └───────────────┘
                      ↓
            (conditional routing)
         ↙      ↓      ↓      ↓     ↘
    ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
    │fin │ │risk│ │res │ │port│ │tax │  ← Supervisor nodes
    │sup │ │sup │ │sup │ │sup │ │sup │
    └────┘ └────┘ └────┘ └────┘ └────┘
      ↓      ↓      ↓      ↓      ↓
     END    END    END    END    END
```

**Total visible nodes:** ~17

---

### What Happens INSIDE Supervisor Nodes

```
┌─────────────────────────────────────────────────────────────┐
│         INSIDE "financial_supervisor" NODE                   │
│         (This is ONE node in the graph)                      │
└─────────────────────────────────────────────────────────────┘

    Financial Supervisor Agent executes:
                │
                ▼
    ┌─────────────────────┐
    │ 1. Plan Execution   │  → "I need fundamentals and sentiment"
    └─────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │ 2. Call Specialists │  → These are FUNCTION CALLS
    └─────────────────────┘     NOT graph nodes!
                │
        ┌───────┼───────┐
        ↓       ↓       ↓
    ┌─────┐ ┌─────┐ ┌─────┐
    │Fund │ │Sent │ │Tech │  ← Specialist agents
    │Agent│ │Agent│ │Agent│     (not graph nodes)
    └─────┘ └─────┘ └─────┘
        ↓       ↓       ↓
        └───────┼───────┘
                ▼
    ┌─────────────────────┐
    │ 3. Synthesize       │  → Combine results
    └─────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │ Return to graph     │  → Updates state, continues to END
    └─────────────────────┘
```

**Key:** One node contains agent logic that calls multiple specialists.

---

## Complete Request Flow

```
┌────────────────────────────────────────────────────────────────┐
│  USER MESSAGE: "Analyze my Tesla position"                     │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Chat Gateway   │
                    └────────┬────────┘
                             │
                             ▼
        ═════════════════════════════════════════════
                    LAYER 3: SERVICES
        ═════════════════════════════════════════════
                             │
                             ▼
                ┌────────────────────────┐
                │  Context Gatherer      │
                │  Fetches ONCE:         │
                │  - Conversation (50)   │
                │  - Knowledge graph     │
                │  - Mental models       │
                │  - Trading journal     │
                │  - Preferences         │
                └────────┬───────────────┘
                         │
                         │ UserContext object
                         ▼
        ═════════════════════════════════════════════
                    LAYER 1: LANGGRAPH
        ═════════════════════════════════════════════
                         │
                         ▼
            ┌────────────────────────┐
            │  START                 │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │  [classify] node       │  "FINANCIAL_ANALYSIS"
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │  [analyze_query] node  │  "Need portfolio + risk"
            └────────┬───────────────┘
                     │
                     ▼
            (routes to 2 supervisors)
                ↙           ↘
    ┌─────────────┐   ┌─────────────┐
    │[portfolio]  │   │[risk]       │  ← Supervisor nodes
    │supervisor   │   │supervisor   │     execute in parallel
    └──────┬──────┘   └──────┬──────┘
           │                 │
           ▼                 ▼
        ═════════════════════════════════════════════
                    LAYER 2: AGENTS
        ═════════════════════════════════════════════
           │                 │
           ▼                 ▼
    Portfolio Sup      Risk Supervisor
    calls:             calls:
    - position         - concentration
      analyst            risk analyst
    - performance      - volatility
      analyst            analyst
    - allocation       
      analyst          
           │                 │
           └────────┬────────┘
                    │ Both return results
                    ▼
        ═════════════════════════════════════════════
                    LAYER 1: LANGGRAPH
        ═════════════════════════════════════════════
                    │
                    ▼
            ┌────────────────────────┐
            │  State accumulated     │
            │  Both supervisors done │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │  END                   │
            └────────┬───────────────┘
                     │
                     ▼
        ═════════════════════════════════════════════
                    LAYER 3: SERVICES
        ═════════════════════════════════════════════
                     │
                     ▼
        ┌────────────────────────┐
        │  Knowledge Updater     │  Updates:
        │                        │  - Knowledge graph
        │                        │  - Mental models
        │                        │  - Journal
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Response Formatter    │  Creates:
        │                        │  - Text sections
        │                        │  - Charts
        │                        │  - Tables
        └────────┬───────────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │  Chat Gateway          │  Streams to
        │                        │  frontend
        └────────────────────────┘
```

---

## Layer Interactions

```
┌──────────────────────────────────────────────────────────────┐
│                  LAYER BOUNDARIES                             │
└──────────────────────────────────────────────────────────────┘


    LAYER 3 (Services)
    │
    │ provides: UserContext
    │
    ▼
    ─────────────────────────────────────
    LAYER 1 (LangGraph)
    │
    │ orchestrates: Supervisor nodes
    │ maintains: Working memory (state)
    │ passes: UserContext to all nodes
    │
    ▼
    ─────────────────────────────────────
    LAYER 2 (Agents)
    │
    │ reads: UserContext (immutable)
    │ calls: Layer 3 services for tools
    │ returns: Analysis results
    │
    ▼
    ─────────────────────────────────────
    LAYER 1 (LangGraph)
    │
    │ accumulates: Results in state
    │ returns: Final state
    │
    ▼
    ─────────────────────────────────────
    LAYER 3 (Services)
    │
    │ updates: Knowledge based on conversation
    │ formats: Response for frontend
    │
    ▼
    ─────────────────────────────────────
    Frontend


KEY PRINCIPLES:

✅ Context fetched ONCE (Layer 3) before graph
✅ Graph is READ-ONLY consumer of context
✅ Agents never write to userContext during execution
✅ Knowledge updated AFTER graph completes
```

---

## MCP Pattern (M+N vs M×N)

### Without MCP (M×N Complexity)

```
┌────────┐
│Agent 1 │────────┐
└────────┘        │
                  ▼
┌────────┐    ┌────────┐
│Agent 2 │───→│  DB    │
└────────┘    └────────┘
     ↓            ↑
     │            │
     ▼            │
┌────────┐        │
│Agent 3 │────────┤
└────────┘        │
     ↓            │
     └────────────┘

50 agents × 10 data sources
= 500 custom integrations
= Spaghetti code
```

### With MCP (M+N Complexity)

```
┌────────┐
│Agent 1 │─┐
└────────┘ │
           │
┌────────┐ │    ┌──────────────────┐
│Agent 2 │─┼───→│ Knowledge Graph  │──┐
└────────┘ │    │ Service          │  │
           │    └──────────────────┘  │
┌────────┐ │                          │
│Agent 3 │─┤    ┌──────────────────┐  │
└────────┘ │    │ Trading Journal  │──┤
           │    │ Service          │  │
    ...    │    └──────────────────┘  │
           │                          │    ┌────┐
┌────────┐ │    ┌──────────────────┐  ├───→│ DB │
│Agent 50│─┘    │ Market Data      │──┘    └────┘
└────────┘      │ Service          │
                └──────────────────┘

50 agents + 10 services
= 60 standardized interfaces
= Clean, maintainable
```

---

## Scaling Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                   SCALING FROM 2 TO 100                       │
└──────────────────────────────────────────────────────────────┘


CURRENT (2 agents):
    LangGraph: 3 nodes
    
    START → [classify] → [finance] → END
                      ↘ [general] → END


PHASE 1 (15 agents):
    LangGraph: 17 nodes
    
    START → [classify] → [analyzer] → (conditional)
                                    ↙  ↓  ↓  ↓  ↘
                            [fin][risk][res][port][tax]...
                              ↓    ↓    ↓    ↓    ↓
                             END  END  END  END  END


PHASE 2 (50 agents):
    LangGraph: 17 nodes (UNCHANGED!)
    
    Each supervisor now calls 3-5 specialists
    
    [financial_supervisor]
         ├─ calls fundamentals_agent()
         ├─ calls sentiment_agent()
         └─ calls valuation_agent()
    
    Graph stays clean, agents scale independently


PHASE 3 (100 agents):
    LangGraph: 17 nodes (STILL UNCHANGED!)
    
    Each supervisor now calls 6-10 specialists
    
    [financial_supervisor]
         ├─ calls earnings_analyst()
         ├─ calls revenue_analyst()
         ├─ calls margin_analyst()
         ├─ calls growth_analyst()
         ├─ calls valuation_analyst()
         ├─ calls peer_comparison_analyst()
         ├─ calls sector_analyst()
         └─ calls geographic_analyst()
    
    Graph STILL clean, 100 agents working


KEY INSIGHT: Graph complexity stays constant.
            Agent count scales linearly.
```

---

## Development Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT CYCLE                           │
└──────────────────────────────────────────────────────────────┘


1. DESIGN in LangGraph Studio
   ┌─────────────────────────────┐
   │  langgraph dev              │
   │  Opens: localhost:8123      │
   │                             │
   │  - Add node to graph        │
   │  - Test with mock input     │
   │  - See execution visually   │
   │  - Iterate on prompts       │
   └─────────────────────────────┘
                │
                ▼
2. TEST Agents in Isolation
   ┌─────────────────────────────┐
   │  tsx tests/test-agent.ts    │
   │                             │
   │  - Test tool integration    │
   │  - Verify output quality    │
   │  - Check error handling     │
   └─────────────────────────────┘
                │
                ▼
3. E2E Testing
   ┌─────────────────────────────┐
   │  ./test-stream.sh           │
   │                             │
   │  - Full stack test          │
   │  - Real user flow           │
   │  - Verify context passing   │
   └─────────────────────────────┘
                │
                ▼
4. TRACE in LangSmith
   ┌─────────────────────────────┐
   │  smith.langchain.com        │
   │                             │
   │  - See full execution       │
   │  - Debug issues             │
   │  - Optimize performance     │
   │  - Track costs              │
   └─────────────────────────────┘
                │
                ▼
5. DEPLOY & MONITOR
   ┌─────────────────────────────┐
   │  Production                 │
   │                             │
   │  - LangSmith traces         │
   │  - Encore metrics           │
   │  - User feedback            │
   └─────────────────────────────┘
```

---

## Summary Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                  MANJHA MULTI-AGENT SYSTEM                      │
│                   (Complete Architecture)                       │
└────────────────────────────────────────────────────────────────┘


    USER
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND: Next.js (Dumb Presentation)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  API: Chat Gateway (Encore.ts)                              │
└─────┬────────────────────────────────────────────────┬──────┘
      │                                                │
      │ Before Graph                                   │ After Graph
      ▼                                                ▼
┌──────────────┐                              ┌──────────────┐
│ Context      │                              │ Knowledge    │
│ Gatherer     │                              │ Updater      │
│ (Layer 3)    │                              │ (Layer 3)    │
└──────┬───────┘                              └──────────────┘
       │
       │ UserContext (immutable)
       ▼
┌─────────────────────────────────────────────────────────────┐
│  ORCHESTRATION: LangGraph (Layer 1)                         │
│                                                              │
│  Nodes: 15-20 supervisor nodes                              │
│  State: UserContext + working memory                        │
│  Flow: START → classify → route → supervisors → END         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Supervisors execute
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  REASONING: Agents (Layer 2)                                │
│                                                              │
│  Supervisors: 15 domain coordinators (graph nodes)          │
│  Specialists: 85 expert agents (called by supervisors)      │
│  Total: 100 intelligent agents                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ Use services
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVICES: MCP-Style Data Layer (Layer 3)                   │
│                                                              │
│  - knowledge-graph-service                                  │
│  - trading-journal-service                                  │
│  - mental-models-service                                    │
│  - market-data-service                                      │
│  - preferences-service                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  PostgreSQL   │
                   │  + pgvector   │
                   └───────────────┘


OBSERVABILITY:
- LangGraph Studio (local dev)
- LangSmith (tracing)
- Encore metrics (services)
```

