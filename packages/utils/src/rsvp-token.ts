/**
 * RSVP Token Generation Utilities
 *
 * Provides secure, time-limited token generation for guest RSVP links.
 * Tokens are cryptographically secure random strings that are stored in the database.
 */

import { randomBytes } from 'crypto';

/**
 * Generate a secure RSVP token for guest invitations
 *
 * @returns A 32-character URL-safe base64 string with 128 bits of entropy
 *
 * @example
 * const token = generateRsvpToken();
 * // Returns: "xK7jP9mQw2vL4nR8sT6yU5zA3bC1dE0f"
 */
export function generateRsvpToken(): string {
    // Generate 24 random bytes (192 bits) which produces 32 base64 characters
    // This provides 128 bits of entropy (more than sufficient for security)
    return randomBytes(24)
        .toString('base64')
        .replace(/\+/g, '-') // Replace + with - for URL safety
        .replace(/\//g, '_') // Replace / with _ for URL safety
        .replace(/=/g, ''); // Remove padding characters
}

/**
 * Calculate the expiration date for an RSVP token
 *
 * Token expiration is calculated based on the event date to ensure the token
 * remains valid until the event occurs (with a small buffer period after).
 *
 * @param eventDate - The date of the event
 * @param bufferDays - Additional days after the event date (default: 7)
 * @returns A Date object representing when the token should expire
 *
 * @example
 * // Event is on Feb 15, token expires on Feb 22 (7 days after event)
 * const expiresAt = calculateTokenExpiration(new Date('2026-02-15'));
 *
 * // Custom buffer: token expires 3 days after event
 * const expiresAt = calculateTokenExpiration(new Date('2026-02-15'), 3);
 */
export function calculateTokenExpiration(
    eventDate: Date,
    bufferDays: number = 7
): Date {
    const expiresAt = new Date(eventDate);
    expiresAt.setDate(expiresAt.getDate() + bufferDays);
    return expiresAt;
}

/**
 * Check if an RSVP token has expired
 *
 * @param expiresAt - The expiration date of the token
 * @returns true if the token has expired, false otherwise
 *
 * @example
 * if (isTokenExpired(guest.rsvpTokenExpiresAt)) {
 *   throw new Error('RSVP link has expired');
 * }
 */
export function isTokenExpired(expiresAt: Date | null | undefined): boolean {
    if (!expiresAt) {
        return false; // No expiration date means token doesn't expire
    }
    return expiresAt < new Date();
}

/**
 * Check if a token is approaching expiration (within specified days)
 *
 * @param expiresAt - The expiration date of the token
 * @param daysThreshold - Number of days before expiration to consider "approaching" (default: 7)
 * @returns true if the token expires within the threshold, false otherwise
 *
 * @example
 * if (isTokenApproachingExpiration(guest.rsvpTokenExpiresAt)) {
 *   // Refresh the token
 *   const newExpiration = calculateTokenExpiration(event.dateTime);
 * }
 */
export function isTokenApproachingExpiration(
    expiresAt: Date | null | undefined,
    daysThreshold: number = 7
): boolean {
    if (!expiresAt) {
        return false;
    }

    const daysUntilExpiry = Math.floor(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry >= 0 && daysUntilExpiry < daysThreshold;
}
