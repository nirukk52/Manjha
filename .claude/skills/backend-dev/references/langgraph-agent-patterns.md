# LangGraph Agent Orchestration Patterns for Manjha

This reference documents patterns for building multi-agent workflows using LangGraph in Manjha's backend.

## Overview

Manjha uses LangGraph for orchestrating multi-agent financial research workflows. LangGraph provides:
- State management across agent steps
- Conditional routing between agents
- Type-safe workflow definitions
- Error handling and retries

## Basic Workflow Structure

```typescript
/**
 * LangGraph workflow for multi-agent [purpose].
 * 
 * Workflow:
 * 1. STEP_ONE - [Description]
 * 2. STEP_TWO - [Description]
 * 3. STEP_THREE - [Description]
 */

import { ChatOpenAI } from "@langchain/openai";
import { secret } from "encore.dev/config";
import { AGENT_CONFIG } from "../common/config/constants";
import { logger } from "../common/logging/logger";

const openAIKey = secret("OpenAIApiKey");

/**
 * State interface for the workflow.
 * 
 * Why this exists: Type-safe state management through the workflow
 */
export interface WorkflowState {
  /** Input field */
  input: string;
  /** Intermediate results */
  intermediate?: string;
  /** Final output */
  output?: string;
  /** Error tracking */
  error?: string;
}
```

## State Management Pattern

### State Interface Definition

```typescript
/**
 * State interface for the orchestration workflow.
 * 
 * Why this exists: Type-safe state management through the orchestration workflow
 */
export interface OrchestrationState {
  /** The user's original query */
  query: string;
  /** User identifier */
  userId: string;
  /** Classification result */
  agentType?: AgentType;
  /** Classification confidence */
  confidence?: number;
  /** Final agent response */
  response?: string;
  /** Processing errors */
  error?: string;
  /** Total processing time */
  processingTimeMs?: number;
}
```

### State Transition Functions

Each step in the workflow is a function that takes state and returns updated state:

```typescript
/**
 * Classifies the user query to determine routing.
 * 
 * @param state - Current workflow state
 * @returns Updated state with classification
 */
async function classifyQuery(
  state: OrchestrationState
): Promise<OrchestrationState> {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIKey(),
    temperature: 0.3,
  });
  
  const prompt = `Classify this query as FINANCE or GENERAL:
Query: "${state.query}"

FINANCE: portfolio, P&L, risk, stocks, investments, trading, financial analysis
GENERAL: greetings, help, non-finance topics

Respond with only: FINANCE or GENERAL`;

  const result = await llm.invoke(prompt);
  const classification = result.content.toString().toUpperCase().includes('FINANCE') 
    ? AgentType.FINANCE 
    : AgentType.GENERAL;
  
  logger.info("Query classified", {
    agentType: classification,
    confidence: 0.8,
    query: state.query,
  });
  
  // Return updated state (immutable pattern)
  return {
    ...state,
    agentType: classification,
    confidence: 0.8,
  };
}
```

## Agent Execution Pattern

### Agent with LLM Integration

```typescript
/**
 * Executes the appropriate agent based on classification.
 * 
 * @param state - Current workflow state
 * @returns Updated state with response
 */
async function executeAgent(
  state: OrchestrationState
): Promise<OrchestrationState> {
  const startTime = performance.now();
  
  // Configure LLM based on agent type
  const isFinance = state.agentType === AgentType.FINANCE;
  const modelName = isFinance 
    ? AGENT_CONFIG.FINANCE_MODEL 
    : AGENT_CONFIG.GENERAL_MODEL;
  const maxTokens = isFinance 
    ? AGENT_CONFIG.FINANCE_MAX_TOKENS 
    : AGENT_CONFIG.GENERAL_MAX_TOKENS;
  
  const llm = new ChatOpenAI({
    modelName,
    openAIApiKey: openAIKey(),
    temperature: AGENT_CONFIG.TEMPERATURE,
    maxTokens,
  });
  
  // Build agent-specific prompt
  const systemPrompt = isFinance
    ? `You are a senior financial analyst. Provide detailed analysis for this query:

${state.query}

Note: This is MVP mode - provide analysis based on general financial knowledge. 
Acknowledge when specific portfolio data would be needed for more precise answers.`
    : `You are a helpful assistant. Provide a brief, friendly response (under 50 words):

${state.query}`;

  // Execute LLM call
  const result = await llm.invoke(systemPrompt);
  const response = result.content.toString();
  const processingTimeMs = Math.round(performance.now() - startTime);
  
  // Log metrics
  logger.info("Agent execution completed", {
    agentType: state.agentType ?? AgentType.GENERAL,
    processingTimeMs,
    success: true,
  });
  
  // Return updated state
  return {
    ...state,
    response,
    processingTimeMs,
  };
}
```

## Workflow Orchestration Pattern

### Main Orchestration Function

```typescript
/**
 * Executes the full orchestration workflow.
 * 
 * @param initialState - Starting state
 * @returns Final state with response
 * 
 * Why this exists: Coordinates multi-agent workflow for complex queries
 */
export async function runOrchestration(
  initialState: OrchestrationState
): Promise<OrchestrationState> {
  try {
    // Step 1: Classify
    const classified = await classifyQuery(initialState);
    
    // Step 2: Execute
    const executed = await executeAgent(classified);
    
    // Step 3: Could add more steps (validation, enrichment, etc.)
    
    return executed;
  } catch (error) {
    logger.error("Orchestration failed", {
      error,
      query: initialState.query,
    });
    
    return {
      ...initialState,
      error: error instanceof Error ? error.message : 'Unknown error',
      response: 'Unable to generate response',
    };
  }
}
```

## Conditional Routing Pattern

### Router Function

```typescript
/**
 * Routes to different agents based on classification confidence.
 * 
 * @param state - Current workflow state
 * @returns Next step in workflow
 */
function routeAgent(state: OrchestrationState): string {
  // Check confidence threshold
  if (!state.confidence || state.confidence < 0.5) {
    return "human_review";  // Low confidence → escalate
  }
  
  // Route based on classification
  switch (state.agentType) {
    case AgentType.FINANCE:
      return "finance_agent";
    case AgentType.GENERAL:
      return "general_agent";
    default:
      return "fallback_agent";
  }
}

// Use in workflow
async function orchestrate(state: OrchestrationState): Promise<OrchestrationState> {
  const classified = await classifyQuery(state);
  const nextStep = routeAgent(classified);
  
  // Execute appropriate agent based on routing
  switch (nextStep) {
    case "finance_agent":
      return await executeFinanceAgent(classified);
    case "general_agent":
      return await executeGeneralAgent(classified);
    case "human_review":
      return await escalateToHuman(classified);
    default:
      return await executeFallback(classified);
  }
}
```

## Multi-Step Research Pattern

### Research Workflow (Future Enhancement)

```typescript
/**
 * State for multi-step financial research workflow.
 */
export interface ResearchState extends OrchestrationState {
  /** Research plan generated by planner agent */
  plan?: ResearchPlan;
  /** Search results from search agent */
  searchResults?: SearchResult[];
  /** Analysis from financial analyst agent */
  analysis?: FinancialAnalysis;
  /** Verification status from verifier agent */
  verified?: boolean;
  /** Final report from writer agent */
  report?: string;
}

/**
 * Multi-agent research workflow.
 * 
 * Workflow:
 * 1. PLANNER - Creates research plan
 * 2. SEARCHER - Gathers data
 * 3. ANALYST - Analyzes findings
 * 4. VERIFIER - Validates results
 * 5. WRITER - Generates final report
 */
async function runResearchWorkflow(
  initialState: ResearchState
): Promise<ResearchState> {
  let state = initialState;
  
  // Step 1: Planning
  state = await plannerAgent(state);
  if (state.error) return state;
  
  // Step 2: Search
  state = await searchAgent(state);
  if (state.error) return state;
  
  // Step 3: Analysis
  state = await analystAgent(state);
  if (state.error) return state;
  
  // Step 4: Verification
  state = await verifierAgent(state);
  if (state.error) return state;
  
  // Step 5: Writing
  state = await writerAgent(state);
  
  return state;
}
```

## Error Handling Pattern

### Graceful Degradation

```typescript
async function executeWithFallback(
  state: OrchestrationState
): Promise<OrchestrationState> {
  try {
    // Try primary agent
    return await executePrimaryAgent(state);
  } catch (primaryError) {
    logger.warn("Primary agent failed, trying fallback", {
      error: primaryError,
      query: state.query,
    });
    
    try {
      // Try fallback agent
      return await executeFallbackAgent(state);
    } catch (fallbackError) {
      logger.error("Both agents failed", {
        primaryError,
        fallbackError,
        query: state.query,
      });
      
      // Return error state
      return {
        ...state,
        error: "Unable to process query",
        response: "I'm having trouble processing your request. Please try again.",
      };
    }
  }
}
```

### Retry Pattern

```typescript
async function executeWithRetry(
  state: OrchestrationState,
  maxRetries: number = 3
): Promise<OrchestrationState> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug("Attempting agent execution", {
        attempt,
        maxRetries,
        query: state.query,
      });
      
      return await executeAgent(state);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logger.warn("Agent execution failed", {
        attempt,
        maxRetries,
        error: lastError,
      });
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries failed
  return {
    ...state,
    error: lastError?.message ?? "Unknown error",
    response: "Unable to generate response after multiple attempts",
  };
}
```

## Logging and Metrics Pattern

### Comprehensive Logging

```typescript
async function trackedExecution(
  state: OrchestrationState
): Promise<OrchestrationState> {
  const startTime = performance.now();
  const operationId = randomUUID();
  
  logger.info("Starting agent execution", {
    operationId,
    agentType: state.agentType,
    userId: state.userId,
  });
  
  try {
    const result = await executeAgent(state);
    const durationMs = Math.round(performance.now() - startTime);
    
    logger.info("Agent execution completed", {
      operationId,
      agentType: state.agentType,
      durationMs,
      success: true,
    });
    
    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    
    logger.error("Agent execution failed", {
      operationId,
      agentType: state.agentType,
      durationMs,
      error,
    });
    
    throw error;
  }
}
```

## Configuration Pattern

### Agent Configuration

From `common/config/constants.ts`:

```typescript
/**
 * Agent configuration for LLM models and parameters.
 * 
 * Why this exists: Centralized agent behavior configuration
 */
export const AGENT_CONFIG = {
  // Finance Agent - More capable model for complex analysis
  FINANCE_MODEL: "gpt-4-turbo-preview",
  FINANCE_MAX_TOKENS: 2000,
  FINANCE_TEMPERATURE: 0.3,
  
  // General Agent - Faster model for simple queries
  GENERAL_MODEL: "gpt-3.5-turbo",
  GENERAL_MAX_TOKENS: 500,
  GENERAL_TEMPERATURE: 0.7,
  
  // Classification
  CLASSIFICATION_MODEL: "gpt-3.5-turbo",
  CLASSIFICATION_TEMPERATURE: 0.3,
  
  // Timeouts
  AGENT_TIMEOUT_MS: 30000,
  CLASSIFICATION_TIMEOUT_MS: 5000,
} as const;
```

## Integration with Encore Pattern

### Exposing Workflow as API

```typescript
import { api } from "encore.dev/api";
import { runOrchestration, OrchestrationState } from "./graph";

interface OrchestrateRequest {
  query: string;
  userId: string;
}

interface OrchestrateResponse {
  response: string;
  agentType: AgentType;
  confidence: number;
  processingTimeMs: number;
}

/**
 * Orchestrates multi-agent workflow for a user query.
 * 
 * Why this exists: Provides API endpoint for LangGraph orchestration
 */
export const orchestrate = api(
  { method: "POST", path: "/orchestrate", expose: true },
  async (req: OrchestrateRequest): Promise<OrchestrateResponse> => {
    const initialState: OrchestrationState = {
      query: req.query,
      userId: req.userId,
    };
    
    const finalState = await runOrchestration(initialState);
    
    if (finalState.error) {
      throw new Error(finalState.error);
    }
    
    return {
      response: finalState.response ?? "",
      agentType: finalState.agentType ?? AgentType.GENERAL,
      confidence: finalState.confidence ?? 0,
      processingTimeMs: finalState.processingTimeMs ?? 0,
    };
  }
);
```

## Best Practices

1. **Immutable State**: Always return new state objects, never mutate
2. **Type Safety**: Use strong types for all state fields
3. **Logging**: Log at each workflow step for observability
4. **Error Handling**: Handle errors gracefully with fallbacks
5. **Performance**: Track execution time for each agent
6. **Separation**: Keep workflow logic separate from business logic
7. **Testing**: Test each agent function independently before integration

