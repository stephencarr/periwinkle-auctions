# Feature Context: Auctions

> **Status**: Not Started  
> **Last Updated**: 2026-01-18

---

## Overview

Core auction functionality including creation, editing, listing, and lifecycle management.

---

## Technical Implementation

### Files
```
src/
├── app/
│   ├── (main)/
│   │   ├── auctions/
│   │   │   ├── page.tsx              # Browse auctions
│   │   │   ├── [id]/page.tsx         # Auction detail
│   │   │   └── create/page.tsx       # Create auction
│   │   └── dashboard/
│   │       └── auctions/page.tsx     # My auctions
│   └── api/auctions/
│       ├── route.ts                  # GET (list), POST (create)
│       └── [id]/route.ts             # GET, PATCH, DELETE
├── components/auction/
│   ├── AuctionCard.tsx
│   ├── AuctionGrid.tsx
│   ├── AuctionDetail.tsx
│   ├── AuctionForm.tsx
│   ├── ImageUploader.tsx
│   └── CountdownTimer.tsx
└── lib/
    └── auctions.ts                   # Auction utilities
```

### Database
```prisma
model Auction {
  id            String        @id @default(cuid())
  title         String
  description   String
  images        String[]
  category      String
  startingPrice Decimal       @db.Decimal(10, 2)
  currentPrice  Decimal       @db.Decimal(10, 2)
  reservePrice  Decimal?      @db.Decimal(10, 2)
  bidIncrement  Decimal       @db.Decimal(10, 2) @default(1.00)
  startTime     DateTime
  endTime       DateTime
  status        AuctionStatus @default(DRAFT)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  sellerId      String
  seller        User          @relation(...)
  winnerId      String?
  winner        User?         @relation(...)
  bids          Bid[]
  payment       Payment?
}

enum AuctionStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  ENDED
  SOLD
  CANCELLED
}
```

---

## API Endpoints

### GET /api/auctions
```typescript
// Query params
{
  page?: number,
  limit?: number,       // Default 20, max 100
  category?: string,
  status?: AuctionStatus,
  search?: string,
  sort?: 'ending' | 'price' | 'newest'
}

// Response
{
  auctions: Auction[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### POST /api/auctions
```typescript
// Request (auth required)
{
  title: string,
  description: string,
  images: string[],       // URLs from image upload
  category: string,
  startingPrice: number,
  reservePrice?: number,
  bidIncrement: number,
  startTime: string,      // ISO date
  duration: number        // Days: 1, 3, 5, 7, 10
}

// Response 201
{ auction: Auction }
```

### GET /api/auctions/[id]
Full auction details with bid history and seller info.

### PATCH /api/auctions/[id]
Update auction (owner only, limited fields if ACTIVE).

### DELETE /api/auctions/[id]
Delete/cancel auction (owner/admin only).

---

## Auction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                      AUCTION STATES                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DRAFT ──→ SCHEDULED ──→ ACTIVE ──→ ENDED ──→ SOLD          │
│    │           │            │          │                     │
│    └───────────┴────────────┴──────────┴──→ CANCELLED        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### State Transitions
| From | To | Trigger |
|------|-----|---------|
| DRAFT | SCHEDULED | Seller publishes with future start |
| DRAFT | ACTIVE | Seller publishes with immediate start |
| SCHEDULED | ACTIVE | Start time reached (cron job) |
| ACTIVE | ENDED | End time reached (cron job) |
| ENDED | SOLD | Winner pays |
| * | CANCELLED | Seller/admin cancels |

---

## Categories (MVP)
```typescript
const CATEGORIES = [
  'Art & Collectibles',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Jewelry & Watches',
  'Sports & Outdoors',
  'Toys & Hobbies',
  'Vehicles & Parts',
  'Other'
] as const;
```

---

## Image Handling
- Upload to Vercel Blob or similar
- Max 10 images per auction
- Max 5MB per image
- Accepted formats: JPEG, PNG, WebP
- Auto-generate thumbnails

---

## Implementation Notes
- [ ] Create Prisma schema
- [ ] Build API routes with Zod validation
- [ ] Create auction form component
- [ ] Implement image upload
- [ ] Build auction card/grid components
- [ ] Add countdown timer component
- [ ] Set up cron job for status transitions

---

## Validation Rules
```typescript
const auctionSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  images: z.array(z.string().url()).min(1).max(10),
  category: z.enum(CATEGORIES),
  startingPrice: z.number().min(1),
  reservePrice: z.number().min(1).optional(),
  bidIncrement: z.number().min(0.5).default(1),
  startTime: z.string().datetime(),
  duration: z.enum([1, 3, 5, 7, 10])
});
```
