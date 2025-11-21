# E2E Testing Patterns for Manjha Backend

This reference provides concrete testing patterns used in Manjha's backend development.

## Test Philosophy

> "Test the USER-FACING behavior - Always. No petty tests!"
> — Manjha Constitution

- Test complete flows, not implementation details
- Use descriptive names that explain the scenario
- Include PURPOSE comments explaining invariants
- Tests should be independent and idempotent
- Performance targets matter: validate latency requirements

## Test Structure Template

```typescript
/**
 * PURPOSE: Clear statement of what invariants/behaviors are being validated
 * Format: "User did X → System did Y → UI shows Z → Gucci ✓"
 */
describe("Feature Name", () => {
  beforeAll(() => {
    // One-time setup before all tests
  });

  beforeEach(async () => {
    // Setup: Create test data, reset state
  });

  it("validates the happy path flow", async () => {
    // Arrange: Set up preconditions
    // Act: Execute the behavior
    // Assert: Verify outcomes
  });

  it("handles edge case: specific scenario", async () => {
    // Test edge cases and error conditions
  });
});
```

## Concrete Example from Manjha

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'crypto';
import { chat_gateway, message_classifier } from '~encore/clients';
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
    const classificationResult = await message_classifier.classify({
      content: 'Why is my portfolio P&L negative this month?',
    });
    
    expect(classificationResult.agentType).toBe(AgentType.FINANCE);
    expect(classificationResult.confidence).toBeGreaterThan(0.7);
    expect(classificationResult.latencyMs).toBeLessThan(500); // < 500ms spec
  });
});
```

## Test Categories

### 1. User Story Tests
Test complete user flows with Given-When-Then format:

```typescript
/**
 * User Story: General question triggers general agent quickly
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
```

### 2. Performance Tests
Validate latency requirements:

```typescript
it('should respond to general queries within 2 seconds', async () => {
  const startTime = performance.now();
  
  const response = await general_agent.respond({
    question: 'What time is it?',
    maxTokens: 100,
  });
  
  const latency = performance.now() - startTime;
  
  expect(response.answer).toBeTruthy();
  expect(latency).toBeLessThan(2000); // < 2s spec
}, 5000); // Timeout for slow tests
```

### 3. Edge Case Tests
Test boundary conditions and error scenarios:

```typescript
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
```

### 4. Integration Tests
Test multiple services working together:

```typescript
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
}, 10000); // Longer timeout for integration tests
```

### 5. Database Tests
Validate data persistence and consistency:

```typescript
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
```

## Encore-Specific Testing Patterns

### Importing Service Clients
Use Encore's generated clients for type-safe service calls:

```typescript
// Import Encore service clients (auto-generated, uses snake_case naming)
import { chat_gateway, message_classifier, general_agent } from '~encore/clients';

// Then call methods on the imported namespaces:
const result = await message_classifier.classify({ content: 'test' });
const response = await chat_gateway.send({ sessionId, content, userId });
```

**Important**: Encore generates clients with snake_case names (e.g., `chat_gateway`, not `chatGateway` or `chat-gateway`).

### Test Database Setup
Encore automatically provisions test databases. No manual setup needed:

```typescript
// Database operations just work in tests!
it('should persist data', async () => {
  await db.exec`INSERT INTO table VALUES (...)`;
  const result = await db.queryRow`SELECT * FROM table`;
  expect(result).toBeDefined();
});
```

## Running Tests

**CRITICAL: Always use `encore test`**

```bash
cd backend
encore test                 # ONLY correct way - sets up Encore runtime environment
```

**Never use `npm test` directly!** The `encore test` command:
- Sets the `ENCORE_RUNTIME_LIB` environment variable
- Initializes the Encore runtime properly
- Provides proper service client access
- Manages database connections for tests

Using `npm test` will fail with: `Error: The ENCORE_RUNTIME_LIB environment variable is not set.`

## Test Naming Conventions

- **User Story Tests**: `should [behavior] when [condition]`
- **Edge Case Tests**: `should reject [invalid input]`
- **Performance Tests**: `should [action] within [time constraint]`
- **Integration Tests**: `should handle complete [flow name]`

## Common Assertions

```typescript
// Type checks
expect(value).toBeTruthy();
expect(value).toBeDefined();
expect(value).toBe(exactValue);

// Comparisons
expect(number).toBeGreaterThan(0);
expect(number).toBeLessThan(1000);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/pattern/i);

// Async errors
await expect(asyncFunction()).rejects.toThrow(/error message/i);
```

## Performance Logging

Include performance logging for visibility:

```typescript
it('should classify messages quickly for multiple queries', async () => {
  const queries = ['Query 1', 'Query 2', 'Query 3'];
  
  for (const content of queries) {
    const startTime = performance.now();
    const result = await message_classifier.classify({ content });
    const latency = performance.now() - startTime;
    
    console.log(`Classification latency for "${content}": ${latency.toFixed(0)}ms`);
    expect(latency).toBeLessThan(500);
  }
});
```

## Test Invariants Pattern

For complex flows, use invariant validation functions:

```typescript
/**
 * assertFlowInvariant validates critical system guarantees
 */
function assertFlowInvariant(result: FlowResult): void {
  if (!result.messageId) {
    throw new Error("Expected messageId to be present");
  }
  
  if (result.latency > 5000) {
    throw new Error(`Latency ${result.latency}ms exceeds 5s threshold`);
  }
}

it('ensures flow invariants hold', async () => {
  const result = await executeFlow();
  expect(() => assertFlowInvariant(result)).not.toThrow();
});
```

## Timeouts

Set appropriate timeouts for slow operations:

```typescript
// Default timeout is 5000ms (5s)
it('fast test', async () => {
  // ...
}); // Uses default 5s timeout

// Override for slow tests
it('slow integration test', async () => {
  // ...
}, 15000); // 15s timeout
```

