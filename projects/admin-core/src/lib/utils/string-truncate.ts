/**
 * String truncation utilities for table cells and UI labels.
 */

/**
 * Checks whether a value's string representation exceeds the character limit.
 */
export function shouldTruncate(value: unknown, limit = 30): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  return String(value).trim().length > limit;
}

/**
 * Returns truncated text with ellipsis if exceeding the limit.
 */
export function truncateText(value: unknown, limit = 30): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.length <= limit) {
    return str;
  }
  return `${str.slice(0, limit)}...`;
}

/**
 * Returns the full string representation for tooltips.
 */
export function getTruncateTooltip(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
