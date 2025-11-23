# Implementation Plan: Zerodha Account Connection

**Branch**: `003-zerodha-account-connect` | **Date**: 2025-11-22 | **Spec**: [spec.md](./spec.md)

## Summary

Implement OAuth-based Zerodha account connection that securely authenticates users, stores their trading credentials, and displays real-time account balance. The feature creates a new `zerodha-auth` Encore service that handles the complete OAuth flow, token management, and session expiry (every ~6 hours). Frontend remains dumb with a simple button trigger and status display, while all intelligence lives in the backend service.

**Key Technical Decisions**:
- Backend-managed OAuth flow (Encore service)
- PostgreSQL for secure token storage with expiry tracking
- Direct Zerodha Kite Connect API integration (v3)
- Token refresh detection and user notification system
- Type-safe contracts with zero `any` types

## Technical Context

**Language/Version**: TypeScript 5.x with Encore.ts framework  
**Primary Dependencies**: 
- `encore.dev/api` - Type-safe API endpoints
- `encore.dev/storage/sqldb` - PostgreSQL database
- `kiteconnect` - Official Zerodha Kite Connect TypeScript library (v5.1.0+)
  - NPM: `npm install kiteconnect@latest`
  - GitHub: https://github.com/zerodha/kiteconnectjs
  - Docs: https://kite.trade/docs/kiteconnectjs/v3/
  - Examples: https://github.com/zerodha/kiteconnectjs/tree/master/examples
  - **TypeScript-first with full type definitions** (perfect for zero `any` types)
- `crypto` (Node.js built-in) - For state parameter generation only (SDK handles checksum)

**Storage**: PostgreSQL via Encore SQLDatabase  
**Testing**: Vitest for unit/integration, E2E tests for OAuth flow  
**Target Platform**: Linux server (Encore Cloud deployment)  
**Project Type**: Web application (backend service + frontend component)

**Performance Goals**: 
- OAuth redirect: < 500ms response time
- Token exchange: < 1s end-to-end
- Balance fetch: < 2s from connected account
- Session check: < 100ms database query

**Constraints**: 
- Zerodha tokens expire at 6 AM next day IST (regulatory requirement, no refresh tokens)
- API rate limits: 3 requests/second per user (Kite Connect)
- Must comply with Zerodha security guidelines
- OAuth callbacks must be HTTPS in production
- Checksum format: SHA-256 of `api_key + request_token + api_secret` (concatenated)

**Scale/Scope**: 
- Initial: 10-50 users (MVP)
- Target: 1,000+ concurrent users
- Token storage: Encrypted at rest
- Session management: Auto-detect expiry

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Incremental, User-Facing First
**PASS**: Feature delivers immediate user value - connect account → see balance. Smallest functional slice that provides real portfolio insight. No infrastructure-only work.

### ✅ II. Spec-Driven, Red-Green-Refactor
**PASS**: Following TDD cycle:
- Spec created (spec.md) ✓
- E2E test will verify: "User clicks Connect → Redirected to Zerodha → Returns → Shows 'Connected' + Balance"
- Red → Green → Refactor workflow

### ✅ III. Strongly Typed, No Compromises
**PASS**: Zero `any` types:
- TypeScript interfaces for OAuth flow
- Enums for connection status (`ConnectionStatus`)
- Explicit types for Zerodha API responses
- Database types mirror API types

### ✅ IV. Agent-as-Service (Modular Intelligence)
**PASS**: Creates independent `zerodha-auth` service:
- Clear boundaries: OAuth handling, token management, balance fetching
- Can be swapped/improved independently
- Other services can import and use via `~encore/clients`

### ✅ V. Discipline Through Code
**PASS**: Security-first approach:
- Tokens encrypted in PostgreSQL
- API secrets in environment variables (never in code)
- HTTPS-only OAuth callbacks in production
- Fail-safe: Block actions if token invalid/expired

### ✅ Backend Standards
**PASS**:
- Encore.ts service architecture ✓
- Common logging module for all operations ✓
- PostgreSQL for state ✓
- External API: Documented rate limits, costs, fallback behavior ✓

### ✅ Frontend Standards
**PASS**:
- Dumb presentation layer ✓
- Button triggers backend OAuth ✓
- Displays status from backend ✓
- Zero business logic ✓

### ✅ File Organization
**PASS**:
- Service in `backend/zerodha-auth/` ✓
- Spec in `specs/003-zerodha-account-connect/` ✓
- No floating files ✓

**CONSTITUTION VERDICT**: ✅ ALL GATES PASSED

## Project Structure

### Documentation (this feature)

```text
specs/003-zerodha-account-connect/
├── spec.md                      # User-facing requirements (COMPLETE)
├── plan.md                      # This file (IN PROGRESS)
├── research.md                  # Phase 0 output (PENDING)
├── data-model.md                # Phase 1 output (PENDING)
├── quickstart.md                # Phase 1 output (PENDING)
├── contracts/                   # Phase 1 output (PENDING)
│   ├── zerodha-api.types.ts    # Zerodha API contracts
│   └── zerodha-db.types.ts     # Database schema types
├── checklists/
│   └── requirements.md          # Spec validation (COMPLETE)
└── tasks.md                     # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── zerodha-auth/                # NEW SERVICE
│   ├── encore.service.ts       # Service definition
│   ├── auth.ts                 # OAuth flow handlers
│   ├── tokens.ts               # Token management logic
│   ├── balance.ts              # Balance fetching logic
│   ├── db.ts                   # Database connection
│   ├── migrations/
│   │   ├── 001_create_zerodha_connections.up.sql
│   │   └── 002_create_zerodha_sessions.up.sql
│   └── zerodha-auth.test.ts    # Integration tests
│
├── contracts/                   # UPDATED
│   ├── api.types.ts            # Add Zerodha types
│   └── database.types.ts       # Add Zerodha DB types
│
├── common/
│   ├── config/
│   │   └── secrets.ts          # Add Zerodha secrets
│   └── logging/
│       └── logger.ts           # Used for all Zerodha operations
│
└── tests/
    └── e2e/
        └── zerodha-connect.test.ts  # E2E OAuth flow test

frontend/
├── components/
│   ├── widget-dashboard.tsx    # UPDATED (Connect button)
│   └── zerodha-status.tsx      # NEW (Connection status display)
│
├── lib/
│   └── api-client.ts           # UPDATED (Add Zerodha endpoints)
│
└── types/
    └── index.ts                # UPDATED (Add Zerodha types)
```

**Structure Decision**: Web application structure with Encore.ts backend service and Next.js frontend. The `zerodha-auth` service is a standalone Encore service following existing patterns (`chat-gateway`, `finance-agent`). Frontend updates are minimal (button + status component) keeping the dumb presentation layer principle.

## Complexity Tracking

> No Constitution violations - this section is not needed.

---

## Phase 0: Research & Design Decisions

### Research Tasks

1. **Zerodha OAuth Flow Deep Dive**
   - Study complete OAuth 2.0 flow for Kite Connect v3
   - Identify security requirements and callback patterns
   - Document token structure and expiry behavior
   - Research best practices for state parameter and CSRF protection

2. **Kite Connect API Integration**
   - Review `kiteconnect` npm package API surface
   - Document rate limits and quota management
   - Identify margin/balance endpoints for account data
   - Research error codes and retry strategies

3. **Token Management Strategy**
   - Design encrypted storage schema for PostgreSQL
   - Plan session expiry detection mechanism
   - Research background job for token validation
   - Define reconnection UX flow

4. **MCP Server Evaluation** (Optional Enhancement)
   - Assess hosted vs self-hosted MCP server
   - Determine if MCP tools provide value for our use case
   - Document decision: Direct API vs MCP abstraction

### Key Design Decisions

#### Decision 1: Direct Kite Connect API Integration
**Rationale**: 
- Full control over OAuth flow and error handling
- Lower latency (direct API calls vs MCP proxy)
- Better alignment with Encore architecture
- Production-quality error handling and logging

**Alternatives Considered**:
- Zerodha MCP server: Adds unnecessary abstraction layer, limits production error handling
- Hosted MCP at mcp.kite.trade: No control over token lifecycle, can't customize for our needs

**Chosen**: Direct integration with `kiteconnect` npm package

#### Decision 2: Backend-Managed OAuth Flow
**Rationale**:
- Frontend stays dumb (constitution requirement)
- Secrets never exposed to browser
- Type-safe token handling in TypeScript
- Centralized logging and monitoring

**Alternatives Considered**:
- Frontend OAuth with localStorage: Violates security and architecture principles
- Hybrid approach: Increases complexity without benefit

**Chosen**: Encore service handles complete OAuth lifecycle

#### Decision 3: PostgreSQL for Token Storage
**Rationale**:
- Encrypted storage at rest
- Atomic updates for token refresh
- Session expiry queries are fast (indexed timestamps)
- Aligns with existing Encore patterns

**Alternatives Considered**:
- Redis/in-memory: Token loss on restart unacceptable
- Encrypted files: No concurrent access support

**Chosen**: PostgreSQL with `zerodha_connections` and `zerodha_sessions` tables

#### Decision 4: Proactive Session Expiry Detection
**Rationale**:
- Better UX than reactive "token expired" errors
- Can notify user before expiry (e.g., 30 min warning)
- Background job checks expiry timestamps

**Alternatives Considered**:
- Reactive detection: Poor UX, surprises users
- No detection: Terrible experience

**Chosen**: Cron job (every 15 min) checks expiry + proactive UI notifications

---

## Phase 1: Data Models & Contracts

### Data Model

#### Entity: ZerodhaConnection
**Purpose**: Represents a user's authenticated link to their Zerodha trading account

**Attributes**:
- `id` (UUID, PK): Unique connection identifier
- `user_id` (string, FK): Manjha user who owns this connection
- `zerodha_user_id` (string): Zerodha user ID from profile API
- `api_key` (string): Zerodha API key (from environment)
- `access_token` (string, encrypted): OAuth access token
- `created_at` (timestamp): When connection was established
- `expires_at` (timestamp): When token expires (~6 hours from created_at)
- `status` (enum): ConnectionStatus (ACTIVE, EXPIRED, REVOKED, ERROR)
- `last_balance_fetch` (timestamp, nullable): Last successful balance fetch
- `error_details` (text, nullable): Last error encountered

**Relationships**:
- One-to-many: User → ZerodhaConnections (user can reconnect multiple times)
- One-to-many: ZerodhaConnection → ZerodhaBalanceHistory

**State Transitions**:
```
ACTIVE → EXPIRED (after ~6 hours)
ACTIVE → REVOKED (user disconnects or revokes from Zerodha)
ACTIVE → ERROR (API errors during balance fetch)
EXPIRED → ACTIVE (user reconnects)
ERROR → ACTIVE (retry succeeds)
```

**Validation Rules**:
- `access_token` must be encrypted before storage
- `expires_at` must be 6 hours from `created_at`
- `status` transitions must be logged for audit

#### Entity: ZerodhaBalanceHistory
**Purpose**: Tracks historical balance data for analytics and caching

**Attributes**:
- `id` (UUID, PK): Unique record identifier
- `connection_id` (UUID, FK): Reference to ZerodhaConnection
- `available_balance` (decimal): Available cash balance
- `used_margin` (decimal): Margin currently in use
- `timestamp` (timestamp): When balance was fetched
- `fetch_latency_ms` (integer): API call latency for monitoring

**Relationships**:
- Many-to-one: ZerodhaBalanceHistory → ZerodhaConnection

**Validation Rules**:
- Balance values must be non-negative
- Timestamp must match server time
- Fetch latency must be > 0

#### Entity: ZerodhaOAuthState
**Purpose**: Temporary storage for OAuth state parameter (CSRF protection)

**Attributes**:
- `state` (string, PK): Random state parameter
- `user_id` (string): User initiating OAuth
- `created_at` (timestamp): When state was generated
- `used` (boolean): Whether state has been consumed

**Relationships**:
- None (temporary table, auto-cleanup after 15 minutes)

**Validation Rules**:
- `state` must be cryptographically random (32+ bytes)
- `created_at` + 15 minutes = automatic expiry
- `used` = true after successful OAuth callback

---

### API Contracts

**File**: `specs/003-zerodha-account-connect/contracts/zerodha-api.types.ts`

```typescript
/**
 * API contracts for Zerodha account connection feature.
 * All types are strongly-typed with zero `any` usage.
 */

/**
 * Enum representing the connection status to Zerodha.
 * 
 * Why this exists: Type-safe status tracking and UI state management
 */
export enum ConnectionStatus {
  /** Connection is active and token is valid */
  ACTIVE = 'ACTIVE',
  /** Token has expired (after ~6 hours) */
  EXPIRED = 'EXPIRED',
  /** User or Zerodha revoked access */
  REVOKED = 'REVOKED',
  /** Error occurred during API calls */
  ERROR = 'ERROR',
  /** No connection established yet */
  NOT_CONNECTED = 'NOT_CONNECTED',
}

/**
 * Request to initiate Zerodha OAuth flow.
 * 
 * Why this exists: Type-safe contract for starting OAuth
 */
export interface InitiateOAuthRequest {
  /** User initiating the connection */
  userId: string;
  /** Frontend callback URL after OAuth completes */
  redirectUrl: string;
}

/**
 * Response with OAuth URL for redirect.
 * 
 * Why this exists: Provides frontend with Zerodha login URL
 */
export interface InitiateOAuthResponse {
  /** Zerodha OAuth URL to redirect user to */
  oauthUrl: string;
  /** State parameter for CSRF protection */
  state: string;
}

/**
 * OAuth callback parameters from Zerodha.
 * 
 * Why this exists: Type-safe parsing of OAuth redirect
 */
export interface OAuthCallbackParams {
  /** OAuth request token from Zerodha */
  requestToken: string;
  /** State parameter for verification */
  state: string;
  /** Status of OAuth attempt */
  status: 'success' | 'error';
  /** Error message if status is error */
  error?: string;
}

/**
 * Response after OAuth callback processing.
 * 
 * Why this exists: Confirms connection establishment
 */
export interface OAuthCallbackResponse {
  /** Whether connection was successful */
  success: boolean;
  /** Connection ID if successful */
  connectionId?: string;
  /** Error details if unsuccessful */
  error?: string;
  /** Redirect URL for frontend */
  redirectUrl: string;
}

/**
 * Request to get current connection status.
 * 
 * Why this exists: Allows frontend to check connection state
 */
export interface GetConnectionStatusRequest {
  /** User to check connection for */
  userId: string;
}

/**
 * Response with connection status and balance.
 * 
 * Why this exists: Provides complete connection state to UI
 */
export interface GetConnectionStatusResponse {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether user has active connection */
  isConnected: boolean;
  /** Zerodha user ID if connected */
  zerodhaUserId?: string;
  /** Account balance if connected */
  balance?: ZerodhaBalance;
  /** When connection expires (if active) */
  expiresAt?: Date;
  /** Time until expiry in minutes (if active) */
  minutesUntilExpiry?: number;
  /** Error details if status is ERROR */
  errorDetails?: string;
}

/**
 * Zerodha account balance information.
 * 
 * Why this exists: Type-safe representation of balance data
 */
export interface ZerodhaBalance {
  /** Available cash balance */
  available: number;
  /** Margin currently in use */
  usedMargin: number;
  /** Total account value */
  total: number;
  /** Currency (typically INR) */
  currency: string;
  /** When balance was last fetched */
  lastUpdated: Date;
}

/**
 * Request to disconnect Zerodha account.
 * 
 * Why this exists: Allows users to revoke connection
 */
export interface DisconnectAccountRequest {
  /** User requesting disconnection */
  userId: string;
}

/**
 * Response after disconnection.
 * 
 * Why this exists: Confirms disconnection success
 */
export interface DisconnectAccountResponse {
  /** Whether disconnection was successful */
  success: boolean;
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * Request to refresh balance data.
 * 
 * Why this exists: Manual balance refresh trigger
 */
export interface RefreshBalanceRequest {
  /** User requesting balance refresh */
  userId: string;
  /** Force fetch even if cached data is fresh */
  force?: boolean;
}

/**
 * Response with refreshed balance.
 * 
 * Why this exists: Provides updated balance data
 */
export interface RefreshBalanceResponse {
  /** Whether refresh was successful */
  success: boolean;
  /** Updated balance data if successful */
  balance?: ZerodhaBalance;
  /** Error details if unsuccessful */
  error?: string;
  /** Whether data was from cache */
  fromCache: boolean;
}

/**
 * Error codes specific to Zerodha integration.
 * 
 * Why this exists: Type-safe error handling
 */
export enum ZerodhaErrorCode {
  /** OAuth state parameter invalid or expired */
  INVALID_STATE = 'INVALID_STATE',
  /** OAuth request token invalid */
  INVALID_TOKEN = 'INVALID_TOKEN',
  /** API rate limit exceeded */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Zerodha API error */
  API_ERROR = 'API_ERROR',
  /** Token expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  /** Connection not found */
  NOT_CONNECTED = 'NOT_CONNECTED',
  /** Network error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Invalid configuration */
  CONFIG_ERROR = 'CONFIG_ERROR',
}
```

---

### Database Contracts

**File**: `specs/003-zerodha-account-connect/contracts/zerodha-db.types.ts`

```typescript
/**
 * Database schema types for Zerodha integration.
 * These types match PostgreSQL table structures exactly.
 */

import { ConnectionStatus } from './zerodha-api.types.js';

/**
 * Zerodha connection record in database.
 * 
 * Why this exists: Persists user's Zerodha authentication
 */
export interface ZerodhaConnectionRow {
  /** Primary key */
  id: string;
  /** Foreign key to users table */
  user_id: string;
  /** Zerodha user ID from profile */
  zerodha_user_id: string;
  /** Encrypted access token */
  access_token: string;
  /** Token creation timestamp */
  created_at: Date;
  /** Token expiration timestamp */
  expires_at: Date;
  /** Connection status */
  status: string;
  /** Last successful balance fetch */
  last_balance_fetch: Date | null;
  /** Error details if any */
  error_details: string | null;
}

/**
 * Balance history record in database.
 * 
 * Why this exists: Tracks balance over time for analytics
 */
export interface ZerodhaBalanceHistoryRow {
  /** Primary key */
  id: string;
  /** Foreign key to zerodha_connections */
  connection_id: string;
  /** Available cash balance */
  available_balance: number;
  /** Used margin */
  used_margin: number;
  /** Total account value */
  total_balance: number;
  /** Currency code */
  currency: string;
  /** When balance was fetched */
  timestamp: Date;
  /** API call latency */
  fetch_latency_ms: number;
}

/**
 * OAuth state record in database.
 * 
 * Why this exists: Temporary CSRF protection for OAuth
 */
export interface ZerodhaOAuthStateRow {
  /** OAuth state parameter (primary key) */
  state: string;
  /** User initiating OAuth */
  user_id: string;
  /** State creation time */
  created_at: Date;
  /** Whether state has been used */
  used: boolean;
}
```

---

### API Endpoint Specifications

**Service**: `zerodha-auth`

#### 1. POST /zerodha/oauth/initiate
Initiates OAuth flow and returns Zerodha login URL.

**Request**: `InitiateOAuthRequest`
**Response**: `InitiateOAuthResponse`
**Auth**: Required (user session)
**Errors**:
- `CONFIG_ERROR`: Zerodha API key not configured
- `INVALID_REQUEST`: Missing userId or redirectUrl

**Flow**:
1. Generate cryptographically random state parameter
2. Store state in database with user_id and 15-min expiry
3. Construct Zerodha OAuth URL with state
4. Return OAuth URL to frontend

#### 2. GET /zerodha/oauth/callback
Handles OAuth callback from Zerodha.

**Request**: `OAuthCallbackParams` (query parameters)
**Response**: `OAuthCallbackResponse`
**Auth**: None (public endpoint for OAuth redirect)
**Errors**:
- `INVALID_STATE`: State parameter invalid or expired
- `INVALID_TOKEN`: Request token exchange failed
- `API_ERROR`: Zerodha API error during token exchange

**Flow**:
1. Validate state parameter against database
2. Mark state as used
3. Exchange request token for access token
4. Fetch Zerodha user profile
5. Store connection in database with encrypted token
6. Calculate expires_at (now + 6 hours)
7. Redirect to frontend with success

#### 3. GET /zerodha/connection/status
Returns current connection status and balance.

**Request**: `GetConnectionStatusRequest`
**Response**: `GetConnectionStatusResponse`
**Auth**: Required (user session)
**Errors**:
- `NOT_CONNECTED`: No active connection found

**Flow**:
1. Query database for user's connection
2. Check if token is expired
3. If active, fetch latest balance (cached < 5 min)
4. Calculate minutes until expiry
5. Return complete status

#### 4. POST /zerodha/connection/disconnect
Disconnects Zerodha account.

**Request**: `DisconnectAccountRequest`
**Response**: `DisconnectAccountResponse`
**Auth**: Required (user session)
**Errors**:
- `NOT_CONNECTED`: No connection to disconnect

**Flow**:
1. Find user's connection
2. Update status to REVOKED
3. Clear access token
4. Log disconnection event
5. Return success

#### 5. POST /zerodha/balance/refresh
Manually refreshes balance data.

**Request**: `RefreshBalanceRequest`
**Response**: `RefreshBalanceResponse`
**Auth**: Required (user session)
**Errors**:
- `NOT_CONNECTED`: No active connection
- `TOKEN_EXPIRED`: Token expired, need reconnection
- `RATE_LIMIT`: Too many requests

**Flow**:
1. Validate connection is ACTIVE
2. Check cache unless force=true
3. Call Zerodha margin API
4. Store in balance history
5. Return fresh balance

---

### External API Documentation

**API**: Zerodha Kite Connect v3  
**Base URL**: `https://api.kite.trade`  
**Documentation**: https://kite.trade/docs/connect/v3/  
**Official Node.js SDK**: 
- Package: `kiteconnectjs` (v5.x)
- GitHub: https://github.com/zerodha/kiteconnectjs
- Documentation: https://kite.trade/docs/kiteconnectjs/v3/
- Examples: https://github.com/zerodha/kiteconnectjs/blob/master/examples

**Rate Limits**:
- 3 requests/second per user
- Exceeding rate limit returns HTTP 429
- Retry after 1 second

**Costs**:
- Developer account: Free
- Production API access: ₹2,000/month per app
- No per-request charges

**Authentication Flow**:
1. Redirect to `https://kite.zerodha.com/connect/login?api_key={key}&v=3`
2. User logs in on Zerodha
3. Zerodha redirects to callback with `request_token`
4. Exchange `request_token` + `api_secret` for `access_token`
5. `access_token` expires in ~6 hours
6. No refresh tokens available

**Key Endpoints**:
- `POST /session/token`: Exchange request_token for access_token
- `GET /user/profile`: Fetch user details (includes user_id)
- `GET /user/margins`: Fetch account balance and margin data
- `DELETE /session/token`: Invalidate access token

**Error Handling**:
- HTTP 403: Token expired or invalid → Trigger reconnection flow
- HTTP 429: Rate limit → Exponential backoff (1s, 2s, 4s)
- HTTP 5xx: Server error → Retry with jitter (max 3 attempts)

**Degradation Strategy**:
- If margins API fails: Show cached balance + warning
- If token expired: Immediate user notification
- If rate limited: Queue request + notify user of delay

---

## Phase 1 Artifacts

### Quickstart Guide

**File**: `specs/003-zerodha-account-connect/quickstart.md`

```markdown
# Zerodha Account Connection - Quickstart

## Prerequisites

1. Zerodha Developer Account: https://developers.kite.trade/
2. Create a Kite Connect app to get API Key and Secret
3. Set redirect URL to: `http://localhost:4000/zerodha/oauth/callback` (local dev)

## Installation

Install the official Zerodha SDK:

```bash
cd backend
npm install kiteconnectjs
```

## Environment Setup

Add to `.env`:

```bash
ZERODHA_API_KEY=your_api_key_here
ZERODHA_API_SECRET=your_api_secret_here
ZERODHA_REDIRECT_URL=http://localhost:4000/zerodha/oauth/callback
```

## Running Locally

```bash
# Start Encore backend
cd backend
encore run

# In another terminal, start Next.js frontend
cd frontend
npm run dev
```

## Testing OAuth Flow

1. Open browser to `http://localhost:3000`
2. Click "Connect Your Account" button
3. You'll be redirected to Zerodha login
4. Login with Zerodha credentials
5. After authorization, you'll return to Manjha
6. Should see "Zerodha Connected" + your balance

## Troubleshooting

**"Invalid API Key"**:
- Check ZERODHA_API_KEY in .env
- Verify API key is active in Kite Connect dashboard

**"Redirect URL mismatch"**:
- Update redirect URL in Kite Connect app settings
- Must match ZERODHA_REDIRECT_URL exactly

**"Token expired"**:
- Tokens expire after ~6 hours
- Click "Reconnect" to start fresh OAuth flow

## Database Schema

Run migrations:
```bash
cd backend/zerodha-auth
encore db migrate
```

Tables created:
- `zerodha_connections`: User connections and tokens
- `zerodha_balance_history`: Historical balance data
- `zerodha_oauth_states`: Temporary OAuth state storage

## API Endpoints

Local development URLs:

- `POST http://localhost:4000/zerodha/oauth/initiate` - Start OAuth
- `GET http://localhost:4000/zerodha/oauth/callback` - OAuth callback
- `GET http://localhost:4000/zerodha/connection/status` - Check status
- `POST http://localhost:4000/zerodha/connection/disconnect` - Disconnect
- `POST http://localhost:4000/zerodha/balance/refresh` - Refresh balance

## Frontend Integration

The Connect button in `widget-dashboard.tsx`:

```typescript
const handleConnect = async () => {
  const response = await fetch('/api/zerodha/oauth/initiate', {
    method: 'POST',
    body: JSON.stringify({ userId: 'current-user', redirectUrl: window.location.href }),
  });
  const data = await response.json();
  window.location.href = data.oauthUrl; // Redirect to Zerodha
};
```

## E2E Test

```bash
cd backend
npm test specs/003-zerodha-account-connect/zerodha-connect.test.ts
```

Test flow:
1. Initiate OAuth → Get redirect URL
2. Simulate OAuth callback with mock request_token
3. Verify connection stored in database
4. Fetch status → Verify ACTIVE with balance
5. Disconnect → Verify status REVOKED
```

---

## Implementation Checklist

### Phase 0: Research ✅
- [x] Study Zerodha OAuth flow
- [x] Review Kite Connect API documentation
- [x] Design token management strategy
- [x] Document rate limits and error handling
- [x] Define data models
- [x] Create API contracts

### Phase 1: Backend Service
- [ ] Create `backend/zerodha-auth/` directory
- [ ] Create `encore.service.ts` service definition
- [ ] Write database migrations
- [ ] Implement OAuth initiation endpoint
- [ ] Implement OAuth callback handler
- [ ] Implement token storage with encryption
- [ ] Implement connection status endpoint
- [ ] Implement disconnect endpoint
- [ ] Implement balance refresh endpoint
- [ ] Add common logging integration
- [ ] Write integration tests
- [ ] Write E2E OAuth flow test

### Phase 2: Frontend Integration
- [ ] Update `widget-dashboard.tsx` Connect button
- [ ] Create `zerodha-status.tsx` component
- [ ] Update `api-client.ts` with Zerodha endpoints
- [ ] Add Zerodha types to frontend `types/index.ts`
- [ ] Implement loading states
- [ ] Implement error handling UI
- [ ] Add expiry warning notification
- [ ] Test complete flow end-to-end

### Phase 3: Production Hardening
- [ ] Add rate limit protection
- [ ] Implement retry logic with exponential backoff
- [ ] Add monitoring/alerting for token expiry
- [ ] Set up HTTPS redirect URL for production
- [ ] Document deployment configuration
- [ ] Add cron job for proactive expiry checks
- [ ] Performance testing (OAuth flow < 1s)
- [ ] Security audit (token encryption, CSRF protection)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OAuth redirect URL misconfiguration | Medium | High | Clear documentation, environment validation on startup |
| Token expiry surprises user | High | Medium | Proactive notifications 30 min before expiry |
| Rate limit exceeded | Low | Medium | Request queue with backoff, user notification |
| Zerodha API downtime | Low | High | Fallback to cached balance, clear error messages |
| Token storage breach | Low | Critical | Encryption at rest, secure key management |
| CSRF attack on OAuth | Medium | High | Cryptographic state parameter, 15-min expiry |

---

## Success Metrics

- OAuth completion rate: > 95%
- OAuth flow latency: < 1s (p95)
- Balance fetch latency: < 2s (p95)
- Token expiry notifications: 100% of users
- Reconnection success rate: > 90%
- Zero unencrypted tokens in logs/database

---

## Next Steps

1. Run `/speckit.tasks` to break down implementation into actionable tasks
2. Begin Phase 1: Backend service implementation
3. Write E2E test first (Red phase of TDD)
4. Implement OAuth flow (Green phase)
5. Refactor for production quality
6. Update skills with learnings

**Ready for**: `/speckit.tasks` command
