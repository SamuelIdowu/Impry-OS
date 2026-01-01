/**
 * Format a date to a human-readable "time from now" string
 * e.g., "2 days from now", "in 3 hours", "tomorrow"
 */
export function formatDistanceToNow(date: string | Date): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = targetDate.getTime() - now.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMs < 0) {
        // Past dates
        const absDiffInDays = Math.abs(diffInDays);
        if (absDiffInDays === 0) {
            return 'earlier today';
        } else if (absDiffInDays === 1) {
            return 'yesterday';
        } else if (absDiffInDays < 7) {
            return `${absDiffInDays} days ago`;
        } else {
            return targetDate.toLocaleDateString();
        }
    } else {
        // Future dates
        if (diffInMinutes < 60) {
            return 'in less than an hour';
        } else if (diffInHours < 24) {
            return `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
        } else if (diffInDays === 0) {
            return 'today';
        } else if (diffInDays === 1) {
            return 'tomorrow';
        } else if (diffInDays < 7) {
            return `in ${diffInDays} days`;
        } else {
            return targetDate.toLocaleDateString();
        }
    }
}

/**
 * Format a date to a short string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    return targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a date to a relative string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = targetDate.getTime() - now.getTime();
    const absDiffInMs = Math.abs(diffInMs);

    const seconds = Math.floor(absDiffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const isPast = diffInMs < 0;

    if (seconds < 60) {
        return isPast ? 'just now' : 'in a moment';
    } else if (minutes < 60) {
        const suffix = isPast ? 'ago' : 'from now';
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ${suffix}`;
    } else if (hours < 24) {
        const suffix = isPast ? 'ago' : 'from now';
        return `${hours} hour${hours !== 1 ? 's' : ''} ${suffix}`;
    } else if (days < 30) {
        const suffix = isPast ? 'ago' : 'from now';
        return `${days} day${days !== 1 ? 's' : ''} ${suffix}`;
    } else {
        return formatDate(targetDate);
    }
}
