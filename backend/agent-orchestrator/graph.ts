/**
 * LangGraph workflow for multi-agent financial research.
 * 
 * PURE TYPESCRIPT - No framework dependencies.
 * Works with LangGraph Studio, portable, testable anywhere.
 * 
 * Workflow:
 * 1. CLASSIFY - Determine agent routing
 * 2. ROUTE - Conditional routing based on classification
 * 3. EXECUTE_FINANCE / EXECUTE_GENERAL - Run the appropriate agent
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { AgentType } from "../contracts/api.types.js";
import { AGENT_CONFIG } from "../common/config/constants.js";

/**
 * Configuration injected from infrastructure layer.
 * 
 * Dependency injection for portability and testability.
 */
export interface GraphConfig {
  openAIKey: string;
  logger?: {
    logClassification: (agentType: AgentType, confidence: number, query: string) => void;
    logAgentCall: (
      agentType: AgentType,
      query: string,
      processingTimeMs: number,
      success: boolean,
      metadata?: Record<string, unknown>
    ) => void;
    logError: (code: string, message: string, metadata?: Record<string, unknown>) => void;
  };
}

/**
 * State annotation for the orchestration workflow.
 */
export const StateAnnotation = Annotation.Root({
  query: Annotation<string>,
  userId: Annotation<string>,
  agentType: Annotation<AgentType | undefined>,
  confidence: Annotation<number | undefined>,
  response: Annotation<string | undefined>,
  error: Annotation<string | undefined>,
  processingTimeMs: Annotation<number | undefined>,
});

export type OrchestrationState = typeof StateAnnotation.State;

/**
 * Creates the classification node function.
 */
function createClassifyNode(config: GraphConfig) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      openAIApiKey: config.openAIKey,
      temperature: 0.3,
    });

    const startTime = performance.now();
    
    try {
      const prompt = `Classify this query as either "FINANCE" or "GENERAL".
      
Query: "${state.query}"

Respond with ONLY the classification (FINANCE or GENERAL) and a confidence score (0-1).
Format: CLASSIFICATION|CONFIDENCE

Examples:
- "What is portfolio diversification?" -> FINANCE|0.95
- "What's the weather today?" -> GENERAL|0.98`;

      const response = await llm.invoke(prompt);
      const content = typeof response.content === 'string' ? response.content : String(response.content);
      const [classification, confidenceStr] = content.trim().split('|');
      
      const agentType = classification.toUpperCase() as AgentType;
      const confidence = parseFloat(confidenceStr) || 0.5;
      
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      config.logger?.logClassification(agentType, confidence, state.query);
      
      return {
        ...state,
        agentType,
        confidence,
        processingTimeMs,
      };
    } catch (error) {
      return {
        ...state,
        agentType: AgentType.GENERAL,
        confidence: 0.3,
        error: error instanceof Error ? error.message : 'Classification failed',
      };
    }
  };
}

/**
 * Creates the finance agent execution node.
 */
function createFinanceNode(config: GraphConfig) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const llm = new ChatOpenAI({
      modelName: AGENT_CONFIG.FINANCE_MODEL,
      openAIApiKey: config.openAIKey,
      temperature: AGENT_CONFIG.TEMPERATURE,
    });

    const startTime = performance.now();
    
    try {
      const systemPrompt = `You are a senior financial analyst with expertise in portfolio analysis,
risk management, and financial markets. Provide detailed, accurate financial analysis.`;

      const response = await llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: state.query },
      ]);

      const content = typeof response.content === 'string' ? response.content : String(response.content);
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      config.logger?.logAgentCall(AgentType.FINANCE, state.query, processingTimeMs, true);
      
      return {
        ...state,
        response: content,
        processingTimeMs: (state.processingTimeMs ?? 0) + processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      config.logger?.logAgentCall(AgentType.FINANCE, state.query, processingTimeMs, false, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      
      return {
        ...state,
        response: 'Unable to generate finance response',
        error: error instanceof Error ? error.message : 'Finance agent failed',
        processingTimeMs: (state.processingTimeMs ?? 0) + processingTimeMs,
      };
    }
  };
}

/**
 * Creates the general agent execution node.
 */
function createGeneralNode(config: GraphConfig) {
  return async (state: OrchestrationState): Promise<OrchestrationState> => {
    const llm = new ChatOpenAI({
      modelName: AGENT_CONFIG.GENERAL_MODEL,
      openAIApiKey: config.openAIKey,
      temperature: AGENT_CONFIG.TEMPERATURE,
    });

    const startTime = performance.now();
    
    try {
      const systemPrompt = `You are a helpful AI assistant. Provide clear, accurate responses to general queries.`;

      const response = await llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: state.query },
      ]);

      const content = typeof response.content === 'string' ? response.content : String(response.content);
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      config.logger?.logAgentCall(AgentType.GENERAL, state.query, processingTimeMs, true);
      
      return {
        ...state,
        response: content,
        processingTimeMs: (state.processingTimeMs ?? 0) + processingTimeMs,
      };
    } catch (error) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      config.logger?.logAgentCall(AgentType.GENERAL, state.query, processingTimeMs, false, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      
      return {
        ...state,
        response: 'Unable to generate general response',
        error: error instanceof Error ? error.message : 'General agent failed',
        processingTimeMs: (state.processingTimeMs ?? 0) + processingTimeMs,
      };
    }
  };
}

/**
 * Routes to the appropriate agent based on classification.
 */
function routeToAgent(state: OrchestrationState): string {
  if (!state.agentType) {
    return "execute_general";
  }
  
  return state.agentType === AgentType.FINANCE 
    ? "execute_finance" 
    : "execute_general";
}

/**
 * Creates the compiled LangGraph workflow.
 * 
 * PURE FUNCTION - No side effects, fully testable, portable.
 */
export function createGraph(config: GraphConfig) {
  const workflow = new StateGraph(StateAnnotation)
    .addNode("classify", createClassifyNode(config))
    .addNode("execute_finance", createFinanceNode(config))
    .addNode("execute_general", createGeneralNode(config))
    .addEdge(START, "classify")
    .addConditionalEdges("classify", routeToAgent, {
      execute_finance: "execute_finance",
      execute_general: "execute_general",
    })
    .addEdge("execute_finance", END)
    .addEdge("execute_general", END);

  return workflow.compile();
}

/**
 * Runs the orchestration workflow with the given initial state.
 * 
 * PURE FUNCTION - No Encore dependencies.
 */
export async function runOrchestration(
  graph: ReturnType<typeof createGraph>,
  initialState: { query: string; userId: string }
): Promise<OrchestrationState> {
  try {
    const result = await graph.invoke(initialState);
    return result;
  } catch (error) {
    return {
      query: initialState.query,
      userId: initialState.userId,
      agentType: undefined,
      confidence: undefined,
      response: 'Unable to generate response',
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: undefined,
    };
  }
}

/**
 * Default export for LangGraph Studio.
 * Uses environment variable for OpenAI key (no Encore).
 */
export const graph = createGraph({
  openAIKey: process.env.OPENAI_API_KEY || '',
  // No logger for Studio (keeps it simple)
});
