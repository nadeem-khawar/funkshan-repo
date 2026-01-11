/**
 * @funkshan/email
 * Email service and templates using Resend and Handlebars
 */

// Client
export { EmailClient, getEmailClient } from './client';

// Service functions
export {
    sendInvitationEmail,
    sendEventUpdateEmail,
    sendInvitationEmailsBatch,
} from './service';

// Template rendering (for testing/preview)
export {
    renderTemplate,
    renderInvitationEmail,
    renderEventUpdateEmail,
} from './templates';

// Types
export type {
    InvitationEmailData,
    EventUpdateEmailData,
    PasswordResetEmailData,
    EmailVerificationData,
    WelcomeEmailData,
    SendEmailOptions,
    EmailSendResult,
} from './types';
