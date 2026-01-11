/**
 * Email Service Client using Resend
 */

import { Resend } from 'resend';
import type { SendEmailOptions, EmailSendResult } from './types';

export class EmailClient {
    private resend: Resend;
    private defaultFrom: string;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.RESEND_API_KEY;

        if (!key) {
            throw new Error('RESEND_API_KEY is required');
        }

        this.resend = new Resend(key);
        this.defaultFrom = process.env.EMAIL_FROM || 'noreply@funkshan.com';
    }

    /**
     * Send an email using Resend
     */
    async send(options: SendEmailOptions): Promise<EmailSendResult> {
        try {
            const response = await this.resend.emails.send({
                from: options.from || this.defaultFrom,
                to: options.to,
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo,
                cc: options.cc,
                bcc: options.bcc,
                tags: options.tags,
            });

            if (response.error) {
                return {
                    success: false,
                    error: response.error.message,
                };
            }

            return {
                success: true,
                messageId: response.data?.id,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to send email',
            };
        }
    }

    /**
     * Send multiple emails in batch
     */
    async sendBatch(emails: SendEmailOptions[]): Promise<EmailSendResult[]> {
        const results = await Promise.all(
            emails.map(email => this.send(email))
        );
        return results;
    }
}

// Singleton instance
let emailClientInstance: EmailClient | null = null;

/**
 * Get or create singleton EmailClient instance
 */
export function getEmailClient(apiKey?: string): EmailClient {
    if (!emailClientInstance) {
        emailClientInstance = new EmailClient(apiKey);
    }
    return emailClientInstance;
}
