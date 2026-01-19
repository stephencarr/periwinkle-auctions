# Feature Context: Real-Time Bidding

> **Status**: Not Started  
> **Last Updated**: 2026-01-18

---

## Overview

Real-time bidding system using Server-Sent Events (SSE) for one-way push updates. Enables live bid updates without WebSocket complexity.

---

## Technical Implementation

### Stack
- **Server-Sent Events** - One-way push from server
- **In-Memory Pub/Sub** - For MVP (Redis in production)
- **Polling Fallback** - For older browsers

### Files
```
src/
├── app/api/
│   ├── auctions/[id]/bids/route.ts    # Place bid
│   └── sse/auctions/[id]/route.ts     # SSE stream
├── components/auction/
│   ├── BidPanel.tsx
│   ├── BidHistory.tsx
│   ├── LiveBidIndicator.tsx
│   └── BidForm.tsx
├── hooks/
│   └── useAuctionSSE.ts               # SSE hook
└── lib/
    ├── sse.ts                         # SSE utilities
    └── bid-emitter.ts                 # Event emitter
```

### Database
```prisma
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
```

---

## API Endpoints

### POST /api/auctions/[id]/bids
```typescript
// Request (auth required)
{
  amount: number    // Must be >= currentPrice + bidIncrement
}

// Response 201
{
  bid: {
    id: string,
    amount: number,
    createdAt: string,
    bidder: {
      id: string,
      name: string
    }
  },
  auction: {
    currentPrice: number,
    endTime: string       // May be extended
  }
}

// Error responses
// 400 - Invalid bid amount
// 401 - Not authenticated
// 403 - Cannot bid on own auction
// 404 - Auction not found
// 409 - Auction not active
```

### GET /api/sse/auctions/[id]
```typescript
// SSE stream events

// New bid event
event: bid
data: {
  "id": "clx...",
  "amount": 150.00,
  "createdAt": "2026-01-18T...",
  "bidder": { "id": "...", "name": "John D." },
  "auction": {
    "currentPrice": 150.00,
    "endTime": "2026-01-20T..."
  }
}

// Auction status change
event: status
data: {
  "status": "ENDED",
  "winnerId": "clx..."
}

// Heartbeat (every 30s)
event: ping
data: {}
```

---

## Bidding Rules

### Validation
```typescript
function validateBid(auction: Auction, bidAmount: number, userId: string) {
  // Must be authenticated
  if (!userId) throw new BidError('AUTH_REQUIRED');
  
  // Cannot bid on own auction
  if (auction.sellerId === userId) throw new BidError('OWN_AUCTION');
  
  // Auction must be active
  if (auction.status !== 'ACTIVE') throw new BidError('NOT_ACTIVE');
  
  // Auction must not be ended
  if (new Date() > auction.endTime) throw new BidError('ENDED');
  
  // Bid must meet minimum
  const minBid = auction.currentPrice + auction.bidIncrement;
  if (bidAmount < minBid) throw new BidError('TOO_LOW', { minBid });
}
```

### Anti-Sniping
- If bid placed in final 2 minutes, extend auction by 2 minutes
- Maximum extension: 30 minutes total

```typescript
function maybeExtendAuction(auction: Auction): Date {
  const now = new Date();
  const timeLeft = auction.endTime.getTime() - now.getTime();
  const twoMinutes = 2 * 60 * 1000;
  const maxExtension = 30 * 60 * 1000;
  
  if (timeLeft < twoMinutes) {
    const originalEnd = new Date(auction.startTime.getTime() + auction.duration);
    const maxEnd = new Date(originalEnd.getTime() + maxExtension);
    const newEnd = new Date(now.getTime() + twoMinutes);
    
    return newEnd > maxEnd ? maxEnd : newEnd;
  }
  
  return auction.endTime;
}
```

---

## SSE Implementation

### Server Setup
```typescript
// src/app/api/sse/auctions/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      
      // Subscribe to auction events
      const unsubscribe = bidEmitter.subscribe(params.id, (event, data) => {
        send(event, data);
      });
      
      // Heartbeat
      const heartbeat = setInterval(() => send('ping', {}), 30000);
      
      // Cleanup
      req.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeat);
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

### Client Hook
```typescript
// src/hooks/useAuctionSSE.ts
export function useAuctionSSE(auctionId: string) {
  const [currentPrice, setCurrentPrice] = useState<number>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [status, setStatus] = useState<AuctionStatus>();
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/sse/auctions/${auctionId}`);
    
    eventSource.addEventListener('bid', (e) => {
      const data = JSON.parse(e.data);
      setCurrentPrice(data.auction.currentPrice);
      setBids(prev => [data, ...prev]);
    });
    
    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.status);
    });
    
    return () => eventSource.close();
  }, [auctionId]);
  
  return { currentPrice, bids, status };
}
```

---

## Event Emitter (MVP)
```typescript
// src/lib/bid-emitter.ts
type Listener = (event: string, data: unknown) => void;

class BidEmitter {
  private listeners = new Map<string, Set<Listener>>();
  
  subscribe(auctionId: string, listener: Listener) {
    if (!this.listeners.has(auctionId)) {
      this.listeners.set(auctionId, new Set());
    }
    this.listeners.get(auctionId)!.add(listener);
    
    return () => {
      this.listeners.get(auctionId)?.delete(listener);
    };
  }
  
  emit(auctionId: string, event: string, data: unknown) {
    this.listeners.get(auctionId)?.forEach(listener => {
      listener(event, data);
    });
  }
}

export const bidEmitter = new BidEmitter();
```

---

## Implementation Notes
- [ ] Create Bid model in Prisma
- [ ] Implement bid validation
- [ ] Create SSE route handler
- [ ] Build bid emitter service
- [ ] Create useAuctionSSE hook
- [ ] Build BidPanel component
- [ ] Add anti-sniping logic
- [ ] Implement polling fallback

---

## Performance Considerations
- SSE connections held open per auction viewer
- In-memory emitter fine for MVP scale (single server)
- For scaling: Redis pub/sub across instances
- Close connections on auction end
