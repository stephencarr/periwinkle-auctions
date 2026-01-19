# Feature Context: Authentication

> **Status**: Not Started  
> **Last Updated**: 2026-01-18

---

## Overview

User authentication system using NextAuth.js v5 with credentials-based login. Supports user registration, login, password reset, and session management.

---

## Technical Implementation

### Stack
- **NextAuth.js v5** - Auth handling
- **bcrypt** - Password hashing
- **Prisma** - User storage
- **JWT + Database Sessions** - Session strategy

### Files
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   └── api/auth/
│       ├── [...nextauth]/route.ts
│       └── register/route.ts
├── lib/
│   └── auth.ts                 # NextAuth config
└── components/
    └── auth/
        ├── LoginForm.tsx
        ├── RegisterForm.tsx
        └── AuthProvider.tsx
```

### Database
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
}

enum Role {
  USER
  ADMIN
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | * | NextAuth handler |
| `/api/auth/register` | POST | Create new user |

### POST /api/auth/register
```typescript
// Request
{
  email: string,      // Valid email
  password: string,   // Min 8 chars, 1 uppercase, 1 number
  name: string        // 2-50 characters
}

// Response 201
{
  id: string,
  email: string,
  name: string
}
```

---

## Session Data
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
  expires: string;
}
```

---

## Security Measures
- Password hashing with bcrypt (12 rounds)
- Rate limiting on login attempts
- CSRF protection (NextAuth built-in)
- Secure HTTP-only cookies
- Session invalidation on password change

---

## Implementation Notes
- [ ] Configure NextAuth in `src/lib/auth.ts`
- [ ] Create credentials provider
- [ ] Build registration API route
- [ ] Create login/register pages
- [ ] Add session provider to app layout
- [ ] Implement protected route middleware

---

## Dependencies
```json
{
  "next-auth": "^5.0.0",
  "bcrypt": "^5.1.1",
  "@types/bcrypt": "^5.0.2"
}
```
