/**
 * Returns singular or plural form based on count.
 * Example: pluralize(1, "pet", "pets") => "pet"
 */
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

/**
 * Formats a badge label with optional count.
 * Example: formatBadge("healthy", 3) => "healthy (3)"
 */
export const formatBadge = (label: string, count?: number): string => {
  if (count === undefined) return label;
  return `${label} (${count})`;
};
