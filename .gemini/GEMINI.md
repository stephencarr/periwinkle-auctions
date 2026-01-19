# Periwinkle Auctions - AI Assistant Context

> **Project**: Periwinkle Auctions  
> **Type**: Real-time online auction platform  
> **Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Square

---

## Quick Reference

### Project Structure
```
periwinkle-auctions/
├── docs/                    # Documentation
│   ├── TECH_SPEC.md         # Technical architecture
│   ├── PRODUCT_SPEC.md      # Product requirements
│   ├── CODING_STANDARDS.md  # Code conventions
│   └── features/            # Feature-specific context
│       ├── AUTH.md
│       ├── AUCTIONS.md
│       ├── BIDDING.md
│       ├── PAYMENTS.md
│       └── ADMIN.md
├── prisma/                  # Database schema
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, configs
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript types
└── public/                  # Static assets
```

### Key Technologies
| Purpose | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 |
| Payments | Square Web Payments SDK |
| Real-time | Server-Sent Events (SSE) |
| Styling | CSS Modules |
| Deployment | Vercel + Railway |

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Database commands
npx prisma migrate dev     # Create/apply migrations
npx prisma studio          # Visual database browser
npx prisma generate        # Regenerate client

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
```

---

## Context Files

When working on specific features, read the corresponding context file:

| Feature | File | Key Info |
|---------|------|----------|
| Authentication | `docs/features/AUTH.md` | NextAuth config, session handling |
| Auction CRUD | `docs/features/AUCTIONS.md` | Lifecycle states, API design |
| Real-time Bids | `docs/features/BIDDING.md` | SSE implementation, anti-sniping |
| Payments | `docs/features/PAYMENTS.md` | Square integration, webhook handling |
| Admin Panel | `docs/features/ADMIN.md` | Route protection, admin APIs |

---

## Code Patterns

### API Route Template
```typescript
// src/app/api/[resource]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const schema = z.object({ /* ... */ });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  
  // ... implementation
}
```

### Component Template
```typescript
// src/components/[feature]/ComponentName.tsx
import type { SomeType } from '@/types';
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  prop: SomeType;
}

export function ComponentName({ prop }: ComponentNameProps) {
  return <div className={styles.container}>{/* ... */}</div>;
}
```

---

## Important Constraints

1. **TypeScript Strict** - No `any` types, explicit null handling
2. **Server Components First** - Use 'use client' only when needed
3. **Zod Validation** - All API inputs validated
4. **Prisma Transactions** - Use for related writes (bid + price update)
5. **CSS Modules** - Scoped styles, use design tokens

---

## Environment Variables

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Square
SQUARE_APPLICATION_ID=sandbox-...
SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
SQUARE_ENVIRONMENT=sandbox

# Public (safe to expose)
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-...
NEXT_PUBLIC_SQUARE_LOCATION_ID=...
```

---

## Common Tasks

### Adding a New API Endpoint
1. Create route file in `src/app/api/`
2. Add Zod schema for validation
3. Implement auth check if needed
4. Update relevant feature doc if behavior changes

### Adding a New Component
1. Create in appropriate `src/components/[feature]/` folder
2. Create corresponding `.module.css` file
3. Export from feature index if needed
4. Add to relevant page

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update TypeScript types if needed
4. Update relevant feature docs

---

## Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test.ts

# Run with coverage
npm run test:coverage
```

---

## Deployment

### Vercel (Frontend + API)
- Auto-deploy on push to `main`
- Preview deployments on PRs
- Set environment variables in Vercel dashboard

### Railway (Database)
- PostgreSQL instance
- Copy connection string to Vercel env vars
- Run migrations: `npx prisma migrate deploy`
