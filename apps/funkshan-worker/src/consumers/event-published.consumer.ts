import {
    Consumer,
    MessageEnvelope,
    EventPublishedJob,
    QUEUES,
} from '@funkshan/messaging';
import { getPrismaClient, InviteStatus } from '@funkshan/database';
import { generateRsvpToken, calculateTokenExpiration } from '@funkshan/utils';
// import { sendInvitationEmail } from '@funkshan/email';

/**
 * Event Published Consumer
 * Processes events when they are published (isDraft = false)
 * Responsibilities:
 * - Generate RSVP tokens for all guests
 * - Update guest invite status to SENT
 * - Send invitation emails to guests
 */
export class EventPublishedConsumer extends Consumer<EventPublishedJob> {
    private prisma = getPrismaClient();

    constructor() {
        const options = {
            prefetch: 1, // Process one event at a time
            retryAttempts: 3,
            retryDelay: 30000, // 30 seconds
            durable: true,
            messageTtl: 86400000, // 24 hours (must match API configuration)
            maxPriority: 10, // Must match API configuration
        };
        console.log(
            'EventPublishedConsumer options:',
            JSON.stringify(options, null, 2)
        );
        super(QUEUES.EVENT_PUBLISHED, options);
    }

    /**
     * Handle event.published messages
     */
    async handleMessage(
        job: EventPublishedJob,
        envelope: MessageEnvelope<EventPublishedJob>
    ): Promise<void> {
        console.log('\n' + '='.repeat(80));
        console.log('🎉 EVENT PUBLISHED - Starting Processing');
        console.log('='.repeat(80));
        console.log('Event ID:', job.eventId);
        console.log('Event Name:', job.eventName);
        console.log('Event Date/Time:', job.eventDateTime);
        console.log('Guest Count:', job.guestCount);
        console.log('User ID:', job.userId);
        console.log('Delivery Tag:', envelope.fields.deliveryTag);
        console.log('='.repeat(80) + '\n');

        this.logger.info(
            {
                eventId: job.eventId,
                eventName: job.eventName,
                eventDateTime: job.eventDateTime,
                guestCount: job.guestCount,
                userId: job.userId,
                deliveryTag: envelope.fields.deliveryTag,
            },
            '📨 Processing event.published message'
        );

        try {
            // 1. Fetch event with guests from database
            console.log('📥 Step 1: Fetching event from database...');
            const event = await this.prisma.event.findUnique({
                where: { id: job.eventId },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    guests: {
                        where: {
                            inviteStatus: InviteStatus.PENDING,
                        },
                    },
                },
            });

            console.log('✅ Event fetched successfully');

            // 2. Validate event exists and is published
            console.log('🔍 Step 2: Validating event...');
            if (!event) {
                console.log('⚠️  Event not found in database');
                this.logger.warn(
                    { eventId: job.eventId },
                    'Event not found, skipping processing'
                );
                return;
            }

            if (event.isDraft) {
                console.log('⚠️  Event is still a draft');
                this.logger.warn(
                    { eventId: job.eventId },
                    'Event is still a draft, skipping processing'
                );
                return;
            }

            if (event.guests.length === 0) {
                console.log('ℹ️  No pending guests to process');
                this.logger.info(
                    { eventId: job.eventId },
                    'No pending guests to process'
                );
                return;
            }

            console.log('✅ Event validated successfully');
            console.log(
                `\n👥 Step 3: Processing ${event.guests.length} guests...`
            );
            console.log('-'.repeat(80));

            this.logger.info(
                {
                    eventId: job.eventId,
                    guestCount: event.guests.length,
                },
                'Processing guests for event'
            );

            // 3. Process each guest
            let successCount = 0;
            let failureCount = 0;

            for (const guest of event.guests) {
                try {
                    console.log(
                        `\n  Processing guest ${successCount + failureCount + 1}/${event.guests.length}: ${guest.name} (${guest.email})`
                    );
                    await this.processGuest(guest, event);
                    successCount++;
                    console.log(
                        `  ✓ Guest ${guest.name} processed successfully`
                    );
                    console.log(
                        `  Progress: ${successCount + failureCount}/${event.guests.length} guests processed`
                    );
                    console.log('-'.repeat(80));
                } catch (error) {
                    failureCount++;
                    console.log(`  ✗ Guest ${guest.name} failed to process`);
                    console.log(
                        `  Error: ${error instanceof Error ? error.message : String(error)}`
                    );
                    console.log('-'.repeat(80));
                    this.logger.error(
                        {
                            err: error,
                            guestId: guest.id,
                            guestName: guest.name,
                        },
                        'Failed to process guest'
                    );
                }
            }

            console.log('\n' + '='.repeat(80));
            console.log('📊 PROCESSING SUMMARY');
            console.log('='.repeat(80));
            console.log('Event:', event.name);
            console.log('Total Guests:', event.guests.length);
            console.log('Successfully Processed:', successCount);
            console.log('Failed:', failureCount);
            console.log(
                'Success Rate:',
                `${Math.round((successCount / event.guests.length) * 100)}%`
            );
            console.log('='.repeat(80) + '\n');

            this.logger.info(
                {
                    eventId: job.eventId,
                    totalGuests: event.guests.length,
                    successCount,
                    failureCount,
                },
                '✅ Event processing completed'
            );

            // If all guests failed, throw error to retry the job
            if (failureCount > 0 && successCount === 0) {
                throw new Error(`All ${failureCount} guests failed to process`);
            }
        } catch (error) {
            this.logger.error(
                {
                    err: error,
                    eventId: job.eventId,
                },
                'Failed to process event'
            );
            throw error; // Re-throw to trigger retry mechanism
        }
    }

    /**
     * Process individual guest
     * Generate RSVP token and update status
     */
    private async processGuest(guest: any, event: any): Promise<void> {
        this.logger.debug(
            {
                guestId: guest.id,
                guestName: guest.name,
                guestEmail: guest.email,
            },
            'Processing guest'
        );

        try {
            // 1. Generate RSVP token if not already exists
            let rsvpToken = guest.rsvpToken;
            let rsvpTokenExpiresAt = guest.rsvpTokenExpiresAt;

            if (!rsvpToken) {
                rsvpToken = generateRsvpToken();
                rsvpTokenExpiresAt = calculateTokenExpiration(event.dateTime);

                console.log(
                    `    → Generated RSVP token (${rsvpToken.substring(0, 8)}...${rsvpToken.substring(rsvpToken.length - 4)})`
                );
                console.log(
                    `    → Token expires: ${rsvpTokenExpiresAt.toISOString()}`
                );

                this.logger.debug(
                    {
                        guestId: guest.id,
                        tokenLength: rsvpToken.length,
                        expiresAt: rsvpTokenExpiresAt,
                    },
                    'Generated RSVP token'
                );
            } else {
                console.log(`    → Using existing RSVP token`);
            }

            // 2. Update guest with token and status
            console.log(`    → Updating guest status to SENT...`);
            await this.prisma.guest.update({
                where: { id: guest.id },
                data: {
                    rsvpToken,
                    rsvpTokenExpiresAt,
                    inviteStatus: InviteStatus.SENT,
                    inviteSentAt: new Date(),
                },
            });

            // 3. Build RSVP URLs
            const webAppUrl =
                process.env.WEB_APP_URL || 'http://localhost:3000';
            const rsvpUrl = `${webAppUrl}/rsvp/${rsvpToken}`;
            const acceptUrl = `${rsvpUrl}?action=accept`;
            const declineUrl = `${rsvpUrl}?action=decline`;

            console.log(`    → Database updated successfully`);
            console.log(`    → RSVP URL: ${rsvpUrl}`);
            console.log(`    → Accept URL: ${acceptUrl}`);
            console.log(`    → Decline URL: ${declineUrl}`);

            // 4. Format date/time for email
            const eventDateTime = new Intl.DateTimeFormat('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
                timeZone: event.venueTimezone,
            }).format(new Date(event.dateTime));

            // 5. Send invitation email
            // TODO: Uncomment when email service is configured with RESEND_API_KEY
            // if (guest.email) {
            //     try {
            //         await sendInvitationEmail({
            //             guestName: guest.name,
            //             eventName: event.name,
            //             eventDateTime,
            //             venueAddress: event.venueAddress,
            //             venueTimezone: event.venueTimezone,
            //             hostName: `${event.user.firstName} ${event.user.lastName}`,
            //             dressCode: event.dressCode || undefined,
            //             details: event.details || undefined,
            //             rsvpUrl,
            //             acceptUrl,
            //             declineUrl,
            //             entryCode: event.qrCode || event.pinCode || undefined,
            //         });
            //
            //         this.logger.info(
            //             {
            //                 guestId: guest.id,
            //                 guestEmail: guest.email,
            //             },
            //             '✅ Invitation email sent successfully'
            //         );
            //     } catch (emailError) {
            //         this.logger.error(
            //             {
            //                 err: emailError,
            //                 guestId: guest.id,
            //                 guestEmail: guest.email,
            //             },
            //             '❌ Failed to send invitation email'
            //         );
            //         // Don't throw - we've already updated the database
            //         // Email can be retried separately
            //     }
            // }

            // Log guest processing (for now, instead of sending email)
            this.logger.info(
                {
                    guestId: guest.id,
                    guestName: guest.name,
                    guestEmail: guest.email,
                    rsvpUrl,
                    acceptUrl,
                    declineUrl,
                    eventName: event.name,
                    eventDateTime,
                    hostName: `${event.user.firstName} ${event.user.lastName}`,
                },
                '📧 Guest processed - Email sending commented out (configure RESEND_API_KEY to enable)'
            );
        } catch (error) {
            this.logger.error(
                {
                    err: error,
                    guestId: guest.id,
                },
                'Failed to process guest'
            );
            throw error;
        }
    }
}
