# Periwinkle Auctions - Product Specification

> **Version**: 1.0.0-MVP  
> **Last Updated**: 2026-01-18  
> **Status**: Planning

---

## 1. Product Vision

Periwinkle Auctions is a simple, elegant online auction platform designed for small and local auction needs. The platform prioritizes ease of use, real-time bidding excitement, and secure payments.

---

## 2. Target Users

### Primary Users
| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| **Sellers** | Individuals or small businesses auctioning items | Easy listing creation, auction management, payment collection |
| **Buyers** | Users looking to bid on items | Browse, bid, track auctions, secure payment |
| **Admins** | Platform operators | User management, auction moderation, analytics |

### Use Cases
- Estate sales going online
- Local charity auctions
- Small business liquidations
- Collector communities
- Community fundraisers

---

## 3. MVP Feature Set

### 3.1 User Authentication
| Feature | Priority | Description |
|---------|----------|-------------|
| Registration | P0 | Email + password signup |
| Login | P0 | Email + password authentication |
| Password Reset | P1 | Email-based password recovery |
| Profile Management | P1 | Update name, email, password |
| Email Verification | P2 | Verify email ownership |

### 3.2 Auction Management

#### For Sellers
| Feature | Priority | Description |
|---------|----------|-------------|
| Create Auction | P0 | Title, description, images, pricing, timing |
| Edit Auction | P0 | Modify draft/scheduled auctions |
| Cancel Auction | P1 | Cancel before first bid |
| View My Auctions | P0 | Dashboard of seller's auctions |
| Auction Analytics | P2 | Views, bid count, watchers |

#### Auction Properties
| Field | Required | Description |
|-------|----------|-------------|
| Title | Yes | 5-100 characters |
| Description | Yes | Rich text, up to 5000 characters |
| Images | Yes | 1-10 images, max 5MB each |
| Category | Yes | Select from predefined list |
| Starting Price | Yes | Minimum $1.00 |
| Reserve Price | No | Hidden minimum sale price |
| Bid Increment | Yes | Default $1.00, minimum $0.50 |
| Start Time | Yes | Now or scheduled future time |
| Duration | Yes | 1, 3, 5, 7, or 10 days |

### 3.3 Browsing & Discovery
| Feature | Priority | Description |
|---------|----------|-------------|
| Homepage | P0 | Featured & ending soon auctions |
| Category Browse | P0 | Filter by category |
| Search | P0 | Full-text search on title/description |
| Filters | P1 | Price range, status, location |
| Sort | P0 | Ending soonest, price, newest |
| Auction Detail | P0 | Full auction view with bid history |

### 3.4 Bidding
| Feature | Priority | Description |
|---------|----------|-------------|
| Place Bid | P0 | Submit bid at or above minimum |
| Real-Time Updates | P0 | SSE push for new bids |
| Bid Validation | P0 | Minimum increment, auction active |
| Bid History | P0 | All bids visible on auction |
| My Bids | P0 | Track all user's bids |
| Outbid Notification | P1 | In-app notification when outbid |

#### Bidding Rules
- Bids must meet or exceed: `currentPrice + bidIncrement`
- Users cannot bid on their own auctions
- Bids are final and cannot be retracted
- Auction extends 2 minutes if bid placed in final 2 minutes (anti-sniping)

### 3.5 Auction Lifecycle
```
DRAFT → SCHEDULED → ACTIVE → ENDED → SOLD
                      ↓
                  CANCELLED
```

| Status | Description |
|--------|-------------|
| DRAFT | Seller is preparing, not visible |
| SCHEDULED | Queued for future start |
| ACTIVE | Live, accepting bids |
| ENDED | Time expired, determining winner |
| SOLD | Winner confirmed, awaiting/received payment |
| CANCELLED | Cancelled by seller/admin |

### 3.6 Payments (Square)
| Feature | Priority | Description |
|---------|----------|-------------|
| Pay for Won Auction | P0 | Square Web Payments SDK integration |
| Payment Confirmation | P0 | Email receipt on successful payment |
| Payment Status | P0 | Track pending/completed payments |
| Refunds | P2 | Admin-initiated refunds via Square |

### 3.7 Admin Panel
| Feature | Priority | Description |
|---------|----------|-------------|
| Dashboard | P0 | Key metrics overview |
| User Management | P0 | View, edit, suspend users |
| Auction Moderation | P0 | View all auctions, edit, cancel |
| Reports | P1 | Basic sales, user activity reports |
| System Settings | P2 | Categories, bid increments, etc. |

---

## 4. User Flows

### 4.1 New User Registration
```
Landing → Register → Verify Email → Browse Auctions
```

### 4.2 Creating an Auction
```
Login → Dashboard → Create Auction → 
Add Details → Upload Images → Set Pricing → 
Set Timing → Preview → Publish
```

### 4.3 Bidding Flow
```
Browse → View Auction → Place Bid → Confirm → 
(Real-time updates) → Win/Lose
```

### 4.4 Winning & Payment
```
Auction Ends → Winner Notification → 
Pay Now → Enter Card (Square) → 
Payment Confirmed → Seller Notified
```

---

## 5. UI/UX Requirements

### Design Principles
1. **Clean & Modern** - Minimalist design with focus on auction items
2. **Trust Signals** - Clear pricing, bid history, seller info
3. **Urgency** - Prominent countdown timers
4. **Mobile-First** - Responsive, touch-friendly

### Key Pages
| Page | Description |
|------|-------------|
| Homepage | Hero, featured auctions, categories |
| Browse | Grid of auctions with filters |
| Auction Detail | Images, description, bidding panel, history |
| Create Auction | Multi-step form |
| User Dashboard | My auctions, my bids, settings |
| Admin Dashboard | Stats, quick actions, recent activity |

### Visual Design
- **Color Palette**: Periwinkle primary (#8B8BB5), dark accents, light backgrounds
- **Typography**: Clean sans-serif (Inter or similar)
- **Imagery**: Large, high-quality auction photos
- **Animations**: Subtle micro-interactions, bid confirmations

---

## 6. Non-Functional Requirements

### Performance
- Page load under 2.5 seconds
- Bid submission under 500ms
- Real-time updates under 100ms latency

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- iOS Safari, Android Chrome

---

## 7. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| User Registration | 50+ users in first month |
| Auctions Created | 20+ auctions |
| Successful Transactions | First 5 completed payments |
| System Uptime | 99.5% |

---

## 8. Out of Scope (MVP)

- Email notifications (in-app only)
- Proxy/automatic bidding
- Multiple payment methods
- Seller payouts (manual initially)
- Mobile app
- Social features (following, sharing)
- Advanced search (saved searches, recommendations)
- Multi-language support
