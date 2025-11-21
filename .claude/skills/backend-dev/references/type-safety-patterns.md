# Type Safety Patterns for Manjha

> "You're working with a Kotlin engineer who values strong typing, enums, and zero tolerance for `any` types."
> — Manjha Constitution

This reference documents the type safety patterns enforced in Manjha's backend.

## The Zero-Any Rule

**Absolutely NO `any` types are allowed in the codebase.**

This is enforced by:
1. ESLint configuration
2. TypeScript strict mode
3. Code review
4. Pre-commit hooks

## Contract-Driven Development

All shared types live in `/backend/contracts/`:

```
contracts/
├── api.types.ts       # API request/response types
└── database.types.ts  # Database schema types
```

### api.types.ts Structure

```typescript
/**
 * API contracts shared between frontend and backend.
 * 
 * These types define the communication protocol for all services.
 * All types are strongly-typed with zero `any` usage.
 */

/**
 * Enum representing [what it represents]
 * 
 * Why this exists: [Business purpose]
 */
export enum TypeName {
  VALUE_ONE = 'VALUE_ONE',
  VALUE_TWO = 'VALUE_TWO',
}

/**
 * Request payload for [operation]
 * 
 * Why this exists: Type-safe contract for [purpose]
 */
export interface RequestType {
  /** Field documentation */
  fieldName: string;
  /** Optional field documentation */
  optionalField?: number;
}

/**
 * Response payload from [operation]
 * 
 * Why this exists: [Business purpose]
 */
export interface ResponseType {
  /** Field documentation */
  result: string;
  /** Timestamp when operation completed */
  timestamp: Date;
}
```

## Enum Patterns

### Why Enums Over String Unions

❌ **BAD - String unions:**
```typescript
type AgentType = 'finance' | 'general';  // Not type-safe enough
```

✅ **GOOD - Enums:**
```typescript
/**
 * Enum representing the type of agent handling a user query.
 * 
 * Why this exists: Enables intelligent routing based on query classification
 */
export enum AgentType {
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL',
}
```

### Exhaustive Enum Checking

```typescript
function handleAgent(type: AgentType): Response {
  switch (type) {
    case AgentType.FINANCE:
      return handleFinance();
    case AgentType.GENERAL:
      return handleGeneral();
    default:
      // This line ensures TypeScript catches missing cases
      const _exhaustive: never = type;
      throw new Error(`Unhandled agent type: ${type}`);
  }
}
```

### Enum Usage in APIs

```typescript
import { AgentType } from "../contracts/api.types";

interface ClassificationResult {
  agentType: AgentType;  // Not string!
  confidence: number;
}

export const classify = api(
  { method: "POST", path: "/classify" },
  async (req: Request): Promise<ClassificationResult> => {
    // Return enum value
    return {
      agentType: AgentType.FINANCE,
      confidence: 0.95,
    };
  }
);
```

## Interface Patterns

### Mandatory Field Documentation

Every interface field must have a comment explaining its purpose:

```typescript
/**
 * Represents a single message in the chat conversation.
 * 
 * Why this exists: Core data model for chat history and UI rendering
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Which session this message belongs to */
  sessionId: string;
  /** Who sent the message */
  sender: 'USER' | 'AGENT';
  /** The message text */
  content: string;
  /** Which agent type was used (if sender is AGENT) */
  agentType?: AgentType;
  /** Current status of the message */
  status: MessageStatus;
  /** When the message was created */
  timestamp: Date;
  /** How long the agent took to respond (if applicable) */
  latencyMs?: number;
  /** Error details if status is ERROR */
  errorDetails?: string;
}
```

### Optional vs Required Fields

Be explicit about optionality:

```typescript
interface Request {
  // Required - no question mark
  userId: string;
  content: string;
  
  // Optional - with question mark AND default behavior documented
  /** Maximum tokens to generate (defaults to 500 if not specified) */
  maxTokens?: number;
  
  /** Conversation history for context-aware responses (empty array if not provided) */
  conversationHistory?: ChatMessage[];
}
```

## Type Guards

### Creating Type Guards

```typescript
/**
 * Type guard to check if an error is an APIError
 */
function isAPIError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'retryable' in error
  );
}

// Usage
try {
  await operation();
} catch (error) {
  if (isAPIError(error)) {
    // TypeScript knows error is ApiError here
    logger.error("API error occurred", {
      code: error.code,
      retryable: error.retryable,
    });
  } else {
    // Handle unknown error
    logger.error("Unknown error", { error });
  }
}
```

### Discriminated Unions

```typescript
/**
 * Stream chunk types using discriminated union pattern
 */
export type StreamChunk =
  | { type: 'DELTA'; content: string }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; error: ApiError };

// Usage with exhaustive checking
function handleChunk(chunk: StreamChunk): void {
  switch (chunk.type) {
    case 'DELTA':
      // TypeScript knows chunk.content exists
      renderContent(chunk.content);
      break;
    case 'COMPLETE':
      finishStream();
      break;
    case 'ERROR':
      // TypeScript knows chunk.error exists
      handleError(chunk.error);
      break;
    default:
      const _exhaustive: never = chunk;
      throw new Error('Unhandled chunk type');
  }
}
```

## Generic Type Patterns

### Generic Response Wrapper

```typescript
/**
 * Generic API response wrapper for consistent response handling
 */
export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Usage
export const getUser = api(
  { method: "GET", path: "/user/:id" },
  async ({ id }: { id: string }): Promise<APIResponse<User>> => {
    try {
      const user = await fetchUser(id);
      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "User not found",
          retryable: false,
        },
      };
    }
  }
);
```

### Utility Types

Use TypeScript's built-in utility types:

```typescript
// Make all fields optional
type PartialUser = Partial<User>;

// Pick specific fields
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

// Omit specific fields
type UserWithoutPassword = Omit<User, 'passwordHash'>;

// Make all fields readonly
type ImmutableUser = Readonly<User>;

// Record type for dictionaries
type UserMap = Record<string, User>;
```

## Function Signature Patterns

### Explicit Return Types

Always specify return types explicitly:

❌ **BAD:**
```typescript
async function processMessage(content: string) {
  // Implicit return type
  return { result: "..." };
}
```

✅ **GOOD:**
```typescript
async function processMessage(content: string): Promise<ProcessingResult> {
  // Explicit return type
  return { result: "..." };
}
```

### Avoid Ambiguous Parameters

❌ **BAD:**
```typescript
function createUser(data: Record<string, any>) {
  // Too vague!
}
```

✅ **GOOD:**
```typescript
interface CreateUserParams {
  email: string;
  name: string;
  role: UserRole;
}

function createUser(data: CreateUserParams): User {
  // Clear and type-safe
}
```

## Database Type Patterns

### Type-Safe Queries

```typescript
// Define row type
interface SessionRow {
  id: string;
  user_id: string;
  created_at: Date;
  last_active: Date;
}

// Use in query
const row = await db.queryRow<SessionRow>`
  SELECT id, user_id, created_at, last_active
  FROM chat_sessions
  WHERE id = ${sessionId}
`;

if (!row) {
  throw new Error("Session not found");
}

// TypeScript knows all fields
logger.info("Session found", {
  sessionId: row.id,
  userId: row.user_id,
  createdAt: row.created_at,
});
```

### Mapping Database Types to API Types

```typescript
// Database type (snake_case from SQL)
interface MessageRow {
  id: string;
  session_id: string;
  content: string;
  sender_type: string;
  created_at: Date;
}

// API type (camelCase for JavaScript)
interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'USER' | 'AGENT';
  timestamp: Date;
}

// Mapper function
function mapRowToMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    content: row.content,
    sender: row.sender_type === 'user' ? 'USER' : 'AGENT',
    timestamp: row.created_at,
  };
}
```

## Error Type Patterns

### Strongly-Typed Errors

```typescript
/**
 * Enum of all possible error codes in the system.
 * 
 * Why this exists: Type-safe error handling and monitoring
 */
export enum ErrorCode {
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  AGENT_TIMEOUT = 'AGENT_TIMEOUT',
  AGENT_ERROR = 'AGENT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_REQUEST = 'INVALID_REQUEST',
}

/**
 * Standardized error response structure.
 * 
 * Why this exists: Consistent error handling across all API endpoints
 */
export interface ApiError {
  /** Error code for programmatic handling */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Whether the request can be safely retried */
  retryable: boolean;
}

// Usage
function createError(code: ErrorCode, message: string): ApiError {
  return {
    code,
    message,
    retryable: code === ErrorCode.NETWORK_ERROR || code === ErrorCode.RATE_LIMIT,
  };
}
```

## State Type Patterns

### LangGraph State Types

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

// State transition function with explicit types
async function classifyQuery(
  state: OrchestrationState
): Promise<OrchestrationState> {
  // Implementation
  return {
    ...state,
    agentType: AgentType.FINANCE,
    confidence: 0.95,
  };
}
```

## Type Safety Checklist

Before committing code, verify:

- [ ] No `any` types anywhere
- [ ] All interfaces defined in `contracts/`
- [ ] Enums used instead of string unions where appropriate
- [ ] Function signatures have explicit return types
- [ ] All interface fields have documentation comments
- [ ] Error types are strongly typed (use ErrorCode enum)
- [ ] Database queries specify row types
- [ ] Linter passes with no type warnings
- [ ] TypeScript strict mode enabled
- [ ] Exhaustive checking for all enums and discriminated unions

## Linter Configuration

Ensure these rules are in your ESLint config:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

