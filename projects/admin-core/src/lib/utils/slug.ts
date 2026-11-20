/**
 * Generates a clean, URL-friendly slug from any string input.
 * E.g. "Bali Tour & Packages 2025!" -> "bali-tour-packages-2025"
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Separate accents from characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading and trailing hyphens
}
