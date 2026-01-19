import type { Auction, Bid, User, Payment } from '@prisma/client';

// Re-export Prisma types for convenience
export type { Auction, Bid, User, Payment } from '@prisma/client';
export { AuctionStatus, PaymentStatus, Role } from '@prisma/client';

/**
 * Auction with common relations
 */
export interface AuctionWithSeller extends Auction {
    seller: Pick<User, 'id' | 'name'>;
    _count?: {
        bids: number;
    };
}

export interface AuctionWithDetails extends AuctionWithSeller {
    bids: BidWithBidder[];
    winner?: Pick<User, 'id' | 'name'> | null;
    payment?: Payment | null;
}

/**
 * Bid with bidder info
 */
export interface BidWithBidder extends Bid {
    bidder: Pick<User, 'id' | 'name'>;
}

/**
 * Session user (from NextAuth)
 */
export interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    code?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Auction list query params
 */
export interface AuctionListParams {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    sort?: 'ending' | 'price' | 'newest';
    sellerId?: string;
}

/**
 * Create auction input
 */
export interface CreateAuctionInput {
    title: string;
    description: string;
    images: string[];
    category: string;
    startingPrice: number;
    reservePrice?: number;
    bidIncrement: number;
    startTime: string;
    duration: number;
}

/**
 * Place bid input
 */
export interface PlaceBidInput {
    amount: number;
}

/**
 * SSE Event types
 */
export interface BidEvent {
    id: string;
    amount: number;
    createdAt: string;
    bidder: {
        id: string;
        name: string;
    };
    auction: {
        currentPrice: number;
        endTime: string;
    };
}

export interface StatusEvent {
    status: string;
    winnerId?: string;
}
