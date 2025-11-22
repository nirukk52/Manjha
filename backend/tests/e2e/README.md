# E2E Tests for Finance Chat Agent

## Running Tests

### Quick Start

```bash
# From backend directory
encore test
```

That's it! Encore automatically:
- ✅ Sets up test databases
- ✅ Initializes all services
- ✅ Runs migrations
- ✅ Configures test environment

### Prerequisites

**OpenAI API key** must be configured:
```bash
encore secret set --type local OpenAIApiKey
```

## Test Configuration

### Vitest Setup

Tests use **Vitest** (recommended by Encore). Configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      "~encore": path.resolve(__dirname, "./encore.gen"),
    },
  },
  test: {
    fileParallelism: false, // Required for VSCode compatibility
  },
});
```

### CI/CD Configuration

For faster CI builds, enable parallel execution:

```bash
npm run test:ci  # Uses --fileParallelism=true
```

## Test Architecture

### ✅ What We Test (Per Constitution)

> "Test the USER-FACING behavior - Always. No petty tests!"

**Integration Tests** (recommended):
- ✅ Complete user flows (send → classify → route → respond)
- ✅ Database interactions (sessions, messages)
- ✅ Performance targets (< 500ms classification, < 2s general agent)
- ✅ Edge cases (empty messages, over-length messages)
- ✅ Error handling (validation, timeouts)

**NOT Tested** (following "no petty tests"):
- ❌ Internal helper functions
- ❌ Private methods
- ❌ Implementation details
- ❌ Mock-heavy unit tests

### Why Integration Tests?

Per [Encore's testing guide](https://encore.dev/docs/ts/develop/testing):

> "Encore applications typically focus on integration tests rather than unit tests because:
> - Encore eliminates most boilerplate code
> - Your code primarily consists of business logic involving databases and inter-service API calls
> - Integration tests better verify this type of functionality"

## Test Coverage

### User Stories (Per Spec)
- **US1**: Finance question → Finance agent → Detailed analysis ✅
- **US2**: General question → General agent → Quick response (< 2s) ✅
- **US3**: Real-time streaming (tested via integration) ✅

### Edge Cases
- Empty messages (validation) ✅
- Over-length messages (> 5000 chars) ✅
- Classification latency (< 500ms target) ✅
- Session management ✅

### Performance Targets (Per Spec)
- Classification: < 500ms ✅
- General agent: < 2s ✅
- Finance agent first token: < 3s (via streaming test)
- UI message display: < 100ms (frontend responsibility)

## Using Encore Service Clients

**❌ Old Approach** (manual fetch calls):
```typescript
// BAD: Requires manual server startup, no type safety
const response = await fetch('http://localhost:4000/chat/send', {
  method: 'POST',
  body: JSON.stringify({...}),
});
```

**✅ New Approach** (Encore service clients):
```typescript
// GOOD: Type-safe, automatic test setup
import { send } from '../chat-gateway/gateway.js';

const response = await send({
  sessionId: 'test-123',
  content: 'What is my P&L?',
  userId: 'test-user',
});
```

### Benefits of Service Clients
1. **Type Safety** - TypeScript interfaces enforced
2. **No Manual Setup** - Encore handles infrastructure
3. **Faster Tests** - No HTTP overhead
4. **Better Errors** - Stack traces through your code
5. **Test Isolation** - Each test gets clean database

## Test Database Management

Encore automatically handles test databases:

```typescript
// Each test gets a fresh database state
it('should create session', async () => {
  // Database is clean at start
  await send({ sessionId: 'test', content: 'Hello', userId: 'user' });
  
  // Changes only visible in this test
});
```

### Advanced: Temporary Databases

For tests needing complete isolation:

```typescript
import { testdb } from 'encore.dev/storage/sqldb/testdb';

it('should use isolated database', async () => {
  // Create a fresh database for this test only
  const db = await testdb.newDatabase();
  
  // Use db for isolated queries
});
```

## Debugging Tests

### View Test Traces

Open Encore's local development dashboard:
```bash
open http://localhost:9400
```

All test execution traces appear here with:
- API call traces
- Database queries
- Performance metrics
- Error details

### VS Code Integration

1. Install [Vitest VS Code extension](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer)

2. Add to `.vscode/settings.json`:
```json
{
  "vitest.commandLine": "encore test",
  "vitest.nodeEnv": {
    "ENCORE_RUNTIME_LIB": "<path from: encore daemon env | grep ENCORE_RUNTIME_LIB>"
  }
}
```

3. Run tests directly from editor with breakpoints ✨

## Test Examples

### Example 1: Classification Test
```typescript
it('should classify finance questions', async () => {
  const result = await classify({
    content: 'Why is my P&L negative?',
  });
  
  expect(result.agentType).toBe(AgentType.FINANCE);
  expect(result.confidence).toBeGreaterThan(0.7);
  expect(result.latencyMs).toBeLessThan(500); // Spec requirement
});
```

### Example 2: Performance Test
```typescript
it('should respond quickly', async () => {
  const start = performance.now();
  
  await respond({
    question: 'Hello',
    maxTokens: 100,
  });
  
  const latency = performance.now() - start;
  expect(latency).toBeLessThan(2000); // < 2s spec
}, 5000); // 5s timeout
```

### Example 3: Error Handling
```typescript
it('should validate input', async () => {
  await expect(
    send({ sessionId: 'test', content: '', userId: 'user' })
  ).rejects.toThrow(/empty/i);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Encore
        run: curl -L https://encore.dev/install.sh | bash
      
      - name: Set OpenAI Secret
        run: encore secret set --type local OpenAIApiKey
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Run Tests
        run: |
          cd backend
          npm install
          encore test --fileParallelism=true
```

## Troubleshooting

### "Cannot find module '~encore/clients'"

**Solution**: Run `encore run` once to generate clients, then tests will work.

### "OpenAI API Error"

**Solution**: Ensure secret is set:
```bash
encore secret list  # Check if OpenAIApiKey exists
encore secret set --type local OpenAIApiKey  # Set if missing
```

### "Database connection failed"

**Solution**: Encore automatically manages test databases. If issues persist:
```bash
encore db reset  # Reset all databases
```

### Tests are slow

**Solution**: 
1. Ensure `fileParallelism: false` in `vite.config.ts` (dev)
2. Use `npm run test:ci` for parallel execution (CI)
3. Check OpenAI API latency (finance agent calls are external)

## Resources

- [Encore.ts Testing Guide](https://encore.dev/docs/ts/develop/testing)
- [Encore Go Testing Guide](https://encore.dev/docs/go/develop/testing)
- [Example: Uptime Monitor with Tests](https://github.com/encoredev/examples/tree/main/ts/uptime)
- [Vitest Documentation](https://vitest.dev/)

## Next Steps

1. ✅ Run `encore test` - All tests should pass
2. ✅ Open `localhost:9400` - View test traces
3. ✅ Add more integration tests - Cover new features
4. ✅ Set up CI/CD - Automate testing

---

**Philosophy**: Integration tests > Unit tests for Encore apps.  
**Rule**: Test user-facing behavior, not implementation details.  
**Tool**: Use Encore service clients, not raw HTTP calls.
