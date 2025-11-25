# Feature Specification: Zerodha MCP Chat Integration

**Feature Branch**: `003-zerodha-mcp-chat`  
**Created**: 2025-11-25  
**Status**: ✅ Complete  
**Completed**: 2025-11-25  
**Input**: User description: "Integrate Zerodha Kite MCP into Manjha chat for portfolio access"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect Zerodha Account (Priority: P1) 🎯 MVP

User clicks "Connect" button when @Zerodha is selected in chat. They are redirected to Zerodha login, authenticate, and return to Manjha with an active connection.

**Why this priority**: Core enabler - nothing else works without a connected account.

**Independent Test**: Click Connect → Complete Zerodha login → See "Connected" status in chat

**Acceptance Scenarios**:

1. **Given** user has @Zerodha selected and is not connected, **When** they click Connect, **Then** they see Zerodha's login page in a new window
2. **Given** user completes Zerodha login, **When** they return to Manjha, **Then** the connector shows "Connected" status
3. **Given** user closes login window without completing, **When** they return to Manjha, **Then** they can retry connecting

---

### User Story 2 - Ask Portfolio Questions (Priority: P2)

User asks "What's in my portfolio?" or "Show my holdings" with @Zerodha selected. They receive a response showing their actual Zerodha data.

**Why this priority**: Primary value - why users connect in the first place.

**Independent Test**: With connected account, ask portfolio question → See real holdings data

**Acceptance Scenarios**:

1. **Given** user is connected to Zerodha, **When** they ask about holdings, **Then** they see their actual portfolio data
2. **Given** user is NOT connected, **When** they ask with @Zerodha selected, **Then** they are prompted to connect first

---

### User Story 3 - Session Persistence (Priority: P3)

User who connected earlier returns to Manjha and their Zerodha connection is still active (within session window).

**Why this priority**: Quality of life - reduces friction for returning users.

**Independent Test**: Connect → Close browser → Return within 6 hours → Still connected

**Acceptance Scenarios**:

1. **Given** user connected within last 6 hours, **When** they return to chat, **Then** @Zerodha shows "Connected" without re-auth
2. **Given** user's session expired (>6 hours), **When** they return, **Then** they see "Connect" prompt again

---

### Edge Cases

- What happens when Zerodha's service is down? → Show friendly error, suggest retry
- What happens when user's Zerodha session expires mid-conversation? → Prompt to reconnect
- What happens if user has no holdings? → Show empty state message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a Connect button when @Zerodha is selected and user is not authenticated
- **FR-002**: System MUST redirect to Zerodha OAuth when user clicks Connect
- **FR-003**: System MUST persist connection status per device for up to 6 hours
- **FR-004**: System MUST show "Connected" indicator when user has active Zerodha session
- **FR-005**: Finance agent MUST delegate to Zerodha tools when @Zerodha is selected and user is connected
- **FR-006**: System MUST gracefully handle Zerodha API errors with user-friendly messages

### Key Entities

- **ZerodhaSession**: Links device_id to MCP session, tracks expiry time and connection status
- **DeviceIdentity**: Browser-generated UUID stored in localStorage, used until proper auth exists

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can connect Zerodha account in under 60 seconds
- **SC-002**: Connected users can query portfolio data within 5 seconds
- **SC-003**: Sessions persist for at least 6 hours without requiring re-authentication
- **SC-004**: 95% of connection attempts succeed when Zerodha is available
