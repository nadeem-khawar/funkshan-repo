/**
 * Email template data types
 */

/**
 * Event invitation email data
 */
export interface InvitationEmailData {
    guestName: string;
    eventName: string;
    eventDateTime: string; // ISO string or formatted date
    venueAddress: string;
    venueTimezone: string;
    hostName: string;
    dressCode?: string;
    details?: string;
    rsvpUrl: string;
    acceptUrl: string;
    declineUrl: string;
    entryCode?: string; // QR code or PIN
}

/**
 * Event update notification email data
 */
export interface EventUpdateEmailData {
    guestName: string;
    eventName: string;
    hostName: string;
    changedFields: string[];
    newDateTime?: string;
    newVenueAddress?: string;
    rsvpUrl: string;
}

/**
 * Password reset email data
 */
export interface PasswordResetEmailData {
    firstName: string;
    resetUrl: string;
    expiresIn: string; // e.g., "1 hour"
}

/**
 * Email verification email data
 */
export interface EmailVerificationData {
    firstName: string;
    verificationUrl: string;
    expiresIn: string;
}

/**
 * Welcome email data
 */
export interface WelcomeEmailData {
    firstName: string;
    loginUrl: string;
}

/**
 * Email send options
 */
export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    tags?: { name: string; value: string }[];
}

/**
 * Email send result
 */
export interface EmailSendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
