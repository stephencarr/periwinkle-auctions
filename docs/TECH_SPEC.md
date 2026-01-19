# Periwinkle Auctions - Technical Specification

> **Version**: 1.0.0-MVP  
> **Last Updated**: 2026-01-18  
> **Status**: Planning

---

## 1. Overview

Periwinkle Auctions is a real-time online auction platform for small/local auctions, featuring user accounts, admin management, and Square payment integration.

---

## 2. Technology Stack

### Core Framework
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Full-stack React, SSR, API routes, excellent DX |
| **Language** | TypeScript | Type safety, better tooling, maintainability |
| **Runtime** | Node.js 20 LTS | Stable, long-term support |

### Data Layer
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Database** | PostgreSQL | Robust, scalable, excellent for relational auction data |
| **ORM** | Prisma | Type-safe queries, migrations, great DX |
| **Caching** | In-memory (MVP) | Redis later if needed |

### Authentication & Security
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Auth** | NextAuth.js v5 | Flexible, supports credentials + OAuth, session handling |
| **Password Hashing** | bcrypt | Industry standard |
| **Sessions** | JWT + Database sessions | Secure, revocable |

### Real-Time
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Push Updates** | Server-Sent Events (SSE) | One-way push, simpler than WebSockets, sufficient for bids |
| **Fallback** | Polling (5s interval) | Browser compatibility |

### Payments
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Provider** | Square | User requirement |
| **Integration** | Square Web Payments SDK | PCI-compliant, handles card input |
| **Webhooks** | Square Webhooks | Payment confirmation, refunds |

### Styling
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **CSS** | CSS Modules | Scoped styles, no runtime overhead |
| **Design System** | Custom tokens | Maintainable, consistent |

### Deployment
| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Frontend/API** | Vercel | Zero-config Next.js hosting, free tier |
| **Database** | Railway PostgreSQL | Easy provisioning, free tier |
| **Domain** | Vercel DNS | Simple SSL, routing |

---

## 3. Architecture

### Directory Structure
```
periwinkle-auctions/
├── .gemini/                    # AI assistant configuration
├── docs/                       # Project documentation
│   ├── features/               # Feature-specific context
│   ├── TECH_SPEC.md
│   ├── PRODUCT_SPEC.md
│   └── CODING_STANDARDS.md
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── (main)/             # Main app routes
│   │   ├── admin/              # Admin panel routes
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # NextAuth endpoints
│   │   │   ├── auctions/       # Auction CRUD
│   │   │   ├── bids/           # Bidding endpoints
│   │   │   ├── payments/       # Square integration
│   │   │   └── sse/            # Server-Sent Events
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── auction/            # Auction-specific components
│   │   └── admin/              # Admin components
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # Auth configuration
│   │   ├── square.ts           # Square client
│   │   └── sse.ts              # SSE utilities
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   └── styles/                 # Global styles, tokens
├── public/                     # Static assets
├── tests/                      # Test files
└── package.json
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Browser                          │
├─────────────────────────────────────────────────────────────────┤
│  React Components  ←──────────────────── SSE (bid updates)      │
│        │                                       ↑                │
│        ↓                                       │                │
│  API Calls (fetch) ──→ Next.js API Routes ─────┘                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Server (Vercel)                          │
├─────────────────────────────────────────────────────────────────┤
│  API Routes ←→ Prisma ORM ←→ PostgreSQL (Railway)               │
│       │                                                          │
│       ↓                                                          │
│  Square SDK ←→ Square API (Payments)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(USER)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  auctions      Auction[] @relation("SellerAuctions")
  bids          Bid[]
  wonAuctions   Auction[] @relation("WinnerAuctions")
}

enum Role {
  USER
  ADMIN
}

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
  seller        User          @relation("SellerAuctions", fields: [sellerId], references: [id])
  winnerId      String?
  winner        User?         @relation("WinnerAuctions", fields: [winnerId], references: [id])
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

model Bid {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  
  auctionId String
  auction   Auction  @relation(fields: [auctionId], references: [id])
  bidderId  String
  bidder    User     @relation(fields: [bidderId], references: [id])
  
  @@index([auctionId, createdAt(sort: Desc)])
}

model Payment {
  id              String        @id @default(cuid())
  squarePaymentId String        @unique
  amount          Decimal       @db.Decimal(10, 2)
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  auctionId       String        @unique
  auction         Auction       @relation(fields: [auctionId], references: [id])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

---

## 5. API Design

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth.js handler |
| `/api/auth/register` | POST | User registration |

### Auctions
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auctions` | GET | - | List auctions (paginated, filterable) |
| `/api/auctions` | POST | User | Create auction |
| `/api/auctions/[id]` | GET | - | Get auction details |
| `/api/auctions/[id]` | PATCH | Owner/Admin | Update auction |
| `/api/auctions/[id]` | DELETE | Owner/Admin | Delete auction |

### Bids
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auctions/[id]/bids` | GET | - | Get bid history |
| `/api/auctions/[id]/bids` | POST | User | Place bid |

### Real-Time
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sse/auctions/[id]` | GET | SSE stream for auction updates |

### Payments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments/create` | POST | User | Create Square payment |
| `/api/payments/webhook` | POST | - | Square webhook handler |

### Admin
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/users` | GET | Admin | List users |
| `/api/admin/users/[id]` | PATCH | Admin | Update user |
| `/api/admin/auctions` | GET | Admin | All auctions (including drafts) |
| `/api/admin/stats` | GET | Admin | Dashboard statistics |

---

## 6. Security Considerations

- **CSRF Protection**: Built into NextAuth.js
- **XSS Prevention**: React's default escaping, CSP headers
- **SQL Injection**: Prisma parameterized queries
- **Rate Limiting**: Implement on bid endpoints (prevent bid sniping abuse)
- **Input Validation**: Zod schemas on all endpoints
- **PCI Compliance**: Square handles all card data (tokenization)

---

## 7. Performance Targets (MVP)

| Metric | Target |
|--------|--------|
| Time to First Byte | < 200ms |
| Largest Contentful Paint | < 2.5s |
| Bid Latency | < 500ms |
| SSE Delivery | < 100ms |
| Concurrent Users | 100+ |

---

## 8. Future Considerations (Post-MVP)

- Redis for caching and SSE pub/sub
- Image optimization pipeline (Sharp)
- Email notifications (Resend/SendGrid)
- Mobile app (React Native)
- Auction categories/subcategories
- Watchlist functionality
- Proxy bidding (auto-bid)
