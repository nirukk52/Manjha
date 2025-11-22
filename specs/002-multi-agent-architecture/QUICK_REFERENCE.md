# Multi-Agent Architecture - Quick Reference

**TL;DR:** Manjha uses a 3-layer architecture to scale to 100 agents while keeping the system clean and maintainable.

---

## The Three Layers

```
Layer 1: LangGraph (Orchestration)     → 15-20 supervisor NODES
Layer 2: Agents (Reasoning)             → 100 total AGENTS (15 supervisors + 85 specialists)
Layer 3: Services (Data & Tools)        → 5-10 MCP-style SERVICES
```

---

## Key Concepts

### 1. Supervisors Are Nodes, Specialists Are Not

**Graph nodes (~15):**
- Financial Supervisor
- Risk Supervisor
- Research Supervisor
- Portfolio Supervisor
- Tax Supervisor
- ... (10 more)

**Specialists (NOT nodes, ~85):**
- Called BY supervisors as functions
- Earnings Analyst, Sentiment Analyst, Technical Analyst, etc.

### 2. Context Flows One Way

```
Before graph:  Context Gatherer → UserContext
During graph:  Agents READ userContext (immutable)
After graph:   Knowledge Updater → Updates based on conversation
```

### 3. MCP Pattern

Instead of every agent having database code:
```
All agents → Standardized services → Database
```

Benefits:
- 50 agents + 10 services = 60 interfaces (vs 500 custom integrations)
- Add new agent = just call existing services
- Change database = update services only

---

## File Structure

```
backend/
├── agent-orchestrator/          # Layer 1: LangGraph
│   ├── graph.ts                 # Graph definition
│   ├── orchestrator.ts          # Encore entry point
│   ├── registry/                # Agent registry
│   └── supervisors/             # Supervisor nodes
│
├── context-gatherer/            # Layer 3: Service
│   └── gatherer.ts              # Fetch all user context
│
├── knowledge-graph-service/     # Layer 3: Service
│   └── service.ts               # KG queries & updates
│
├── trading-journal-service/     # Layer 3: Service
├── mental-models-service/       # Layer 3: Service
└── agents/                      # Layer 2: Specialists
    ├── fundamentals/
    ├── sentiment/
    └── technical/
```

---

## Development Workflow

### 1. Design Agent in LangGraph Studio
```bash
cd backend/agent-orchestrator
langgraph dev
# Opens http://localhost:8123
```

**What you see:**
- Visual graph (nodes + edges)
- Input panel to test queries
- State inspection at each node
- Real-time execution

### 2. Debug with LangSmith
```bash
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="ls__your_key"
```

**View at:** https://smith.langchain.com
- Full execution traces
- Every LLM call
- Token usage
- Costs

### 3. Test E2E
```bash
cd backend/tests/e2e
./test-stream.sh
```

---

## Adding a New Agent

### If it's a SUPERVISOR (new domain):

1. **Create node:**
   ```typescript
   // backend/agent-orchestrator/supervisors/new-supervisor.ts
   export function createNewSupervisorNode(config: GraphConfig) {
     return async (state: OrchestrationState) => {
       // Supervisor logic
     };
   }
   ```

2. **Add to graph:**
   ```typescript
   // backend/agent-orchestrator/graph.ts
   .addNode("new_supervisor", createNewSupervisorNode(config))
   ```

3. **Update routing:**
   ```typescript
   .addConditionalEdges("analyze_query", route, {
     // ... existing routes
     new_domain: "new_supervisor",
   })
   ```

### If it's a SPECIALIST (new capability):

1. **Create agent:**
   ```typescript
   // backend/agents/new-specialist/agent.ts
   export class NewSpecialistAgent extends BaseAgent {
     async execute(input: AgentInput): Promise<AgentOutput> {
       // Specialist logic
     }
   }
   ```

2. **Register:**
   ```typescript
   registry.register({
     id: "new-specialist",
     tier: AgentTier.SPECIALIST,
     domain: AgentDomain.FINANCIAL_ANALYSIS,
     supervisorId: "financial-supervisor",
   });
   ```

3. **Supervisor auto-discovers it!**
   - No graph changes needed
   - Supervisor queries registry
   - Calls specialist as function

---

## Common Patterns

### Pattern 1: Supervisor Coordinates Specialists

```typescript
async function financialSupervisorNode(state: OrchestrationState) {
  // 1. Plan
  const plan = await decidSpecialists(state);
  
  // 2. Execute (parallel)
  const results = await Promise.all([
    fundamentalsAgent.execute(state),
    sentimentAgent.execute(state),
    technicalAgent.execute(state),
  ]);
  
  // 3. Synthesize
  return synthesize(results);
}
```

### Pattern 2: Context-Aware Prompts

```typescript
const prompt = `
You are a fundamentals analyst.

USER CONTEXT:
- Risk tolerance: ${state.userContext.preferences.riskTolerance}
- Recent trades: ${state.userContext.tradingJournal.recentEntries.map(e => e.title).join(', ')}
- Mental models: ${state.userContext.mentalModels.map(m => m.modelName).join(', ')}

QUERY: ${state.query}

Provide analysis considering the user's context.
`;
```

### Pattern 3: Service-Based Tools

```typescript
// Agents don't write SQL - they call services
const tools = [
  {
    name: "get_knowledge_graph",
    func: async (entity: string) => {
      return await knowledgeGraphService.query(userId, entity);
    },
  },
  {
    name: "get_recent_trades",
    func: async () => {
      return await tradingJournalService.getRecentEntries(userId, 10);
    },
  },
];
```

---

## Scaling Strategy

| Phase | Nodes | Agents | What Changes |
|-------|-------|--------|--------------|
| Current | 3 | 2 | Initial setup |
| Phase 1 | 17 | 15 | Add supervisors, update graph |
| Phase 2 | 17 | 50 | Add specialists, NO graph changes |
| Phase 3 | 17 | 100 | Add more specialists, NO graph changes |

**Key:** Graph complexity stays constant, agents scale independently.

---

## Troubleshooting

### "Where is my agent executing?"

**Check LangGraph Studio:**
1. Open http://localhost:8123
2. Run a query
3. Click on nodes to see execution
4. Look for your agent's output in state

### "Why isn't my specialist being called?"

**Check registry:**
```typescript
const specialists = registry.findByDomain(AgentDomain.FINANCIAL_ANALYSIS);
console.log("Available specialists:", specialists);
```

**Check supervisor logic:**
```typescript
// Is supervisor discovering your specialist?
const plan = await supervisor.planExecution(state);
console.log("Planned specialists:", plan.specialists);
```

### "Context not available in agent?"

**Check state:**
```typescript
function myAgentNode(state: OrchestrationState) {
  console.log("UserContext:", state.userContext);
  if (!state.userContext) {
    throw new Error("Context not provided!");
  }
}
```

**Check context gatherer:**
```bash
# Test service directly
curl -X POST http://localhost:4000/context-gatherer/gather \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "sessionId": "abc-123"}'
```

---

## Performance Tips

### 1. Cache User Context
- Fetch ONCE per request
- Reuse across all agents
- Don't refetch in specialists

### 2. Parallel Execution
```typescript
// Good: Parallel
await Promise.all([
  agent1.execute(state),
  agent2.execute(state),
]);

// Bad: Sequential (slower)
const result1 = await agent1.execute(state);
const result2 = await agent2.execute(state);
```

### 3. Lazy Loading
```typescript
// Only fetch what you need
const context = await contextGatherer.gather({
  userId,
  sessionId,
  include: ['knowledgeGraph', 'recentTrades'], // Don't fetch everything
});
```

---

## Testing Checklist

Before adding an agent to production:

- [ ] Works in LangGraph Studio
- [ ] Traces visible in LangSmith
- [ ] Respects user context
- [ ] Handles errors gracefully
- [ ] Returns structured output
- [ ] Registered in AgentRegistry
- [ ] Supervisor can discover it
- [ ] E2E test passes
- [ ] Performance acceptable (<5s)
- [ ] Cost reasonable (<$0.10 per call)

---

## Links

- **[Full Architecture Doc](./ARCHITECTURE.md)** - Complete system design
- **[Visual Diagrams](./DIAGRAMS.md)** - System visualizations
- **[LangGraph Studio Setup](../../001-finance-chat-agent/LANGGRAPH_STUDIO.md)** - Local dev setup
- **[LangSmith Setup](../../001-finance-chat-agent/LANGSMITH_SETUP.md)** - Tracing setup

---

## One-Minute Summary

**Problem:** Need 100 agents for comprehensive financial analysis.

**Solution:** Three-layer architecture
- **Layer 1 (LangGraph):** Orchestrates ~15 supervisor nodes
- **Layer 2 (Agents):** 100 agents (15 supervisors + 85 specialists)
- **Layer 3 (Services):** Standardized data access

**Key Insight:** Supervisors are graph nodes, specialists are functions called by supervisors.

**Result:** Clean graph (15 nodes) + scalable agents (100) + maintainable code.

**Inspired by:** [AWS financial analysis agent pattern](https://aws.amazon.com/blogs/machine-learning/build-an-intelligent-financial-analysis-agent-with-langgraph-and-strands-agents/)

