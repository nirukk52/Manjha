# Encore.ts Service Patterns for Manjha

This reference documents established patterns for creating and organizing Encore.ts services in Manjha.

## Service Structure

Every Encore.ts service follows this structure:

```
service-name/
├── encore.service.ts  # Service definition & registration
├── [service-name].ts  # Business logic & API endpoints
├── db.ts             # Database operations (if needed)
└── migrations/       # SQL migrations (if needed)
    ├── 001_create_table.up.sql
    └── 002_add_column.up.sql
```

## Service Definition Pattern

### encore.service.ts

Every service starts with this file:

```typescript
/**
 * [Service Name] Service
 * 
 * [Brief description of what this service does]
 * 
 * Why this service exists: [Explain the business purpose]
 */

import { Service } from "encore.dev/service";

export default new Service("service-name");
```

**Example from chat-gateway:**

```typescript
/**
 * Chat Gateway Service
 * 
 * This service acts as the entry point for all chat interactions.
 * It handles message routing, classification, and streaming responses.
 * 
 * Why this service exists: Provides a unified API for the frontend to send
 * messages and receive real-time agent responses via Server-Sent Events.
 */

import { Service } from "encore.dev/service";

export default new Service("chat-gateway");
```

## API Endpoint Patterns

### Basic POST Endpoint

```typescript
import { api } from "encore.dev/api";
import type { RequestPayload, ResponsePayload } from "../contracts/api.types";

/**
 * PURPOSE: Explain why this endpoint exists in the codebase
 */
export const endpointName = api(
  { method: "POST", path: "/path", expose: true, auth: false },
  async (payload: RequestPayload): Promise<ResponsePayload> => {
    // Implementation
    return result;
  }
);
```

### Endpoint with Validation

```typescript
/**
 * Sends a chat message and returns routing information.
 * 
 * Why this exists: Entry point for all user messages, handles validation
 * and routing before agent processing.
 */
export const send = api(
  { method: "POST", path: "/chat/send", expose: true, auth: false },
  async (req: ChatMessageRequest): Promise<ChatMessageResponse> => {
    // Validate input
    if (!req.content || req.content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }
    
    if (req.content.length > 5000) {
      throw new Error("Message content exceeds maximum length of 5000 characters");
    }
    
    // Business logic
    const result = await processMessage(req);
    
    return result;
  }
);
```

### Raw Endpoint for Streaming

```typescript
/**
 * Streams agent responses via Server-Sent Events.
 * 
 * Why this exists: Enables real-time progressive response rendering in UI
 */
export const stream = api.raw(
  { expose: true, path: "/chat/stream/:messageId", method: "GET" },
  async (req, resp) => {
    const messageId = req.params.messageId;
    
    // Set SSE headers
    resp.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    
    // Stream data
    for await (const chunk of generateResponse(messageId)) {
      resp.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    
    resp.end();
  }
);
```

## Service Communication Patterns

### Calling Other Services

```typescript
import * as classifier from "~encore/clients/message-classifier";
import * as financeAgent from "~encore/clients/finance-agent";
import { AgentType } from "../contracts/api.types";

export const send = api(
  { method: "POST", path: "/chat/send", expose: true },
  async (req: ChatMessageRequest): Promise<ChatMessageResponse> => {
    // Call message-classifier service
    const classification = await classifier.classify({
      content: req.content,
    });
    
    // Route to appropriate agent based on classification
    if (classification.agentType === AgentType.FINANCE) {
      const response = await financeAgent.analyze({
        question: req.content,
        userId: req.userId ?? 'anonymous',
      });
      return formatResponse(response);
    }
    
    // ... handle other cases
  }
);
```

## Database Patterns

### Database Connection Setup

```typescript
/**
 * Database connection for [service-name] service.
 * 
 * Why this exists: Provides type-safe database access using Encore's SQLDatabase
 */

import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * The main database for the [service-name] service.
 * 
 * Encore automatically provisions and manages this database across
 * all environments (local, staging, production).
 */
export const db = new SQLDatabase("database-name", {
  migrations: "./migrations",
});
```

### Database Query Patterns

```typescript
// Query multiple rows
const rows = await db.query<RowType>`
  SELECT column1, column2, created_at
  FROM table_name
  WHERE condition = ${value}
  ORDER BY created_at DESC
`;

const results = [];
for await (const row of rows) {
  results.push(row);
}

// Query single row
const row = await db.queryRow<RowType>`
  SELECT * FROM table_name WHERE id = ${id}
`;

if (!row) {
  throw new Error("Not found");
}

// Insert/Update (no return value)
await db.exec`
  INSERT INTO table_name (column1, column2)
  VALUES (${value1}, ${value2})
`;

// Transaction pattern
await db.exec`BEGIN`;
try {
  await db.exec`INSERT INTO table1 VALUES (...)`;
  await db.exec`INSERT INTO table2 VALUES (...)`;
  await db.exec`COMMIT`;
} catch (error) {
  await db.exec`ROLLBACK`;
  throw error;
}
```

## Error Handling Patterns

### Standard Error Pattern

```typescript
import { logger } from "../common/logging/logger";

export const endpoint = api(
  { method: "POST", path: "/endpoint" },
  async (req: Request): Promise<Response> => {
    try {
      const result = await processRequest(req);
      
      logger.info("Request processed successfully", { 
        requestId: req.id,
        userId: req.userId 
      });
      
      return { success: true, data: result };
    } catch (error) {
      logger.error("Request processing failed", { 
        error,
        requestId: req.id,
        userId: req.userId 
      });
      
      return {
        success: false,
        error: {
          code: "PROCESSING_ERROR",
          message: error instanceof Error ? error.message : "Unknown error"
        }
      };
    }
  }
);
```

### Validation Error Pattern

```typescript
function validateInput(req: Request): void {
  if (!req.content) {
    throw new Error("Content is required");
  }
  
  if (req.content.length > 5000) {
    throw new Error("Content exceeds maximum length");
  }
  
  if (req.userId && !isValidUserId(req.userId)) {
    throw new Error("Invalid user ID format");
  }
}

export const endpoint = api(
  { method: "POST", path: "/endpoint" },
  async (req: Request): Promise<Response> => {
    // Validate early
    validateInput(req);
    
    // Process request
    // ...
  }
);
```

## Agent Patterns

### Agent Service Structure

```typescript
/**
 * [Agent Name] Agent
 * 
 * Why this exists: [Explain what queries this agent handles]
 */

import { ChatOpenAI } from "@langchain/openai";
import { secret } from "encore.dev/config";
import { AGENT_CONFIG } from "../common/config/constants";
import { logger } from "../common/logging/logger";

const openAIKey = secret("OpenAIApiKey");

export const respond = api(
  { method: "POST", path: "/agent/respond" },
  async (req: AgentRequest): Promise<AgentResponse> => {
    const startTime = performance.now();
    
    try {
      const llm = new ChatOpenAI({
        modelName: AGENT_CONFIG.MODEL_NAME,
        openAIApiKey: openAIKey(),
        temperature: AGENT_CONFIG.TEMPERATURE,
        maxTokens: AGENT_CONFIG.MAX_TOKENS,
      });
      
      const response = await llm.invoke(buildPrompt(req));
      const processingTimeMs = Math.round(performance.now() - startTime);
      
      logger.info("Agent response generated", {
        agentType: "agent-name",
        processingTimeMs,
        userId: req.userId,
      });
      
      return {
        answer: response.content.toString(),
        processingTimeMs,
      };
    } catch (error) {
      logger.error("Agent failed to generate response", {
        error,
        agentType: "agent-name",
        userId: req.userId,
      });
      throw error;
    }
  }
);
```

## Logging Patterns

### Standard Logging

```typescript
import { logger } from "../common/logging/logger";

// Info level - normal operations
logger.info("Operation completed", {
  operationType: "classification",
  latencyMs: 150,
  userId: "user123",
});

// Error level - with full context
logger.error("Operation failed", {
  error,
  operationType: "agent_call",
  userId: "user123",
  requestId: "req-abc",
});

// Debug level - development only
logger.debug("Detailed state", {
  state,
  step: "validation",
});
```

## Configuration Patterns

### Using Constants

```typescript
import { AGENT_CONFIG } from "../common/config/constants";

// Access configuration values
const model = AGENT_CONFIG.FINANCE_MODEL;
const maxTokens = AGENT_CONFIG.FINANCE_MAX_TOKENS;
const temperature = AGENT_CONFIG.TEMPERATURE;
```

### Using Secrets

```typescript
import { secret } from "encore.dev/config";

// Define secret
const openAIKey = secret("OpenAIApiKey");

// Use secret in code
const llm = new ChatOpenAI({
  openAIApiKey: openAIKey(), // Call as function
  // ...
});
```

## Type Safety Patterns

### Enum Usage

```typescript
// Define enum in contracts
export enum AgentType {
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL',
}

// Use enum in code
function routeToAgent(type: AgentType): AgentResponse {
  switch (type) {
    case AgentType.FINANCE:
      return handleFinance();
    case AgentType.GENERAL:
      return handleGeneral();
    default:
      // TypeScript ensures exhaustive checking
      const _exhaustive: never = type;
      throw new Error(`Unhandled agent type: ${type}`);
  }
}
```

### Strongly-Typed Responses

```typescript
// Define types in contracts
export interface AgentResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTimeMs: number;
}

// Return typed response
export const respond = api(
  { method: "POST", path: "/respond" },
  async (req: Request): Promise<AgentResponse> => {
    return {
      answer: "...",
      confidence: 0.95,
      sources: ["source1", "source2"],
      processingTimeMs: 1500,
    };
  }
);
```

## File Organization Rules

- **No nesting services** - Services live at backend root level
- **One file per concern** - Separate API, DB, and business logic
- **Shared code** - Use `common/` directory for shared modules
- **Contracts** - All shared types in `contracts/` directory

