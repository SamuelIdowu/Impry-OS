import { describe, it, expect } from 'vitest';
import { formatDate, formatDistanceToNow, formatRelativeTime } from '@/lib/date-utils';

describe('Date Utilities (date-utils.ts)', () => {
  describe('formatDate', () => {
    it('formats valid dates correctly in en-US', () => {
      const date = new Date(2026, 7, 15); // Aug 15, 2026
      const formatted = formatDate(date);
      expect(formatted).toContain('Aug 15, 2026');
    });

    it('handles ISO string inputs', () => {
      const formatted = formatDate('2026-12-25T00:00:00.000Z');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('formatDistanceToNow', () => {
    it('returns "tomorrow" for next day', () => {
      const tomorrow = new Date(Date.now() + 25 * 3600000);
      const res = formatDistanceToNow(tomorrow);
      expect(res).toBe('tomorrow');
    });

    it('returns "yesterday" for 1 day ago', () => {
      const yesterday = new Date(Date.now() - 25 * 3600000);
      const res = formatDistanceToNow(yesterday);
      expect(res).toBe('yesterday');
    });

    it('returns future days string when 3 days away', () => {
      const future = new Date(Date.now() + 3 * 86400000 + 60000);
      const res = formatDistanceToNow(future);
      expect(res).toBe('in 3 days');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for dates <60 seconds ago', () => {
      const pastSeconds = new Date(Date.now() - 10000);
      expect(formatRelativeTime(pastSeconds)).toBe('just now');
    });

    it('returns "in a moment" for dates <60 seconds in future', () => {
      const futureSeconds = new Date(Date.now() + 10000);
      expect(formatRelativeTime(futureSeconds)).toBe('in a moment');
    });

    it('returns minutes ago for dates minutes in past', () => {
      const pastMinutes = new Date(Date.now() - 5 * 60000);
      expect(formatRelativeTime(pastMinutes)).toBe('5 minutes ago');
    });
  });
});
