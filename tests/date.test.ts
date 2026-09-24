import { describe, expect, it } from 'vitest';
import { formatDate } from '../src/lib/date';

describe('formatDate', () => {
  it('formats a date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-03-09T00:00:00Z'))).toBe('Mar 9, 2026');
  });

  it('is timezone-stable for dates near midnight UTC', () => {
    expect(formatDate(new Date('2026-01-01T00:30:00Z'))).toBe('Jan 1, 2026');
  });

  // Regression guard for `timeZone: 'UTC'` in formatDate. z.coerce.date() parses a bare
  // `pubDate: 2026-09-01` as UTC midnight, so without the guard a build machine in a
  // UTC-ahead zone renders the NEXT day. This case fails without it; the two above do not.
  it('does not roll forward a day in a UTC-ahead timezone', () => {
    expect(formatDate(new Date('2026-06-30T23:30:00Z'))).toBe('Jun 30, 2026');
  });
});
