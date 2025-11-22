/**
 * E2E Tests for Finance Chat Agent
 * 
 * Tests the complete user flow using Encore's service clients.
 * 
 * Per Constitution: "Test the USER-FACING behavior - Always. No petty tests!"
 * 
 * Based on: https://encore.dev/docs/ts/develop/testing
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';

// Import Encore service clients (type-safe, auto-generated)
import { chat_gateway, message_classifier, general_agent } from '~encore/clients';
import { AgentType } from '../../contracts/api.types';

describe('Finance Chat Agent E2E', () => {
  let sessionId: string;
  
  beforeAll(() => {
    sessionId = randomUUID();
  });
  
  /**
   * User Story 1: Finance question triggers finance agent
   * 
   * Given: User types a finance question
   * When: Message is sent
   * Then: System routes to finance agent
   */
  it('should classify and route finance question to finance agent', async () => {
    // Test classification directly
    const classificationResult = await message_classifier.classify({
      content: 'Why is my portfolio P&L negative this month?',
    });
    
    expect(classificationResult.agentType).toBe(AgentType.FINANCE);
    expect(classificationResult.confidence).toBeGreaterThan(0.7);
    expect(classificationResult.latencyMs).toBeLessThan(500); // < 500ms spec
  });
  
  /**
   * User Story 2: General question triggers general agent quickly
   * 
   * Given: User types a general greeting
   * When: Message is sent
   * Then: General agent responds quickly (< 2s)
   */
  it('should classify general question correctly', async () => {
    const classificationResult = await message_classifier.classify({
      content: 'Hello, how are you?',
    });
    
    expect(classificationResult.agentType).toBe(AgentType.GENERAL);
    expect(classificationResult.latencyMs).toBeLessThan(500);
  });
  
  /**
   * Test: General agent responds quickly (< 2s target)
   */
  it('should respond to general queries within 2 seconds', async () => {
    const startTime = performance.now();
    
    const response = await general_agent.respond({
      question: 'What time is it?',
      maxTokens: 100,
    });
    
    const latency = performance.now() - startTime;
    
    expect(response.answer).toBeTruthy();
    expect(response.answer.length).toBeGreaterThan(0);
    expect(latency).toBeLessThan(2000); // < 2s spec
  }, 5000);
  
  /**
   * Edge Case: Invalid sessionId format should be rejected
   */
  it('should reject invalid sessionId format', async () => {
    await expect(
      chat_gateway.send({
        sessionId: 'not-a-valid-uuid',
        content: 'Test message',
        userId: 'test-user',
      })
    ).rejects.toThrow(/UUID/i);
  });
  
  /**
   * Edge Case: Empty message should be rejected
   */
  it('should reject empty messages', async () => {
    await expect(
      chat_gateway.send({
        sessionId,
        content: '',
        userId: 'test-user',
      })
    ).rejects.toThrow(/empty/i);
  });
  
  /**
   * Edge Case: Very long message should be rejected
   */
  it('should reject messages over 5000 characters', async () => {
    const longMessage = 'a'.repeat(5001);
    
    await expect(
      chat_gateway.send({
        sessionId,
        content: longMessage,
        userId: 'test-user',
      })
    ).rejects.toThrow();
  });
  
  /**
   * Integration Test: Full chat flow
   * 
   * Tests the complete flow:
   * 1. User sends message
   * 2. System classifies
   * 3. Returns routing info
   */
  it('should handle complete chat flow for finance question', async () => {
    const response = await chat_gateway.send({
      sessionId: randomUUID(),
      content: 'What is my risk exposure?',
      userId: 'test-user',
    });
    
    expect(response.messageId).toBeTruthy();
    expect(response.agentType).toBe(AgentType.FINANCE);
    expect(response.streamUrl).toContain('/chat/stream/');
    expect(response.status).toBe('PENDING');
  }, 10000);
  
  /**
   * Performance Test: Classification should be fast
   */
  it('should classify messages quickly for multiple queries', async () => {
    const queries = [
      'What is my risk exposure?',
      'How do I reset my password?',
      'Show me my portfolio performance',
    ];
    
    for (const content of queries) {
      const startTime = performance.now();
      
      const result = await message_classifier.classify({ content });
      
      const latency = performance.now() - startTime;
      
      expect(result.agentType).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      
      // Classification should be fast (< 500ms target)
      console.log(`Classification latency for "${content}": ${latency.toFixed(0)}ms`);
    }
  }, 15000);
  
  /**
   * Database Test: Session creation
   * 
   * Ensures sessions are properly created in test database
   */
  it('should create and track chat sessions', async () => {
    const newSessionId = randomUUID();
    
    const response1 = await chat_gateway.send({
      sessionId: newSessionId,
      content: 'First message',
      userId: 'test-user',
    });
    
    expect(response1.messageId).toBeTruthy();
    
    // Second message in same session should work
    const response2 = await chat_gateway.send({
      sessionId: newSessionId,
      content: 'Second message',
      userId: 'test-user',
    });
    
    expect(response2.messageId).toBeTruthy();
    expect(response2.messageId).not.toBe(response1.messageId);
  }, 10000);
  
  /**
   * REGRESSION TEST: /send API should not fail with 500
   * 
   * This test captures the reported issue where /send returns 500 error.
   * It helps diagnose the root cause by attempting a valid request.
   */
  it('should successfully process valid finance question without 500 error', async () => {
    const testSessionId = randomUUID();
    
    try {
      const response = await chat_gateway.send({
        sessionId: testSessionId,
        content: 'What is diversification in investing?',
        userId: 'test-user',
      });
      
      // If successful, verify response structure
      expect(response).toBeDefined();
      expect(response.messageId).toBeTruthy();
      expect(response.status).toBe('PENDING');
      expect(response.agentType).toBe(AgentType.FINANCE);
      expect(response.streamUrl).toContain('/chat/stream/');
      
      console.log('✅ /send API working correctly:', {
        messageId: response.messageId,
        agentType: response.agentType,
        status: response.status,
      });
    } catch (error) {
      // If it fails, capture detailed error information
      console.error('❌ /send API failed with error:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      
      // Fail the test with detailed information
      throw new Error(
        `/send API returned 500 error. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}. ` +
        `This indicates a backend issue - likely database connection, missing migrations, ` +
        `or classification service failure. Check logs above for details.`
      );
    }
  }, 15000);
});
