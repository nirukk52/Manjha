# Multi-Agent Architecture for Manjha

## Overview

This document describes Manjha's scalable multi-agent architecture, designed to support 50-100 intelligent agents providing personalized financial analysis. The architecture follows proven patterns from AWS's financial analysis agent implementation, adapted for Manjha's unique requirements around user context, knowledge graphs, and personalization.

## Architectural Philosophy

### The Three-Layer Pattern

Our architecture separates concerns into three distinct layers, each with specific responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Workflow Orchestration (LangGraph)                │
│  Responsibility: Agent coordination, routing, state mgmt    │
│  Scale: 15-20 supervisor nodes                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Agent Reasoning (Supervisors & Specialists)       │
│  Responsibility: Decision-making, tool usage, synthesis     │
│  Scale: 50-100 total agents (10-15 supervisors + 40-85     │
│         specialists)                                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Tool & Data Services (MCP-Style Services)         │
│  Responsibility: Data access, external integrations         │
│  Scale: 5-10 core services                                  │
└─────────────────────────────────────────────────────────────┘
```

### Why This Pattern?

**Inspired by:** [AWS Blog - Build an intelligent financial analysis agent with LangGraph and Strands Agents](https://aws.amazon.com/blogs/machine-learning/build-an-intelligent-financial-analysis-agent-with-langgraph-and-strands-agents/)

**Key Insight:** Separate orchestration (LangGraph) from reasoning (agents) from infrastructure (services). This prevents:
- ❌ God objects that do everything
- ❌ M×N integration complexity (every agent connecting to every data source)
- ❌ Rigid workflows that can't adapt
- ❌ Monolithic systems that can't scale

Instead we get:
- ✅ Clean separation of concerns
- ✅ M+N integration (standardized interfaces)
- ✅ Dynamic, adaptive workflows
- ✅ Independent scalability of each layer

---

## Layer 1: Workflow Orchestration (LangGraph)

### Purpose
LangGraph orchestrates high-level workflow paths and manages state across agent executions. It does NOT contain agent reasoning logic—that belongs in Layer 2.

### Responsibilities
1. **Route user queries** to appropriate domain supervisors
2. **Maintain conversation state** (working memory during execution)
3. **Coordinate supervisor execution** (sequential, parallel, or hybrid)
4. **Handle errors and retries** at the workflow level

### What LangGraph Is NOT
- ❌ NOT where agents live (agents are inside nodes)
- ❌ NOT a database query layer (services handle that)
- ❌ NOT a formatting layer (separate service handles that)
- ❌ NOT a tool execution layer (agents call tools)

### Node Structure

**Supervisor Nodes (~15 total):**
```
START
  ↓
[classify] ← Meta-orchestrator: analyzes query intent
  ↓
[query_analyzer] ← Determines complexity, required domains
  ↓
(conditional routing - can invoke MULTIPLE supervisors)
  ↙         ↓           ↓           ↓         ↘
[financial] [risk]  [research]  [portfolio] [tax]  [news]
supervisor  super-  supervisor  supervisor  super-  super-
            visor                           visor   visor
  ↓          ↓        ↓           ↓          ↓       ↓
 END        END      END         END        END     END
```

**Key Principle:** Supervisors are graph nodes. Specialists are NOT.

### State Management

```typescript
export const StateAnnotation = Annotation.Root({
  // Input (immutable during execution)
  query: Annotation<string>,
  userId: Annotation<string>,
  userContext: Annotation<UserContext>,  // From Layer 3
  
  // Workflow state (evolves during execution)
  agentType: Annotation<AgentType | undefined>,
  confidence: Annotation<number | undefined>,
  
  // Results (accumulated from agents)
  agentResults: Annotation<AgentResult[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  
  // Final output
  response: Annotation<string | undefined>,
  metadata: Annotation<Record<string, unknown> | undefined>,
  error: Annotation<string | undefined>,
  processingTimeMs: Annotation<number | undefined>,
});
```

**Critical:** `userContext` is READ-ONLY in the graph. It's fetched once (Layer 3) before graph execution and passed to all agents. No agent writes to it during execution.

### Example: Financial Supervisor Node

```typescript
function createFinancialSupervisorNode(config: GraphConfig) {
  return async (state: OrchestrationState): Promise<Partial<OrchestrationState>> => {
    const llm = new ChatOpenAI({
      modelName: "gpt-4",
      openAIApiKey: config.openAIKey,
    });
    
    // Step 1: Plan execution (which specialists to call)
    const plan = await planExecution(llm, state);
    
    // Step 2: Execute specialists (NOT graph nodes, function calls)
    const results = await Promise.all(
      plan.specialists.map(spec => executeSpecialist(spec, state))
    );
    
    // Step 3: Synthesize results
    const synthesis = await synthesizeResults(llm, results, state);
    
    return {
      agentResults: results,
      response: synthesis.response,
      metadata: synthesis.metadata,
    };
  };
}
```

---

## Layer 2: Agent Reasoning

### Purpose
This is where actual intelligence lives. Agents reason, make decisions, call tools, and produce insights.

### Agent Hierarchy

```
Tier 1: Meta-Agents (3-5 agents)
├─ Classifier Agent
├─ Query Analyzer Agent
└─ Router Agent

Tier 2: Domain Supervisors (10-15 agents)
├─ Financial Analysis Supervisor
├─ Risk Management Supervisor
├─ Market Research Supervisor
├─ Portfolio Management Supervisor
├─ Tax Strategy Supervisor
├─ News & Sentiment Supervisor
├─ Documentation Supervisor
├─ Compliance Supervisor
├─ Technical Analysis Supervisor
└─ Fundamental Analysis Supervisor

Tier 3: Specialist Agents (40-85 agents)
├─ Financial Analysis Supervisor manages:
│   ├─ Earnings Analyst
│   ├─ Revenue Analyst
│   ├─ Margin Analyst
│   ├─ Growth Analyst
│   ├─ Valuation Analyst
│   ├─ Peer Comparison Analyst
│   ├─ Sector Analyst
│   └─ Geographic Analyst
│
├─ Risk Management Supervisor manages:
│   ├─ Market Risk Analyst
│   ├─ Credit Risk Analyst
│   ├─ Liquidity Risk Analyst
│   ├─ Operational Risk Analyst
│   ├─ Regulatory Risk Analyst
│   ├─ Concentration Risk Analyst
│   ├─ Tail Risk Analyst
│   └─ Stress Test Analyst
│
└─ ... (8 more supervisors with their specialists)
```

### Agent Anatomy

Every reasoning agent (supervisor or specialist) has:

```typescript
interface Agent {
  // Identity
  id: string;
  name: string;
  domain: AgentDomain;
  tier: AgentTier;
  
  // Intelligence
  model: string;              // e.g., "gpt-4", "gpt-4o"
  systemPrompt: string;       // Defines expertise
  temperature: number;
  
  // Capabilities
  tools: Tool[];              // Functions it can call
  memory: MemoryAccess;       // How it accesses userContext
  
  // Performance
  avgLatencyMs: number;
  costPerInvocation: number;
  confidenceThreshold: number;
  
  // Execution
  execute: (input: AgentInput) => Promise<AgentOutput>;
}
```

### Supervisor Pattern

Supervisors coordinate specialists through a reasoning loop:

1. **Analyze Request:** Understand what the query needs
2. **Plan Execution:** Decide which specialists to invoke
3. **Execute Specialists:** Call specialists (sequentially or parallel)
4. **Synthesize Results:** Combine specialist outputs into coherent response

**Key Principle:** Specialists are called as FUNCTIONS, not graph nodes.

```typescript
// Inside financial_supervisor node
async function executeSupervisor(state: OrchestrationState) {
  // 1. Analyze
  const analysis = await analyzeQuery(state.query, state.userContext);
  
  // 2. Plan
  const plan = {
    specialists: ['fundamentals', 'sentiment', 'technical'],
    executionMode: 'parallel',
  };
  
  // 3. Execute specialists (function calls, NOT nodes)
  const results = await Promise.all([
    fundamentalsAgent.execute({ query: state.query, userContext: state.userContext }),
    sentimentAgent.execute({ query: state.query, userContext: state.userContext }),
    technicalAgent.execute({ query: state.query, userContext: state.userContext }),
  ]);
  
  // 4. Synthesize
  return synthesize(results, state.userContext);
}
```

### Context-Aware Agents

Every agent receives `userContext` which includes:

```typescript
interface UserContext {
  userId: string;
  
  // Conversation history
  conversationHistory: ConversationMessage[];
  recentTopics: string[];
  
  // User preferences
  preferences: {
    communicationStyle?: 'formal' | 'casual' | 'technical';
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
    investmentGoals?: string[];
  };
  
  // Knowledge graph - user's learned concepts
  knowledgeGraph: {
    concepts: KnowledgeNode[];
    relationships: KnowledgeEdge[];
    recentlyDiscussed: string[];
  };
  
  // Mental models - user's thinking frameworks
  mentalModels: MentalModel[];
  
  // Trading journal - user's investment history
  tradingJournal: {
    recentEntries: JournalEntry[];
    currentHypotheses: JournalEntry[];
    lessonsLearned: JournalEntry[];
  };
  
  // Derived insights
  contextSummary: string;
}
```

Agents use this context in their prompts:

```typescript
const prompt = `
You are a fundamentals analyst specializing in revenue analysis.

USER CONTEXT:
- Risk tolerance: ${userContext.preferences.riskTolerance}
- Previously discussed: ${userContext.knowledgeGraph.recentlyDiscussed.join(', ')}
- Active mental models: ${userContext.mentalModels.map(m => m.modelName).join(', ')}
- Recent trades: ${userContext.tradingJournal.recentEntries.slice(0, 3).map(e => e.title).join(', ')}

CURRENT QUERY: ${query}

Provide analysis considering the user's context and preferences.
`;
```

---

## Layer 3: Tool & Data Services

### Purpose
Provide standardized access to data, external systems, and infrastructure. Following MCP (Model Context Protocol) pattern to avoid M×N integration complexity.

### Core Services

```
┌─────────────────────────────────────────────────────────────┐
│  context-gatherer                                            │
│  - Fetches all user context BEFORE graph execution          │
│  - Returns: UserContext object                              │
│  - Called: Once per request                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  knowledge-graph-service                                     │
│  - query(userId, entity): Search knowledge graph            │
│  - update(userId, nodes, edges): Add new knowledge          │
│  - getRelated(userId, entity): Find connections             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  trading-journal-service                                     │
│  - getRecentEntries(userId, limit): Recent journal entries  │
│  - addEntry(userId, entry): Create new entry                │
│  - getHypotheses(userId): Active investment theses          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  mental-models-service                                       │
│  - getActiveModels(userId): User's mental models            │
│  - recordApplication(userId, modelId): Track usage          │
│  - updateConfidence(userId, modelId, score): Adjust scores  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  preferences-service                                         │
│  - getPreferences(userId): All user preferences             │
│  - updatePreference(userId, key, value): Update setting     │
│  - inferFromBehavior(userId, actions): Learn preferences    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  market-data-service                                         │
│  - getStockPrice(ticker): Current price                     │
│  - getFinancials(ticker): Financial statements              │
│  - getIndustryData(sector): Sector benchmarks               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  knowledge-updater                                           │
│  - Called AFTER graph completes                             │
│  - Extracts new entities from conversation                  │
│  - Updates knowledge graph with learned concepts            │
│  - Records mental model applications                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  response-formatter                                          │
│  - Determines response structure (text, chart, table, etc.) │
│  - Formats for frontend consumption                         │
│  - Handles different presentation modes                     │
└─────────────────────────────────────────────────────────────┘
```

### MCP Pattern Benefits

**Without MCP (M×N complexity):**
```
50 agents × 10 data sources = 500 custom integrations
```

**With MCP (M+N complexity):**
```
50 agents + 10 services = 60 standardized interfaces
```

Each service provides a **standard API** that all agents can use:

```typescript
// Agents don't write SQL - they call services
await knowledgeGraphService.query(userId, "Apple");
await tradingJournalService.getRecentEntries(userId, 10);
await marketDataService.getStockPrice("AAPL");
```

---

## Complete Request Flow

### End-to-End Execution

```
User sends message: "Analyze my Tesla position considering my recent trades"
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│  CHAT GATEWAY (Entry Point)                                  │
│  1. Receives message                                         │
│  2. Validates input                                          │
│  3. Stores in database                                       │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3: Context Gatherer Service                           │
│  Fetches ONCE:                                               │
│  - Last 50 messages from conversation                        │
│  - User's knowledge graph (Tesla nodes, relationships)       │
│  - Mental models (position sizing, risk management)          │
│  - Trading journal (Tesla trades, hypotheses)                │
│  - User preferences (risk tolerance, goals)                  │
│  Returns: UserContext object                                 │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: LangGraph Orchestrator                             │
│                                                               │
│  START                                                        │
│    ↓                                                          │
│  [classify] → determines: FINANCIAL_ANALYSIS domain          │
│    ↓                                                          │
│  [analyze_query] → determines: needs portfolio + risk agents │
│    ↓                                                          │
│  (routes to 2 supervisors in parallel)                       │
│    ↙                           ↘                             │
│  [portfolio_supervisor]    [risk_supervisor]                 │
│    ↓                           ↓                              │
│   END                         END                             │
└────────────────┬──────────────┬────────────────────────────┘
                 │              │
                 ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 2: Supervisor Agents Execute                          │
│                                                               │
│  Portfolio Supervisor:                                        │
│  - Reads userContext (Tesla trades, positions)               │
│  - Calls specialists:                                        │
│    • position_analyst() → analyzes Tesla position            │
│    • performance_analyst() → calculates returns              │
│    • allocation_analyst() → checks portfolio weight          │
│  - Synthesizes: "Your Tesla position is 15% of portfolio..." │
│                                                               │
│  Risk Supervisor (runs in parallel):                         │
│  - Reads userContext (risk tolerance, past trades)           │
│  - Calls specialists:                                        │
│    • concentration_risk_analyst() → single stock risk        │
│    • volatility_analyst() → Tesla's volatility vs portfolio  │
│  - Synthesizes: "Concentration risk is elevated..."          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: LangGraph Collects Results                         │
│  - Both supervisors complete                                 │
│  - Results accumulated in state                              │
│  - Graph execution ends                                      │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3: Knowledge Updater Service                          │
│  Analyzes conversation:                                      │
│  - Extracts: User asked about "Tesla position"               │
│  - Updates knowledge graph: strengthen Tesla node            │
│  - Updates mental models: user applying position sizing      │
│  - Logs journal: user reviewing Tesla investment             │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  LAYER 3: Response Formatter Service                         │
│  Determines format: MULTI_SECTION                            │
│  Creates components:                                         │
│  - Text: Position analysis                                   │
│  - Table: Trade history                                      │
│  - Chart: Performance vs benchmark                           │
│  - Insight: Risk assessment                                  │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│  CHAT GATEWAY (Exit)                                         │
│  - Streams formatted response to frontend                    │
│  - Updates message status                                    │
│  - Records metrics                                           │
└──────────────────────────────────────────────────────────────┘
```

### Key Observations

1. **Context fetched ONCE** (Layer 3) before agents run
2. **Graph orchestrates supervisors** (Layer 1), supervisors call specialists (Layer 2)
3. **Knowledge updated AFTER** graph completes (Layer 3)
4. **Clean separation** at each layer

---

## Scaling to 50-100 Agents

### Current State (2 agents)
```
LangGraph:
- 3 nodes (classify, finance, general)
- 2 agents total

Agents:
- General agent
- Finance agent
```

### Phase 1: Add Supervisors (15 agents)
```
LangGraph:
- 17 nodes (1 classifier + 1 analyzer + 15 supervisors)
- 15 supervisor agents

Implementation:
- Create supervisor agent for each domain
- Register in AgentRegistry
- Add nodes to graph
- Configure routing
```

### Phase 2: Add Specialists (50 agents)
```
LangGraph:
- 17 nodes (unchanged)

Agents:
- 15 supervisors
- 35 specialists (5-10 per supervisor)

Implementation:
- Create specialist agents
- Register in AgentRegistry
- Supervisors discover via registry
- NO graph changes needed
```

### Phase 3: Scale to 100 (100 agents)
```
LangGraph:
- 17 nodes (unchanged)

Agents:
- 15 supervisors
- 85 specialists (5-10 per supervisor)

Implementation:
- Add more specialists per domain
- Register in AgentRegistry
- Supervisors auto-discover
- Still NO graph changes
```

**Key Principle:** Graph stays clean (15-20 nodes). Specialists scale independently.

---

## Agent Registry Pattern

### Purpose
Central registry for agent discovery and dynamic coordination.

### Implementation

```typescript
export class AgentRegistry {
  private agents = new Map<string, AgentMetadata>();
  
  register(metadata: AgentMetadata): void {
    this.agents.set(metadata.id, metadata);
  }
  
  // Supervisors use this to find specialists
  findSpecialistsByDomain(domain: AgentDomain): AgentMetadata[] {
    return Array.from(this.agents.values())
      .filter(a => a.domain === domain && a.tier === AgentTier.SPECIALIST);
  }
  
  // Graph builder uses this to create nodes
  getSupervisors(): AgentMetadata[] {
    return Array.from(this.agents.values())
      .filter(a => a.tier === AgentTier.SUPERVISOR);
  }
  
  // Find agents by capability (semantic search)
  findByCapability(capability: string): AgentMetadata[] {
    return Array.from(this.agents.values())
      .filter(a => a.capabilities.includes(capability));
  }
}
```

### Adding New Agents

```typescript
// Step 1: Create agent
export class SectorAnalystAgent extends BaseAgent {
  async execute(input: AgentInput): Promise<AgentOutput> {
    // Implementation
  }
}

// Step 2: Register
registry.register({
  id: "sector-analyst",
  name: "Sector Analysis Agent",
  tier: AgentTier.SPECIALIST,
  domain: AgentDomain.FINANCIAL_ANALYSIS,
  capabilities: ["sector-comparison", "industry-trends"],
  supervisorId: "financial-supervisor",
});

// Step 3: Supervisor auto-discovers it
// No graph changes needed!
```

---

## Development & Debugging

### LangGraph Studio (Layer 1 & 2)

```bash
cd backend/agent-orchestrator
langgraph dev
# Opens http://localhost:8123
```

**What you can do:**
- ✅ Visualize graph structure (nodes, edges)
- ✅ Test with mock input
- ✅ See agent execution in real-time
- ✅ Inspect state at each node
- ✅ View tool calls and LLM interactions
- ✅ Modify code → auto-reload

**Use for:**
- Building new supervisor nodes
- Testing routing logic
- Debugging agent reasoning
- Optimizing prompts

### LangSmith (Production Tracing)

**Setup:**
```bash
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="ls__your_key"
export LANGSMITH_PROJECT="manjha"
```

**What you get:**
- Full execution traces
- Every LLM call with prompts
- Token usage and costs
- Latency breakdown
- Error tracking

**Access:** https://smith.langchain.com

### Testing Individual Agents

```typescript
// tests/test-agent.ts
import { fundamentalsAgent } from '../agents/fundamentals';

async function testAgent() {
  const result = await fundamentalsAgent.execute({
    query: "Analyze Apple",
    userContext: mockUserContext,
  });
  
  console.log("Result:", result);
  console.log("Tools called:", result.toolCalls);
  console.log("Confidence:", result.confidence);
}

testAgent();
```

---

## Technology Stack

### Layer 1: Workflow Orchestration
- **LangGraph** - Workflow orchestration
- **TypeScript** - Type-safe implementation
- **Encore.ts** - Service infrastructure

### Layer 2: Agent Reasoning
- **LangChain** (TypeScript) - Agent framework
- **OpenAI Agents SDK** (Python) - For Python agents
- **GPT-4 / GPT-4o** - Foundation models
- **Anthropic Claude** - Alternative LLM

### Layer 3: Services & Data
- **PostgreSQL** - Primary data store
- **pgvector** - Vector embeddings for knowledge graph
- **Encore.ts** - Service framework
- **Graphiti** (via MCP) - Knowledge graph management

### Observability
- **LangSmith** - Agent tracing and debugging
- **Encore metrics** - Service-level metrics
- **PostgreSQL** - Conversation history

---

## Key Principles

### 1. Separation of Concerns
- **LangGraph** = Orchestration only
- **Agents** = Reasoning only
- **Services** = Data & infrastructure only

### 2. Context is King
- Fetch user context ONCE
- Pass to all agents
- Update AFTER execution completes

### 3. Supervisors Over Spaghetti
- Keep graph clean (15-20 nodes)
- Supervisors coordinate specialists
- Specialists are functions, not nodes

### 4. Registry Over Hardcoding
- Central agent registry
- Dynamic discovery
- Easy to add new agents

### 5. MCP Over Custom Integrations
- Standardized service interfaces
- M+N instead of M×N complexity
- Reusable across agents

---

## Next Steps

### Phase 1: Infrastructure (Week 1-2)
1. Create database schema for user context
2. Build context-gatherer service
3. Build knowledge-graph service
4. Build agent registry

### Phase 2: Supervisor Layer (Week 3-4)
1. Create 10-15 supervisor agents
2. Add supervisor nodes to LangGraph
3. Implement routing logic
4. Test in LangGraph Studio

### Phase 3: Specialist Layer (Week 5-8)
1. Create 40-50 specialist agents
2. Register in AgentRegistry
3. Supervisors discover specialists
4. Test supervisor → specialist coordination

### Phase 4: Scale to 100 (Week 9-12)
1. Add remaining specialist agents
2. Optimize performance
3. Add caching layers
4. Production deployment

---

## References

- [AWS Blog: Build an intelligent financial analysis agent with LangGraph and Strands Agents](https://aws.amazon.com/blogs/machine-learning/build-an-intelligent-financial-analysis-agent-with-langgraph-and-strands-agents/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Encore.ts Documentation](https://encore.dev/docs)

---

## Conclusion

This architecture provides a proven, scalable foundation for Manjha's multi-agent system. By following the three-layer pattern—orchestration (LangGraph), reasoning (agents), and services (MCP-style)—we achieve:

✅ **Clean separation** of concerns
✅ **Scalability** to 100+ agents without graph complexity
✅ **Context-awareness** through centralized user context
✅ **Flexibility** to add new agents without refactoring
✅ **Observability** through LangGraph Studio and LangSmith
✅ **Maintainability** through standardized interfaces

The AWS pattern validates this approach at enterprise scale. Manjha extends it with deep personalization through user context, knowledge graphs, mental models, and trading journals—making every interaction intelligent and contextual.

