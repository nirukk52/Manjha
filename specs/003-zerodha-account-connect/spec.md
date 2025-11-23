# Feature Specification: Zerodha Account Connection

**Feature Branch**: `003-zerodha-account-connect`  
**Created**: 2025-11-22  
**Status**: Draft  
**Input**: User description: "Connect user to Zerodha account and display connection status with current balance"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect Zerodha Account (Priority: P1)

A user wants to connect their Zerodha trading account to Manjha so the system can access their portfolio data and provide personalized trading insights.

**Why this priority**: This is the foundational requirement - without account connection, no portfolio data can be accessed. This is the critical first step for any Zerodha integration.

**Independent Test**: Can be fully tested by clicking the "Connect Your Account" button, completing authentication on Zerodha's login page, and verifying successful connection status is displayed. Delivers immediate value by establishing secure account access.

**Acceptance Scenarios**:

1. **Given** a user is viewing the dashboard with an unconnected account, **When** they click the "Connect Your Account" button, **Then** they are redirected to Zerodha's secure login page
2. **Given** a user completes authentication on Zerodha's login page, **When** Zerodha redirects back to Manjha, **Then** the system establishes the connection and shows "Zerodha Connected" status
3. **Given** a user has successfully connected their account, **When** they view the dashboard, **Then** they see "Zerodha Connected" with their current account balance displayed
4. **Given** a user attempts to connect their account, **When** authentication fails or is cancelled, **Then** they see an appropriate error message and can retry the connection

---

### User Story 2 - View Current Balance (Priority: P2)

A user with a connected Zerodha account wants to see their current account balance on the dashboard to track their available funds without leaving Manjha.

**Why this priority**: Once connected, users need immediate visibility of their balance. This provides core value of the integration but depends on P1 being complete.

**Independent Test**: Can be tested by verifying a connected account displays the current balance fetched from Zerodha. Delivers value by showing real-time financial data.

**Acceptance Scenarios**:

1. **Given** a user has a connected Zerodha account, **When** they load the dashboard, **Then** their current account balance is displayed accurately
2. **Given** a user's balance changes in their Zerodha account, **When** they refresh the dashboard or after a time period, **Then** the updated balance is reflected
3. **Given** balance data is being fetched, **When** the fetch takes time, **Then** a loading indicator is shown to the user
4. **Given** balance data cannot be fetched, **When** an error occurs, **Then** the connection status shows an error state with guidance on how to resolve it

---

### User Story 3 - Reconnect Expired Session (Priority: P3)

A user whose Zerodha session has expired wants to reconnect their account seamlessly to continue using Manjha's features.

**Why this priority**: Zerodha sessions expire periodically (approximately every 6 hours), requiring users to re-authenticate. While important for continuous use, it's not needed for initial MVP value delivery.

**Independent Test**: Can be tested by simulating an expired token, verifying the user is notified, and allowing them to reconnect. Delivers value by maintaining long-term usability.

**Acceptance Scenarios**:

1. **Given** a user's Zerodha session has expired, **When** they view the dashboard, **Then** they see a notification that their session expired with a "Reconnect" option
2. **Given** a user clicks "Reconnect" on an expired session, **When** they complete re-authentication, **Then** their session is restored and data is refreshed
3. **Given** a user attempts to use features requiring Zerodha data with an expired session, **When** the system detects expiration, **Then** they are prompted to reconnect before proceeding

---

### Edge Cases

- What happens when the user cancels authentication mid-flow on Zerodha's page?
- How does the system handle network failures during the OAuth redirect?
- What if Zerodha's API is temporarily unavailable?
- How does the system handle users with multiple Zerodha accounts?
- What happens if the user revokes Manjha's access from Zerodha's side?
- How does the system handle concurrent connection attempts from the same user?
- What if the balance fetch succeeds but returns unexpected data formats?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a clearly visible button to initiate Zerodha account connection on the dashboard
- **FR-002**: System MUST redirect users to Zerodha's official authentication page when connection is initiated
- **FR-003**: System MUST securely handle the OAuth callback from Zerodha after user authentication
- **FR-004**: System MUST store connection credentials securely and associate them with the user's account
- **FR-005**: System MUST display "Zerodha Connected" status once a connection is successfully established
- **FR-006**: System MUST fetch and display the user's current account balance from their connected Zerodha account
- **FR-007**: System MUST handle authentication errors gracefully and provide clear error messages to users
- **FR-008**: System MUST allow users to disconnect their Zerodha account if desired
- **FR-009**: System MUST detect when a Zerodha session has expired and notify the user
- **FR-010**: System MUST allow users to reconnect an expired session without losing other account data
- **FR-011**: System MUST refresh balance data at appropriate intervals to keep information current
- **FR-012**: System MUST show loading states while fetching balance data from Zerodha
- **FR-013**: System MUST validate that OAuth callbacks are legitimate and not tampered with
- **FR-014**: System MUST handle cases where users cancel authentication before completion

### Key Entities

- **Zerodha Connection**: Represents the authenticated link between a user's Manjha account and their Zerodha trading account, including connection status, authentication timestamp, and expiration information
- **Account Balance**: Represents the current available funds in the user's connected Zerodha account, including balance amount, currency, and last updated timestamp
- **User**: The Manjha user who owns the connection, with relationship to their Zerodha connection status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully connect their Zerodha account in under 2 minutes from clicking the connect button to seeing confirmation
- **SC-002**: Users see their accurate current balance within 3 seconds of successful connection
- **SC-003**: 95% of connection attempts succeed without errors for users with valid Zerodha credentials
- **SC-004**: Users can identify their connection status at a glance without confusion (clear "Connected" or "Not Connected" state)
- **SC-005**: System handles expired sessions gracefully with 100% of users able to reconnect successfully
- **SC-006**: Balance data displayed matches the actual balance in users' Zerodha accounts with 100% accuracy

## Assumptions

- Users have existing Zerodha trading accounts with valid credentials
- Users understand they need to authenticate with Zerodha to connect their account
- Zerodha's OAuth authentication service is available and functioning normally
- Users are accessing Manjha from a device with internet connectivity
- The OAuth flow follows Zerodha's standard security practices and expiration policies
- Balance information is available through Zerodha's API for connected accounts
- Users want to see their balance in the native currency provided by Zerodha (typically INR)
