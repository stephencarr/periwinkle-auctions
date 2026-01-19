# Feature Context: Admin Panel

> **Status**: Not Started  
> **Last Updated**: 2026-01-18

---

## Overview

Administrative interface for platform management including user management, auction moderation, and basic analytics.

---

## Technical Implementation

### Files
```
src/
├── app/admin/
│   ├── layout.tsx              # Admin layout with nav
│   ├── page.tsx                # Dashboard
│   ├── users/
│   │   ├── page.tsx            # User list
│   │   └── [id]/page.tsx       # User detail
│   ├── auctions/
│   │   ├── page.tsx            # All auctions
│   │   └── [id]/page.tsx       # Auction detail/edit
│   └── reports/page.tsx        # Basic reports
├── app/api/admin/
│   ├── users/route.ts
│   ├── users/[id]/route.ts
│   ├── auctions/route.ts
│   └── stats/route.ts
├── components/admin/
│   ├── AdminSidebar.tsx
│   ├── DashboardStats.tsx
│   ├── UserTable.tsx
│   ├── AuctionTable.tsx
│   └── RecentActivity.tsx
└── middleware.ts               # Admin route protection
```

---

## Route Protection

```typescript
// src/middleware.ts
import { auth } from './lib/auth';

export default async function middleware(req: Request) {
  const session = await auth();
  
  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user) {
      return NextResponse.redirect('/login');
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.redirect('/');
    }
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};
```

---

## Dashboard

### Stats Overview
```typescript
interface DashboardStats {
  users: {
    total: number;
    newThisWeek: number;
    activeToday: number;
  };
  auctions: {
    total: number;
    active: number;
    endingToday: number;
  };
  bids: {
    totalToday: number;
    totalThisWeek: number;
  };
  payments: {
    totalRevenue: number;
    revenueThisWeek: number;
    pendingPayments: number;
  };
}
```

### API: GET /api/admin/stats
```typescript
// Response
{
  users: { total: 150, newThisWeek: 12, activeToday: 45 },
  auctions: { total: 89, active: 23, endingToday: 5 },
  bids: { totalToday: 156, totalThisWeek: 892 },
  payments: { totalRevenue: 15420.00, revenueThisWeek: 2340.00, pendingPayments: 3 }
}
```

---

## User Management

### User List
| Column | Description |
|--------|-------------|
| Name | User's display name |
| Email | Email address |
| Role | USER / ADMIN |
| Status | Active / Suspended |
| Joined | Registration date |
| Auctions | Count of auctions created |
| Bids | Count of bids placed |
| Actions | View, Edit, Suspend |

### API: GET /api/admin/users
```typescript
// Query params
{
  page?: number,
  limit?: number,
  search?: string,
  role?: 'USER' | 'ADMIN',
  status?: 'active' | 'suspended'
}

// Response
{
  users: User[],
  pagination: { page, limit, total, totalPages }
}
```

### API: PATCH /api/admin/users/[id]
```typescript
// Request
{
  role?: 'USER' | 'ADMIN',
  suspended?: boolean
}

// Response
{ user: User }
```

---

## Auction Moderation

### Auction List (Admin View)
Shows ALL auctions including drafts and cancelled.

| Column | Description |
|--------|-------------|
| Title | Auction title (linked) |
| Seller | Seller name |
| Status | Current status |
| Price | Current/starting price |
| Bids | Bid count |
| Ends | End time |
| Actions | View, Edit, Cancel, Delete |

### Admin Actions
| Action | Description |
|--------|-------------|
| View | See full auction details |
| Edit | Modify any auction field |
| Cancel | Cancel active auction |
| Delete | Remove auction entirely |
| Feature | Mark as featured on homepage |

### API: GET /api/admin/auctions
```typescript
// Query params
{
  page?: number,
  limit?: number,
  status?: AuctionStatus,
  sellerId?: string,
  search?: string
}
```

### API: PATCH /api/admin/auctions/[id]
Admins can update any field without ownership restrictions.

### API: DELETE /api/admin/auctions/[id]
Permanently delete auction (with confirmation).

---

## Reports (MVP)

### Basic Reports
1. **Sales Report** - Completed auctions, total revenue, by period
2. **User Activity** - Active users, registrations, by period
3. **Popular Categories** - Auctions by category, success rate

### API: GET /api/admin/reports/sales
```typescript
// Query params
{
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month'
}

// Response
{
  summary: {
    totalSales: number,
    totalRevenue: number,
    averagePrice: number
  },
  data: Array<{
    period: string,
    sales: number,
    revenue: number
  }>
}
```

---

## Admin UI Components

### Sidebar Navigation
```typescript
const adminNavItems = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/users', icon: 'users', label: 'Users' },
  { href: '/admin/auctions', icon: 'gavel', label: 'Auctions' },
  { href: '/admin/reports', icon: 'chart', label: 'Reports' },
  { href: '/admin/settings', icon: 'settings', label: 'Settings' }
];
```

### Data Tables
- Sortable columns
- Pagination
- Search/filter
- Bulk actions (future)
- Export to CSV (future)

---

## Implementation Notes
- [ ] Create admin layout with sidebar
- [ ] Build dashboard page with stats
- [ ] Implement user management pages
- [ ] Create auction moderation pages
- [ ] Add basic reports
- [ ] Implement admin API routes
- [ ] Add admin role check middleware

---

## Security Considerations
- All admin routes protected by middleware
- Admin actions logged for audit trail
- Sensitive actions require confirmation
- Session timeout shorter for admin sessions

---

## Future Enhancements (Post-MVP)
- Audit log viewer
- Bulk user actions
- Advanced analytics dashboard
- System settings management
- Content moderation queue
- Email template editor
