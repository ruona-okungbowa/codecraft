/**
 * Utility functions for score visualization and formatting
 */

/**
 * Returns Tailwind color classes based on score thresholds
 * @param score - Score value (0-100)
 * @returns Tailwind text color classes
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 75) return "text-blue-600 dark:text-blue-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

/**
 * Returns background color classes for progress bars
 * @param score - Score value (0-100)
 * @returns Tailwind background color classes
 */
export function getScoreBackgroundColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-blue-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

/**
 * Returns a performance label based on score
 * @param score - Score value (0-100)
 * @returns Human-readable performance label
 */
export function getPerformanceLabel(score: number): string {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
}

/**
 * Returns a percentile estimate based on score
 * @param score - Score value (0-100)
 * @returns Percentile string
 */
export function getPercentile(score: number): string {
  if (score >= 90) return "Top 5%";
  if (score >= 80) return "Top 15%";
  if (score >= 70) return "Top 30%";
  if (score >= 60) return "Top 50%";
  return "Bottom 50%";
}
