/**
 * Date utility functions
 */

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Format a Date object to ISO datetime string
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date): string {
    return date.toISOString();
}

/**
 * Check if a value is a valid Date object
 * @param date - Value to check
 * @returns True if valid date
 */
export function isValidDate(date: unknown): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with added days
 */
export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Get the start of day (00:00:00)
 * @param date - Date to process
 * @returns Date at start of day
 */
export function startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}

/**
 * Get the end of day (23:59:59.999)
 * @param date - Date to process
 * @returns Date at end of day
 */
export function endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
