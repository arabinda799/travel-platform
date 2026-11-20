/**
 * Formats a Date object or timestamp into the standard platform format:
 * "DD MMM YYYY / hh:mm a" (e.g., "19 Nov 2026 / 3:30 PM")
 */
export function formatTimestamp(date: Date | string | number = new Date()): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';

  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return `${day} ${month} ${year} / ${time}`;
}
