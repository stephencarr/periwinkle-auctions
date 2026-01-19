/**
 * Auction categories
 */
export const CATEGORIES = [
    'Art & Collectibles',
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Jewelry & Watches',
    'Sports & Outdoors',
    'Toys & Hobbies',
    'Vehicles & Parts',
    'Other',
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Auction durations (in days)
 */
export const DURATIONS = [1, 3, 5, 7, 10] as const;
export type Duration = typeof DURATIONS[number];

/**
 * Bid increment options
 */
export const BID_INCREMENTS = [0.5, 1, 2, 5, 10, 25, 50, 100] as const;

/**
 * Anti-sniping settings
 */
export const ANTI_SNIPING = {
    /** Time window before end to trigger extension (in ms) */
    WINDOW_MS: 2 * 60 * 1000, // 2 minutes
    /** Extension duration (in ms) */
    EXTENSION_MS: 2 * 60 * 1000, // 2 minutes
    /** Maximum total extension (in ms) */
    MAX_EXTENSION_MS: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

/**
 * Image upload constraints
 */
export const IMAGE_LIMITS = {
    MAX_COUNT: 10,
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
