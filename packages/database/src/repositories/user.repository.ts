/**
 * User Repository
 */

import type { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from './base';

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | undefined;
    password: string;
    deviceId: string;
    deviceType?: string | undefined;
    deviceName?: string | undefined;
    pushToken?: string | undefined;
}

export class UserRepository extends BaseRepository<
    User,
    Prisma.UserCreateInput,
    Prisma.UserUpdateInput
> {
    protected modelName = 'user';

    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.findUnique({ email });
    }

    /**
     * Create a new user with device using nested create
     * Includes business logic validation
     */
    async createUser(userData: CreateUserData): Promise<User> {
        try {
            // Check if email already exists
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email address is already registered');
            }

            // Create user with nested device creation
            const user = await this.model.create({
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    password: userData.password,
                    isEmailVerified: false,
                    devices: {
                        create: {
                            deviceId: userData.deviceId,
                            deviceType: userData.deviceType,
                            deviceName: userData.deviceName,
                            pushToken: userData.pushToken,
                            isActive: true,
                            lastUsedAt: new Date(),
                        },
                    },
                },
            });

            return user;
        } catch (error) {
            this.handleError(error, 'createUser');
        }
    }

    /**
     * Find user by email verification token
     */
    async findByEmailVerificationToken(token: string): Promise<User | null> {
        return this.findFirst({
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: {
                gte: new Date(),
            },
        });
    }

    /**
     * Find user by password reset token
     */
    async findByPasswordResetToken(token: string): Promise<User | null> {
        return this.findFirst({
            passwordResetToken: token,
            passwordResetTokenExpiresAt: {
                gte: new Date(),
            },
        });
    }

    /**
     * Verify user's email
     */
    async verifyEmail(id: string): Promise<User> {
        return this.update(id, {
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            emailVerificationToken: null,
            emailVerificationTokenExpiresAt: null,
        });
    }

    /**
     * Set email verification token
     */
    async setEmailVerificationToken(
        id: string,
        token: string,
        expiresAt: Date
    ): Promise<User> {
        return this.update(id, {
            emailVerificationToken: token,
            emailVerificationTokenExpiresAt: expiresAt,
        });
    }

    /**
     * Set password reset token
     */
    async setPasswordResetToken(
        id: string,
        token: string,
        expiresAt: Date
    ): Promise<User> {
        return this.update(id, {
            passwordResetToken: token,
            passwordResetTokenExpiresAt: expiresAt,
            passwordResetRequestedAt: new Date(),
        });
    }

    /**
     * Reset password and clear reset token
     */
    async resetPassword(id: string, hashedPassword: string): Promise<User> {
        return this.update(id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetTokenExpiresAt: null,
        });
    }

    /**
     * Block a user
     */
    async block(id: string): Promise<User> {
        return this.update(id, { isBlocked: true });
    }

    /**
     * Unblock a user
     */
    async unblock(id: string): Promise<User> {
        return this.update(id, { isBlocked: false });
    }

    /**
     * Find users by tenant ID
     */
    async findByTenantId(tenantId: string): Promise<User[]> {
        return this.findMany({ tenantId });
    }

    /**
     * Find users without a tenant
     */
    async findWithoutTenant(): Promise<User[]> {
        return this.findMany({ tenantId: null });
    }

    /**
     * Find active users
     */
    async findActive(): Promise<User[]> {
        return this.findMany({
            isActive: true,
            isBlocked: false,
        });
    }

    /**
     * Check if email is already registered
     */
    async isEmailRegistered(email: string): Promise<boolean> {
        return this.exists({ email });
    }
}
