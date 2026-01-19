# Periwinkle Auctions - Coding Standards

> **Last Updated**: 2026-01-18

---

## 1. TypeScript Guidelines

### Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type Definitions
```typescript
// ✅ Good - Explicit types for function parameters and returns
function calculateBidMinimum(currentPrice: number, increment: number): number {
  return currentPrice + increment;
}

// ✅ Good - Use interfaces for objects
interface Auction {
  id: string;
  title: string;
  currentPrice: number;
}

// ✅ Good - Use type for unions/aliases
type AuctionStatus = 'DRAFT' | 'ACTIVE' | 'ENDED' | 'SOLD';

// ❌ Bad - Avoid 'any'
function processData(data: any) { ... }

// ✅ Good - Use 'unknown' and narrow
function processData(data: unknown) {
  if (isAuction(data)) { ... }
}
```

### Null Handling
```typescript
// ✅ Good - Explicit null checks
const winner = auction.winner ?? 'No winner yet';

// ✅ Good - Optional chaining
const winnerName = auction.winner?.name;

// ❌ Bad - Truthy check for potentially falsy values
if (price) { ... }  // 0 is a valid price!

// ✅ Good - Explicit comparison
if (price !== undefined && price !== null) { ... }
```

---

## 2. React/Next.js Patterns

### Component Structure
```typescript
// src/components/auction/AuctionCard.tsx

// 1. Imports (grouped: external, internal, types)
import { useState } from 'react';
import Link from 'next/link';

import { formatCurrency } from '@/lib/format';
import { CountdownTimer } from './CountdownTimer';

import type { Auction } from '@/types';

// 2. Types/Interfaces
interface AuctionCardProps {
  auction: Auction;
  onBid?: (auctionId: string) => void;
}

// 3. Component
export function AuctionCard({ auction, onBid }: AuctionCardProps) {
  // 3a. Hooks first
  const [isHovered, setIsHovered] = useState(false);
  
  // 3b. Derived state / computations
  const isEnding = new Date(auction.endTime) < Date.now() + 3600000;
  
  // 3c. Event handlers
  const handleBid = () => onBid?.(auction.id);
  
  // 3d. Render
  return (
    <article className={styles.card}>
      {/* ... */}
    </article>
  );
}
```

### Server vs Client Components
```typescript
// ✅ Server Component (default) - for data fetching
// src/app/auctions/page.tsx
import { prisma } from '@/lib/db';

export default async function AuctionsPage() {
  const auctions = await prisma.auction.findMany();
  return <AuctionGrid auctions={auctions} />;
}

// ✅ Client Component - for interactivity
// src/components/BidForm.tsx
'use client';

import { useState } from 'react';

export function BidForm() {
  const [amount, setAmount] = useState('');
  // ...
}
```

### Data Fetching
```typescript
// ✅ Prefer Server Components for initial data
export default async function AuctionPage({ params }: { params: { id: string } }) {
  const auction = await prisma.auction.findUnique({
    where: { id: params.id }
  });
  
  return <AuctionDetail auction={auction} />;
}

// ✅ Use SWR/React Query for client-side refetching
'use client';
import useSWR from 'swr';

export function BidHistory({ auctionId }: { auctionId: string }) {
  const { data, mutate } = useSWR(`/api/auctions/${auctionId}/bids`);
  // ...
}
```

---

## 3. API Routes

### Structure
```typescript
// src/app/api/auctions/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Schema definition
const createAuctionSchema = z.object({
  title: z.string().min(5).max(100),
  startingPrice: z.number().positive(),
  // ...
});

// GET handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  
  const auctions = await prisma.auction.findMany({
    take: 20,
    skip: (page - 1) * 20,
  });
  
  return NextResponse.json({ auctions });
}

// POST handler with validation
export async function POST(request: Request) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Parse and validate
  const body = await request.json();
  const result = createAuctionSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: result.error.issues },
      { status: 400 }
    );
  }
  
  // Create resource
  const auction = await prisma.auction.create({
    data: {
      ...result.data,
      sellerId: session.user.id,
    },
  });
  
  return NextResponse.json({ auction }, { status: 201 });
}
```

### Error Handling
```typescript
// ✅ Consistent error responses
return NextResponse.json(
  { 
    error: 'Resource not found',
    code: 'NOT_FOUND'
  },
  { status: 404 }
);

// ✅ Wrap in try-catch for unexpected errors
try {
  // ... operation
} catch (error) {
  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 4. Database / Prisma

### Query Patterns
```typescript
// ✅ Select only needed fields
const auctions = await prisma.auction.findMany({
  select: {
    id: true,
    title: true,
    currentPrice: true,
    endTime: true,
    _count: { select: { bids: true } }
  }
});

// ✅ Use includes for related data
const auction = await prisma.auction.findUnique({
  where: { id },
  include: {
    seller: { select: { id: true, name: true } },
    bids: { 
      orderBy: { createdAt: 'desc' },
      take: 10 
    }
  }
});

// ✅ Use transactions for related writes
await prisma.$transaction([
  prisma.bid.create({ data: { ... } }),
  prisma.auction.update({ where: { id }, data: { currentPrice } })
]);
```

### Migrations
```bash
# Create migration
npx prisma migrate dev --name add_payment_model

# Apply to production
npx prisma migrate deploy

# Never edit migrations after they're committed
```

---

## 5. Styling (CSS Modules)

### File Naming
```
ComponentName.module.css
```

### Class Naming
```css
/* ✅ Use camelCase for multi-word classes */
.auctionCard { }
.cardHeader { }
.priceLabel { }

/* ✅ Use semantic names */
.active { }
.highlighted { }
.ending { }
```

### Design Tokens
```css
/* src/styles/tokens.css */
:root {
  /* Colors */
  --color-primary: #8B8BB5;
  --color-primary-dark: #6B6B95;
  --color-success: #10B981;
  --color-error: #EF4444;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  
  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

---

## 6. File Organization

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AuctionCard.tsx` |
| Hooks | camelCase, usePrefix | `useAuctionSSE.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Auction.ts` or inline |
| Constants | SCREAMING_SNAKE | `AUCTION_STATUS` |

### Import Order
```typescript
// 1. React/Next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { z } from 'zod';

// 3. Internal imports (use path aliases)
import { formatCurrency } from '@/lib/format';
import { AuctionCard } from '@/components/auction/AuctionCard';

// 4. Types
import type { Auction, Bid } from '@/types';

// 5. Styles
import styles from './Page.module.css';
```

---

## 7. Git Conventions

### Branch Naming
```
feature/user-authentication
fix/bid-validation-error
refactor/auction-queries
```

### Commit Messages
```
feat: add bid validation with minimum increment
fix: prevent users from bidding on own auctions
refactor: extract SSE logic to custom hook
docs: update API documentation
```

### Pre-commit Checks
```bash
# Run before committing
npm run lint
npm run type-check
npm run test
```

---

## 8. Testing

### Test File Location
```
src/
├── components/
│   └── auction/
│       ├── AuctionCard.tsx
│       └── AuctionCard.test.tsx    # Co-located
└── lib/
    ├── validation.ts
    └── validation.test.ts
```

### Test Patterns
```typescript
// Unit test example
import { calculateMinBid } from './bidding';

describe('calculateMinBid', () => {
  it('adds increment to current price', () => {
    expect(calculateMinBid(100, 5)).toBe(105);
  });
  
  it('handles decimal increments', () => {
    expect(calculateMinBid(99.50, 0.50)).toBe(100);
  });
});
```

---

## 9. Security Checklist

- [ ] All user input validated with Zod
- [ ] SQL injection prevented (Prisma parameterization)
- [ ] XSS prevented (React escaping + CSP)
- [ ] CSRF protection enabled (NextAuth)
- [ ] Sensitive data in environment variables
- [ ] Rate limiting on critical endpoints
- [ ] Auth checks on all protected routes
