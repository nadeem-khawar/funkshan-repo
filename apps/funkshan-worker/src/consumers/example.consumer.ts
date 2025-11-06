import { Consumer, MessageEnvelope, BaseJob } from '@funkshan/messaging';
import { pino } from 'pino';

/**
 * Example consumer - customize for your specific use case
 * This is a template showing how to create a consumer
 */

// Define your job type
interface ExampleJob extends BaseJob {
    type: 'EXAMPLE_JOB';
    data: {
        message: string;
    };
}

export class ExampleConsumer extends Consumer<ExampleJob> {
    /**
     * Handle incoming messages from the queue
     * Implement your business logic here
     */
    async handleMessage(
        job: ExampleJob,
        envelope: MessageEnvelope<ExampleJob>
    ): Promise<void> {
        this.logger.info(
            {
                jobType: job.type,
                message: job.data.message,
                timestamp: job.timestamp,
                deliveryTag: envelope.fields.deliveryTag,
            },
            'Processing example job'
        );

        // Your business logic here
        // For example:
        // - Send email
        // - Send push notification
        // - Process data
        // - Call external API

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.logger.info('Example job completed successfully');
    }
}
