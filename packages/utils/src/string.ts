/**
 * String utility functions
 */

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert a string to title case
 * @param str - String to convert
 * @returns Title cased string
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
}

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, length: number, suffix = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Generate a random string
 * @param length - Length of the string
 * @returns Random string
 */
export function randomString(length: number): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Convert a string to slug format
 * @param str - String to convert
 * @returns Slug string
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
