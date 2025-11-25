## TypeScript Backend Guardrail Notes

### TypeBox Alignment
- Example pattern lifted from Fastify TypeScript reference.
- Establish schema once using `Type.Object`.
- Derive `Static<typeof Schema>` to sync runtime validation + compile-time types.

```typescript
import { Static, Type } from '@sinclair/typebox'

export const User = Type.Object({
  name: Type.String(),
  mail: Type.Optional(Type.String({ format: 'email' })),
})

export type UserType = Static<typeof User>
```

### Fastify Declaration Merging
- Decorating reply/request requires module augmentation.

```typescript
import fastify from 'fastify'

const server = fastify()
server.decorateReply('someProp', 'world')

declare module 'fastify' {
  interface FastifyReply {
    someProp: string
  }
}
```

### JSON Schema Literals
- Use `as const` so json-schema-to-ts infers literal union values.

```typescript
const todo = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    done: { type: 'boolean' },
  },
  required: ['name'],
} as const
```

### tRPC Router Example
- Combine Zod validation + tRPC router composition to create typed procedures.

```typescript
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const appRouter = t.router({
  post: t.router({
    edit: t.procedure
      .input(z.object({ id: z.number(), title: z.string() }))
      .mutation(({ input }) => ({ post: { id: input.id, title: input.title } })),
  }),
  user: t.router({
    all: t.procedure.query(() => ({ users: [{ name: 'Dave Grohl' }] })),
  }),
})
```

### tsconfig Boundaries
- Provide explicit include/exclude to avoid accidental node_modules scanning.

```json5
{
  "include": ["src"],
  "exclude": ["**/node_modules", "**/.*/"]
}
```

### Additional Reading
- Fastify TypeScript guide: https://github.com/fastify/fastify/blob/main/docs/Reference/TypeScript.md
- tRPC router setup: https://github.com/trpc/trpc/tree/main/www/docs
- TypeScript performance guide: https://github.com/microsoft/typescript/wiki/Performance

