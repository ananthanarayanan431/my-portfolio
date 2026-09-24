import { describe, expect, it } from 'vitest';
import { formatDate } from '../src/lib/date';

describe('formatDate', () => {
  it('formats a date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-03-09T00:00:00Z'))).toBe('Mar 9, 2026');
  });

  it('is timezone-stable for dates near midnight UTC', () => {
    expect(formatDate(new Date('2026-01-01T00:30:00Z'))).toBe('Jan 1, 2026');
  });
});
