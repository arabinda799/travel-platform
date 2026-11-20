import { describe, it, expect } from 'vitest';
import { formatTimestamp } from './date-format';

describe('formatTimestamp', () => {
  it('formats a known date correctly', () => {
    // 15 December 2026, 14:30
    const d = new Date(2026, 11, 15, 14, 30);
    const result = formatTimestamp(d);
    expect(result).toContain('15 Dec 2026');
    expect(result).toMatch(/2:30\s*(PM|pm)/i);
  });

  it('handles invalid dates gracefully returning dash', () => {
    const result = formatTimestamp('invalid-date-string');
    expect(result).toBe('-');
  });

  it('formats current date if called with default argument', () => {
    const result = formatTimestamp();
    expect(result).toMatch(/\d{2} \w{3} \d{4} \/ \d{1,2}:\d{2}/);
  });
});
