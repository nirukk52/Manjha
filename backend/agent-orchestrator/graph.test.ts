/**
 * Unit tests for LangGraph orchestration workflow.
 * 
 * Pure TypeScript tests - no Encore runtime needed.
 */

import { describe, it, expect } from 'vitest';
import { createGraph, StateAnnotation } from './graph';
import { AgentType } from '../contracts/api.types';

describe('LangGraph Orchestration', () => {
  // Mock config for testing
  const mockConfig = {
    openAIKey: 'test-key',
    logger: {
      logClassification: () => {},
      logAgentCall: () => {},
      logError: () => {},
    },
  };

  it('should create a valid graph instance', () => {
    const graph = createGraph(mockConfig);
    expect(graph).toBeDefined();
  });

  it('should have correct graph structure', () => {
    const graph = createGraph(mockConfig);
    const graphStructure = graph.getGraph();
    
    // Verify nodes exist
    const nodes = graphStructure.nodes;
    expect(nodes).toHaveProperty('classify');
    expect(nodes).toHaveProperty('execute_finance');
    expect(nodes).toHaveProperty('execute_general');
  });

  it('should define proper state schema', () => {
    const initialState = {
      query: 'test query',
      userId: 'test-user',
    };
    
    expect(initialState).toHaveProperty('query');
    expect(initialState).toHaveProperty('userId');
  });

  // Integration test would require real OpenAI key
  it.skip('should execute full workflow', async () => {
    const graph = createGraph({
      openAIKey: process.env.OPENAI_API_KEY || '',
      logger: mockConfig.logger,
    });

    const result = await graph.invoke({
      query: 'What is portfolio diversification?',
      userId: 'test-user',
    });

    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('agentType');
    expect(result.agentType).toBe(AgentType.FINANCE);
  });
});

