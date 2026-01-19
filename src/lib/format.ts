/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | string, currency = 'USD'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(numAmount);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
    }).format(dateObj);
}

/**
 * Format relative time (e.g., "in 2 hours", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffDays) >= 1) {
        return rtf.format(diffDays, 'days');
    }
    if (Math.abs(diffHours) >= 1) {
        return rtf.format(diffHours, 'hours');
    }
    if (Math.abs(diffMinutes) >= 1) {
        return rtf.format(diffMinutes, 'minutes');
    }
    return rtf.format(diffSeconds, 'seconds');
}

/**
 * Format countdown display (e.g., "2d 5h 30m")
 */
export function formatCountdown(endTime: Date | string): string {
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) {
        return 'Ended';
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
}

/**
 * Mask a user's name for privacy (e.g., "John D.")
 */
export function maskName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase() + '***';
    }
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
