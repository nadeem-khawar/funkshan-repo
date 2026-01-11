/**
 * Authentication Service
 * Handles user authentication, token generation, and related operations
 */

import type { PrismaClient } from '@funkshan/database';
import { UserRepository } from '@funkshan/database';
import {
    verifyPassword,
    generateTokenPair,
    type JwtPayload,
} from '@funkshan/utils';
import type { LoginRequest, UserProfile } from '@funkshan/api-contracts';

export class AuthService {
    private userRepository: UserRepository;

    constructor(private prisma: PrismaClient) {
        this.userRepository = new UserRepository(prisma);
    }

    /**
     * Authenticate user with email and password
     */
    async login(loginData: LoginRequest): Promise<{
        user: UserProfile;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }> {
        const { email, password } = loginData;

        // Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is blocked
        if (user.isBlocked) {
            throw new Error(
                'Account has been blocked. Please contact support.'
            );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is inactive. Please contact support.');
        }

        // Generate JWT tokens
        const jwtPayload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
        };

        const { accessToken, refreshToken, expiresIn } =
            generateTokenPair(jwtPayload);

        // Prepare user profile (exclude sensitive information)
        const userProfile: UserProfile = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            tenantId: user.tenantId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return {
            user: userProfile,
            accessToken,
            refreshToken,
            expiresIn,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }> {
        try {
            // Verify refresh token
            const payload = this.verifyRefreshToken(refreshToken);

            // Find user to ensure they still exist and are active
            const user = await this.userRepository.findById(payload.userId);
            if (!user || user.isBlocked || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            // Generate new token pair
            const newJwtPayload: JwtPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            };

            return generateTokenPair(newJwtPayload);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Verify access token
     */
    verifyAccessToken(token: string): JwtPayload {
        const { verifyAccessToken } = require('@funkshan/utils');
        return verifyAccessToken(token);
    }

    /**
     * Verify refresh token
     */
    verifyRefreshToken(token: string): JwtPayload {
        const { verifyRefreshToken } = require('@funkshan/utils');
        return verifyRefreshToken(token);
    }

    /**
     * Logout user (in a stateless JWT system, this is mainly for client-side token cleanup)
     */
    async logout(userId: string): Promise<void> {
        // In a stateless JWT system, logout is typically handled client-side
        // However, you could implement token blacklisting here if needed

        // For now, we'll just validate that the user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Future enhancement: Add token to blacklist table
        // await this.tokenBlacklistRepository.addToken(token, expiresAt);
    }
}
