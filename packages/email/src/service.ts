/**
 * Email Service
 * High-level functions for sending specific types of emails
 */

import { getEmailClient } from './client';
import { renderInvitationEmail, renderEventUpdateEmail } from './templates';
import type {
    InvitationEmailData,
    EventUpdateEmailData,
    EmailSendResult,
} from './types';

/**
 * Send event invitation email
 */
export async function sendInvitationEmail(
    data: InvitationEmailData
): Promise<EmailSendResult> {
    const client = getEmailClient();
    const html = renderInvitationEmail(
        data,
        `You're invited to ${data.eventName}!`
    );

    return await client.send({
        to: data.guestName.includes('@') ? data.guestName : '', // Fallback for missing email
        subject: `You're invited to ${data.eventName}!`,
        html,
        tags: [
            { name: 'type', value: 'invitation' },
            { name: 'event', value: data.eventName },
        ],
    });
}

/**
 * Send event update notification email
 */
export async function sendEventUpdateEmail(
    to: string,
    data: EventUpdateEmailData
): Promise<EmailSendResult> {
    const client = getEmailClient();
    const html = renderEventUpdateEmail(
        data,
        `${data.eventName} - Details Updated`
    );

    return await client.send({
        to,
        subject: `${data.eventName} - Details Updated`,
        html,
        tags: [
            { name: 'type', value: 'event-update' },
            { name: 'event', value: data.eventName },
        ],
    });
}

/**
 * Send invitation emails in batch
 */
export async function sendInvitationEmailsBatch(
    invitations: InvitationEmailData[]
): Promise<EmailSendResult[]> {
    const results = await Promise.all(
        invitations.map(invitation => sendInvitationEmail(invitation))
    );
    return results;
}
