# Feature Context: Payments (Square)

> **Status**: Not Started  
> **Last Updated**: 2026-01-18

---

## Overview

Payment processing using Square Web Payments SDK for PCI-compliant card handling. Winners pay for auctions through the platform.

---

## Technical Implementation

### Stack
- **Square Web Payments SDK** - Client-side card tokenization
- **Square Payments API** - Server-side payment processing
- **Square Webhooks** - Payment status updates

### Files
```
src/
├── app/
│   ├── (main)/auctions/[id]/
│   │   └── pay/page.tsx              # Payment page
│   └── api/
│       ├── payments/
│       │   ├── create/route.ts       # Create payment
│       │   └── webhook/route.ts      # Square webhooks
│       └── square/
│           └── token/route.ts        # Get Square app token
├── components/payment/
│   ├── PaymentForm.tsx
│   ├── SquareCard.tsx
│   └── PaymentStatus.tsx
└── lib/
    └── square.ts                     # Square client
```

### Database
```prisma
model Payment {
  id              String        @id @default(cuid())
  squarePaymentId String        @unique
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)
  receiptUrl      String?
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

## Square Setup

### Environment Variables
```bash
# .env.local
SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxx
SQUARE_ACCESS_TOKEN=<sandbox_access_token>
SQUARE_LOCATION_ID=<location_id>
SQUARE_WEBHOOK_SIGNATURE_KEY=<webhook_key>
SQUARE_ENVIRONMENT=sandbox  # or 'production'
```

### Square Client
```typescript
// src/lib/square.ts
import { Client, Environment } from 'square';

export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

export const paymentsApi = squareClient.paymentsApi;
export const refundsApi = squareClient.refundsApi;
```

---

## API Endpoints

### POST /api/payments/create
```typescript
// Request (auth required, must be auction winner)
{
  auctionId: string,
  sourceId: string,        // Card token from Square SDK
  verificationToken?: string  // SCA verification if needed
}

// Response 200
{
  payment: {
    id: string,
    status: PaymentStatus,
    amount: number,
    receiptUrl: string
  }
}

// Error responses
// 400 - Invalid request
// 401 - Not authenticated
// 403 - Not the auction winner
// 404 - Auction not found
// 409 - Already paid / auction not ended
// 422 - Payment declined
```

### POST /api/payments/webhook
```typescript
// Square sends webhooks for:
// - payment.completed
// - payment.failed
// - refund.completed

// Verify webhook signature
// Update payment status in database
// Trigger notifications
```

---

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Auction Ends                                                 │
│       ↓                                                          │
│  2. Winner clicks "Pay Now"                                      │
│       ↓                                                          │
│  3. Square Web Payments SDK loads card form                      │
│       ↓                                                          │
│  4. User enters card details (handled by Square iframe)          │
│       ↓                                                          │
│  5. SDK tokenizes card → sourceId                                │
│       ↓                                                          │
│  6. Client sends sourceId to /api/payments/create                │
│       ↓                                                          │
│  7. Server calls Square Payments API                             │
│       ↓                                                          │
│  8. Square processes payment                                     │
│       ↓                                                          │
│  9. Payment confirmed → Auction status = SOLD                    │
│       ↓                                                          │
│  10. Seller notified of payment                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Client Implementation

### Loading Square SDK
```typescript
// src/components/payment/SquareCard.tsx
'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Square: any;
  }
}

export function SquareCard({ onTokenize }: { onTokenize: (token: string) => void }) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = async () => {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
      );
      
      const card = await payments.card();
      await card.attach('#card-container');
      setCard(card);
      setLoading(false);
    };
    document.body.appendChild(script);
    
    return () => script.remove();
  }, []);
  
  const handleSubmit = async () => {
    const result = await card.tokenize();
    if (result.status === 'OK') {
      onTokenize(result.token);
    }
  };
  
  return (
    <div>
      <div id="card-container" />
      <button onClick={handleSubmit} disabled={loading}>
        Pay Now
      </button>
    </div>
  );
}
```

---

## Server Implementation

### Create Payment
```typescript
// src/app/api/payments/create/route.ts
import { paymentsApi } from '@/lib/square';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { auctionId, sourceId } = await req.json();
  const session = await auth();
  
  // Validate auction and winner
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId }
  });
  
  if (auction?.winnerId !== session?.user.id) {
    return Response.json({ error: 'Not authorized' }, { status: 403 });
  }
  
  // Create payment with Square
  const { result } = await paymentsApi.createPayment({
    sourceId,
    idempotencyKey: randomUUID(),
    amountMoney: {
      amount: BigInt(auction.currentPrice * 100), // Convert to cents
      currency: 'USD'
    },
    locationId: process.env.SQUARE_LOCATION_ID,
    referenceId: auctionId,
    note: `Payment for auction: ${auction.title}`
  });
  
  // Save payment record
  const payment = await prisma.payment.create({
    data: {
      squarePaymentId: result.payment!.id!,
      amount: auction.currentPrice,
      status: 'COMPLETED',
      receiptUrl: result.payment!.receiptUrl,
      auctionId
    }
  });
  
  // Update auction status
  await prisma.auction.update({
    where: { id: auctionId },
    data: { status: 'SOLD' }
  });
  
  return Response.json({ payment });
}
```

---

## Webhook Handling

```typescript
// src/app/api/payments/webhook/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-square-hmacsha256-signature');
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!);
  hmac.update(body);
  const expectedSignature = hmac.digest('base64');
  
  if (signature !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  switch (event.type) {
    case 'payment.completed':
      // Already handled in create, but useful for async confirmation
      break;
    case 'payment.failed':
      await prisma.payment.update({
        where: { squarePaymentId: event.data.id },
        data: { status: 'FAILED' }
      });
      break;
    case 'refund.completed':
      await prisma.payment.update({
        where: { squarePaymentId: event.data.payment_id },
        data: { status: 'REFUNDED' }
      });
      break;
  }
  
  return Response.json({ received: true });
}
```

---

## Implementation Notes
- [ ] Set up Square Developer account
- [ ] Configure sandbox credentials
- [ ] Implement Square client
- [ ] Create payment API route
- [ ] Build payment form component
- [ ] Set up webhook endpoint
- [ ] Test sandbox payments
- [ ] Add error handling for declined cards

---

## Testing
Square provides test card numbers:
- Success: `4532 0123 4567 8901`
- Declined: `4000 0000 0000 0002`
- Invalid CVV: `4000 0000 0000 0010`

---

## Security
- Card data never touches our servers (Square iframe)
- Webhook signature verification required
- Idempotency keys prevent duplicate charges
- All payment routes require authentication
