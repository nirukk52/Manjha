# Multi-Agent Architecture Specification

## Overview

This specification defines Manjha's scalable 50-100 agent architecture for personalized financial analysis. The architecture follows proven patterns from AWS's financial analysis agent implementation, adapted for Manjha's unique requirements.

## Documents

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Main architecture document.** Comprehensive guide covering:
- Three-layer architectural pattern (LangGraph, Agents, Services)
- Agent hierarchy (supervisors → specialists)
- Context-aware agent execution
- MCP-style service integration
- Complete request flow
- Scaling strategy from 2 to 100 agents

**Read this first** to understand the overall system design.

### [DIAGRAMS.md](./DIAGRAMS.md)
**Visual architecture diagrams.** Includes:
- System architecture overview
- Agent hierarchy visualization
- Request flow diagrams
- Layer interactions
- Node vs agent clarification

**Read this** for visual understanding of the system.

### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Quick reference guide.** Includes:
- TL;DR of the architecture
- Common patterns and recipes
- Development workflow
- Adding new agents
- Troubleshooting guide
- Performance tips

**Read this** for practical implementation guidance.

## Quick Start

### Understanding the Architecture

```
Layer 1: LangGraph (Orchestration)
  ↓
Layer 2: Agents (Reasoning)
  ↓
Layer 3: Services (Data & Tools)
```

### Key Concepts

1. **Supervisors are graph nodes** (~15 nodes)
2. **Specialists are NOT graph nodes** (~85 agents called by supervisors)
3. **UserContext fetched ONCE** before graph execution
4. **Knowledge updated AFTER** graph execution completes

### Development Workflow

1. **Design in LangGraph Studio:**
   ```bash
   cd backend/agent-orchestrator
   langgraph dev
   ```

2. **Test with LangSmith:**
   - View traces at https://smith.langchain.com
   - Debug agent reasoning
   - Optimize prompts

3. **Scale incrementally:**
   - Phase 1: Add supervisors (15 agents)
   - Phase 2: Add specialists (50 agents)
   - Phase 3: Scale to 100 agents

## Current State

### Implemented ✅
- Basic LangGraph orchestration (classify → finance/general)
- Chat gateway with streaming
- Database schema for chat sessions/messages
- LangGraph Studio setup
- LangSmith integration

### To Implement 🚧
- User context gathering service
- Knowledge graph service
- Mental models service
- Trading journal service
- Supervisor agents (15)
- Specialist agents (85)
- Agent registry
- Response formatter

## Inspired By

[AWS Blog: Build an intelligent financial analysis agent with LangGraph and Strands Agents](https://aws.amazon.com/blogs/machine-learning/build-an-intelligent-financial-analysis-agent-with-langgraph-and-strands-agents/)

Key takeaways:
- Separate orchestration from reasoning
- Use supervisors to coordinate specialists
- Standardize tool integration (MCP pattern)
- Keep graph clean (~15 nodes, not 100)

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio)
- [LangSmith](https://docs.smith.langchain.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Encore.ts](https://encore.dev/docs)

## Questions?

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanations of:
- Why supervisors are nodes but specialists aren't
- How context flows through the system
- How to debug Layer 2 agents
- How to scale from 2 to 100 agents
- How MCP pattern prevents M×N integration complexity

