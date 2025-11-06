/**
 * User Device Repository
 */

import type { PrismaClient, UserDevice, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export class UserDeviceRepository extends BaseRepository<
    UserDevice,
    Prisma.UserDeviceCreateInput,
    Prisma.UserDeviceUpdateInput
> {
    protected modelName = 'userDevice';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Find device by userId and deviceId
     */
    async findByUserAndDevice(
        userId: string,
        deviceId: string
    ): Promise<UserDevice | null> {
        return this.findFirst({
            userId,
            deviceId,
        });
    }

    /**
     * Find all devices for a user
     */
    async findByUserId(userId: string): Promise<UserDevice[]> {
        return this.findMany({ userId });
    }

    /**
     * Find active devices for a user
     */
    async findActiveByUserId(userId: string): Promise<UserDevice[]> {
        return this.findMany({
            userId,
            isActive: true,
        });
    }

    /**
     * Register or update a device
     */
    async registerDevice(
        userId: string,
        deviceId: string,
        deviceData: Partial<Prisma.UserDeviceCreateInput>
    ): Promise<UserDevice> {
        return this.upsert(
            { userId_deviceId: { userId, deviceId } },
            {
                user: { connect: { id: userId } },
                deviceId,
                deviceType: deviceData.deviceType,
                deviceName: deviceData.deviceName,
                pushToken: deviceData.pushToken,
                lastUsedAt: new Date(),
            },
            {
                deviceType: deviceData.deviceType,
                deviceName: deviceData.deviceName,
                pushToken: deviceData.pushToken,
                isActive: true,
                lastUsedAt: new Date(),
            }
        );
    }

    /**
     * Update push token for a device
     */
    async updatePushToken(
        userId: string,
        deviceId: string,
        pushToken: string
    ): Promise<UserDevice> {
        const device = await this.findByUserAndDevice(userId, deviceId);
        if (!device) {
            throw new Error('Device not found');
        }
        return this.update(device.id, { pushToken });
    }

    /**
     * Update last used timestamp
     */
    async updateLastUsed(
        userId: string,
        deviceId: string
    ): Promise<UserDevice> {
        const device = await this.findByUserAndDevice(userId, deviceId);
        if (!device) {
            throw new Error('Device not found');
        }
        return this.update(device.id, { lastUsedAt: new Date() });
    }

    /**
     * Deactivate a device
     */
    async deactivateDevice(
        userId: string,
        deviceId: string
    ): Promise<UserDevice> {
        const device = await this.findByUserAndDevice(userId, deviceId);
        if (!device) {
            throw new Error('Device not found');
        }
        return this.update(device.id, { isActive: false });
    }

    /**
     * Get all devices with push tokens for a user (for sending notifications)
     */
    async findPushTokensByUserId(userId: string): Promise<string[]> {
        const devices = await this.findMany({
            userId,
            isActive: true,
            pushToken: { not: null },
        });
        return devices
            .map(d => d.pushToken)
            .filter((token): token is string => token !== null);
    }

    /**
     * Clean up inactive devices older than specified days
     */
    async cleanupInactiveDevices(
        daysInactive: number
    ): Promise<{ count: number }> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

        return this.deleteMany({
            isActive: false,
            lastUsedAt: {
                lt: cutoffDate,
            },
        });
    }
}
