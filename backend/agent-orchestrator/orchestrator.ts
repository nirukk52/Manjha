/**
 * Orchestrator API endpoint for executing multi-agent workflows.
 * 
 * INFRASTRUCTURE LAYER - Encore-specific code.
 * Injects dependencies into pure agent logic.
 */

import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { createGraph, runOrchestration } from "./graph.js";
import { AgentType } from "../contracts/api.types.js";
import { logError, logClassification, logAgentCall } from "../common/logging/logger.js";

// Encore secret management
const openAIKey = secret("OpenAIApiKey");

/**
 * Request payload for orchestration.
 */
export interface OrchestrationRequest {
  /** The user's query */
  query: string;
  /** User identifier */
  userId: string;
}

/**
 * Response from orchestration workflow.
 */
export interface OrchestrationResponse {
  /** The agent's response */
  response: string;
  /** Which agent was used */
  agentType: AgentType;
  /** Confidence in the routing decision */
  confidence: number;
  /** Total processing time */
  processingTimeMs: number;
}

/**
 * Executes a multi-agent workflow for complex queries.
 * 
 * @param req - Orchestration request
 * @returns Final response after workflow completion
 * 
 * Why this endpoint exists: Enables advanced multi-step agent coordination
 * for sophisticated financial research (future enhancement).
 */
export const orchestrate = api(
  { method: "POST", expose: false },
  async (req: OrchestrationRequest): Promise<OrchestrationResponse> => {
    try {
      // Dependency injection: Create graph with Encore-managed dependencies
      const graph = createGraph({
        openAIKey: openAIKey(),
        logger: {
          logClassification: (agentType: AgentType, confidence: number, query: string) => {
            logClassification({ agentType, confidence, reasoning: 'LangGraph', latencyMs: 0 });
          },
          logAgentCall,
          logError,
        },
      });
      
      // Run pure agent logic
      const result = await runOrchestration(graph, {
        query: req.query,
        userId: req.userId,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return {
        response: result.response ?? "Unable to generate response",
        agentType: result.agentType ?? AgentType.GENERAL,
        confidence: result.confidence ?? 0.5,
        processingTimeMs: result.processingTimeMs ?? 0,
      };
      
    } catch (error) {
      logError('ORCHESTRATION_ERROR', 'Workflow failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query_preview: req.query.slice(0, 100),
      });
      
      throw new Error('Orchestration failed');
    }
  }
);
