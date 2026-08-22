/**
 * Returns singular or plural form based on count.
 * Example: pluralize(1, "pet", "pets") => "pet"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Formats a badge label with optional count.
 * Example: formatBadge("healthy", 3) => "healthy (3)"
 */
export function formatBadge(label: string, count?: number): string {
  if (count === undefined) return label;
  return `${label} (${count})`;
}

/**
 * Returns a human-readable status from a code.
 */
export function getStatusLabel(code: string): string {
  switch (code) {
    case "success":
      return "Success";
    case "warning":
      return "Warning";
    case "error":
      return "Error";
    case "info":
      return "Info";
    default:
      return "Unknown";
  }
}
