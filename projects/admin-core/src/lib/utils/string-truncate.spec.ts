import { describe, it, expect } from 'vitest';
import { shouldTruncate, truncateText, getTruncateTooltip } from './string-truncate';

describe('string-truncate utilities', () => {
  it('should identify strings exceeding limit', () => {
    expect(shouldTruncate('123456789012345678901234567890', 30)).toBe(false);
    expect(shouldTruncate('1234567890123456789012345678901', 30)).toBe(true);
    expect(shouldTruncate(null, 30)).toBe(false);
    expect(shouldTruncate(undefined, 30)).toBe(false);
  });

  it('should truncate strings exceeding limit with ellipsis', () => {
    const text = 'This is a long string that definitely exceeds thirty characters';
    expect(truncateText(text, 30)).toBe(text.slice(0, 30) + '...');
    expect(truncateText('Short text', 30)).toBe('Short text');
    expect(truncateText(null, 30)).toBe('');
    expect(truncateText(undefined, 30)).toBe('');
  });

  it('should return full string for tooltips', () => {
    const text = 'Special request details';
    expect(getTruncateTooltip(text)).toBe(text);
    expect(getTruncateTooltip(null)).toBe('');
  });
});
