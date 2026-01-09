/**
 * Timezone utility functions using Luxon and geo-tz
 *
 * This module provides timezone handling for the event management system using:
 * - Luxon: Modern DateTime library with excellent timezone support
 * - geo-tz: Offline coordinate-to-timezone lookup
 *
 * Why these libraries?
 * - Battle-tested and well-maintained
 * - Handle edge cases (DST, timezone rule changes)
 * - Regular updates for IANA timezone database
 * - No API calls needed (geo-tz works offline)
 */

import { DateTime, IANAZone } from 'luxon';
import { find as findTimezone } from 'geo-tz';

/**
 * Common IANA timezone identifiers with friendly names
 */
export const COMMON_TIMEZONES = {
    // North America
    'America/New_York': 'Eastern Time (US & Canada)',
    'America/Chicago': 'Central Time (US & Canada)',
    'America/Denver': 'Mountain Time (US & Canada)',
    'America/Los_Angeles': 'Pacific Time (US & Canada)',
    'America/Anchorage': 'Alaska',
    'Pacific/Honolulu': 'Hawaii',
    'America/Toronto': 'Toronto',
    'America/Vancouver': 'Vancouver',
    'America/Mexico_City': 'Mexico City',

    // Europe
    'Europe/London': 'London',
    'Europe/Paris': 'Paris',
    'Europe/Berlin': 'Berlin',
    'Europe/Rome': 'Rome',
    'Europe/Madrid': 'Madrid',
    'Europe/Amsterdam': 'Amsterdam',
    'Europe/Brussels': 'Brussels',
    'Europe/Vienna': 'Vienna',
    'Europe/Stockholm': 'Stockholm',
    'Europe/Zurich': 'Zurich',
    'Europe/Dublin': 'Dublin',
    'Europe/Moscow': 'Moscow',

    // Asia
    'Asia/Dubai': 'Dubai',
    'Asia/Karachi': 'Karachi',
    'Asia/Kolkata': 'Mumbai, Kolkata, New Delhi',
    'Asia/Dhaka': 'Dhaka',
    'Asia/Bangkok': 'Bangkok',
    'Asia/Singapore': 'Singapore',
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Shanghai': 'Beijing, Shanghai',
    'Asia/Tokyo': 'Tokyo',
    'Asia/Seoul': 'Seoul',

    // Australia & Pacific
    'Australia/Perth': 'Perth',
    'Australia/Adelaide': 'Adelaide',
    'Australia/Brisbane': 'Brisbane',
    'Australia/Sydney': 'Sydney',
    'Australia/Melbourne': 'Melbourne',
    'Pacific/Auckland': 'Auckland',

    // Middle East & Africa
    'Africa/Cairo': 'Cairo',
    'Africa/Johannesburg': 'Johannesburg',
    'Asia/Jerusalem': 'Jerusalem',
    'Asia/Riyadh': 'Riyadh',

    // South America
    'America/Sao_Paulo': 'São Paulo',
    'America/Buenos_Aires': 'Buenos Aires',
    'America/Lima': 'Lima',
    'America/Bogota': 'Bogota',
} as const;

export type TimezoneIdentifier = keyof typeof COMMON_TIMEZONES | string;

/**
 * Detect timezone from coordinates (latitude/longitude)
 * Uses geo-tz library for accurate offline timezone detection
 *
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns IANA timezone identifier
 *
 * @example
 * detectTimezoneFromCoordinates(40.7589, -73.9851) // Returns "America/New_York"
 * detectTimezoneFromCoordinates(51.5074, -0.1278)  // Returns "Europe/London"
 */
export function detectTimezoneFromCoordinates(
    latitude: number,
    longitude: number
): string {
    try {
        const timezones = findTimezone(latitude, longitude);
        // geo-tz returns an array, first result is most accurate
        return timezones[0] || 'UTC';
    } catch (error) {
        console.error('Error detecting timezone from coordinates:', error);
        return 'UTC';
    }
}

/**
 * Get user's browser timezone using Luxon
 * This should be called on the frontend
 */
export function getBrowserTimezone(): string {
    try {
        // Luxon's local() uses system timezone
        const localZone = DateTime.local().zoneName;
        return localZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

/**
 * Validate if a string is a valid IANA timezone identifier using Luxon
 * @param timezone - Timezone string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimezone(timezone: string): boolean {
    return IANAZone.isValidZone(timezone);
}

/**
 * Format a date in a specific timezone using Luxon
 * @param date - Date to format
 * @param timezone - IANA timezone identifier
 * @param format - Luxon format string (default: "DATETIME_FULL")
 * @returns Formatted date string
 *
 * @example
 * formatInTimezone(new Date(), 'America/New_York')
 * // "January 1, 2026, 3:00 PM EST"
 *
 * formatInTimezone(new Date(), 'Europe/London', 'yyyy-MM-dd HH:mm')
 * // "2026-01-01 20:00"
 */
export function formatInTimezone(
    date: Date,
    timezone: string,
    format: string = 'DATETIME_FULL'
): string {
    try {
        const dt = DateTime.fromJSDate(date).setZone(timezone);

        // Use predefined Luxon formats or custom format string
        if (format === 'DATETIME_FULL') {
            return dt.toLocaleString(DateTime.DATETIME_FULL);
        } else if (format === 'DATETIME_MED') {
            return dt.toLocaleString(DateTime.DATETIME_MED);
        } else if (format === 'DATE_FULL') {
            return dt.toLocaleString(DateTime.DATE_FULL);
        } else {
            // Custom format string
            return dt.toFormat(format);
        }
    } catch (error) {
        console.error('Error formatting date in timezone:', error);
        // Fallback to UTC
        return DateTime.fromJSDate(date)
            .setZone('UTC')
            .toLocaleString(DateTime.DATETIME_FULL);
    }
}

/**
 * Get timezone offset in hours using Luxon
 * @param timezone - IANA timezone identifier
 * @param date - Date to get offset for (defaults to now)
 * @returns Offset in hours (e.g., -5 for EST, +5.5 for IST)
 */
export function getTimezoneOffset(
    timezone: string,
    date: Date = new Date()
): number {
    try {
        const dt = DateTime.fromJSDate(date).setZone(timezone);
        return dt.offset / 60; // Luxon returns offset in minutes, convert to hours
    } catch {
        return 0;
    }
}

/**
 * Get timezone abbreviation using Luxon (e.g., EST, PST, IST)
 * @param timezone - IANA timezone identifier
 * @param date - Date to get abbreviation for (defaults to now)
 * @returns Timezone abbreviation
 */
export function getTimezoneAbbreviation(
    timezone: string,
    date: Date = new Date()
): string {
    try {
        const dt = DateTime.fromJSDate(date).setZone(timezone);
        return dt.offsetNameShort || dt.zoneName || 'UTC';
    } catch {
        return 'UTC';
    }
}

/**
 * Convert a date from one timezone to another using Luxon
 * Returns a new Date object representing the same moment in time
 * @param date - Date to convert
 * @param fromTimezone - Source timezone (informational only, date is already in UTC)
 * @param toTimezone - Target timezone
 * @returns Date object (JavaScript dates are always UTC internally)
 */
export function convertTimezone(
    date: Date,
    fromTimezone: string,
    toTimezone: string
): Date {
    // Dates in JavaScript are always stored in UTC
    // This function mainly exists for API compatibility
    // Use formatInTimezone() for display purposes
    return date;
}

/**
 * Get a list of all common timezones with their display names
 * @returns Array of {value: string, label: string} objects for use in dropdowns
 */
export function getTimezoneList(): Array<{ value: string; label: string }> {
    return Object.entries(COMMON_TIMEZONES).map(([value, label]) => ({
        value,
        label: `${label} (${value})`,
    }));
}

/**
 * Get display name for a timezone
 * @param timezone - IANA timezone identifier
 * @returns Display name or the timezone identifier if not found
 */
export function getTimezoneDisplayName(timezone: string): string {
    return (
        COMMON_TIMEZONES[timezone as keyof typeof COMMON_TIMEZONES] || timezone
    );
}

/**
 * Event timezone helpers using Luxon
 */
export const EventTimezoneHelpers = {
    /**
     * Format event time for display to a user
     * Shows both event timezone and user's timezone if different
     *
     * @example
     * formatEventTime(eventDate, "America/New_York", "Europe/London")
     * // "January 1, 2026, 3:00 PM EST (8:00 PM GMT your time)"
     */
    formatEventTime(
        eventDateTime: Date,
        eventTimezone: string,
        userTimezone?: string
    ): string {
        try {
            const eventDt =
                DateTime.fromJSDate(eventDateTime).setZone(eventTimezone);
            const eventTime = eventDt.toLocaleString(DateTime.DATETIME_FULL);

            if (
                userTimezone &&
                userTimezone !== eventTimezone &&
                isValidTimezone(userTimezone)
            ) {
                const userDt =
                    DateTime.fromJSDate(eventDateTime).setZone(userTimezone);
                const userTime = userDt.toLocaleString(
                    DateTime.TIME_WITH_SHORT_OFFSET
                );
                return `${eventTime} (${userTime} your time)`;
            }

            return eventTime;
        } catch (error) {
            console.error('Error formatting event time:', error);
            return eventDateTime.toUTCString();
        }
    },

    /**
     * Check if an event is happening soon (within the next 24 hours)
     */
    isEventSoon(eventDateTime: Date, timezone: string): boolean {
        try {
            const now = DateTime.local();
            const eventDt =
                DateTime.fromJSDate(eventDateTime).setZone(timezone);
            const diffHours = eventDt.diff(now, 'hours').hours;
            return diffHours > 0 && diffHours <= 24;
        } catch {
            return false;
        }
    },

    /**
     * Check if an event is currently happening
     */
    isEventHappening(eventDateTime: Date, durationHours: number = 4): boolean {
        try {
            const now = DateTime.local();
            const eventStart = DateTime.fromJSDate(eventDateTime);
            const eventEnd = eventStart.plus({ hours: durationHours });
            return now >= eventStart && now <= eventEnd;
        } catch {
            return false;
        }
    },

    /**
     * Get a human-readable relative time (e.g., "in 3 hours", "2 days ago")
     */
    getRelativeTime(eventDateTime: Date, timezone: string): string {
        try {
            const eventDt =
                DateTime.fromJSDate(eventDateTime).setZone(timezone);
            return eventDt.toRelative() || '';
        } catch {
            return '';
        }
    },

    /**
     * Get countdown to event in days, hours, minutes
     */
    getCountdown(eventDateTime: Date): {
        days: number;
        hours: number;
        minutes: number;
    } {
        try {
            const now = DateTime.local();
            const eventDt = DateTime.fromJSDate(eventDateTime);
            const diff = eventDt.diff(now, ['days', 'hours', 'minutes']);

            return {
                days: Math.floor(diff.days),
                hours: Math.floor(diff.hours % 24),
                minutes: Math.floor(diff.minutes % 60),
            };
        } catch {
            return { days: 0, hours: 0, minutes: 0 };
        }
    },
};
