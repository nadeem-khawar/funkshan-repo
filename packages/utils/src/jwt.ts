/**
 * JWT token generation and verification utilities
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

// Helper functions to get secrets at runtime (not at module load time)
const getAccessTokenSecret = () =>
    process.env.JWT_ACCESS_SECRET ||
    'default-access-secret-change-in-production';

const getRefreshTokenSecret = () =>
    process.env.JWT_REFRESH_SECRET ||
    'default-refresh-secret-change-in-production';

const getAccessTokenExpiresIn = () =>
    process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const getRefreshTokenExpiresIn = () =>
    process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    tenantId?: string | null;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // in seconds
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, getAccessTokenSecret(), {
        expiresIn: getAccessTokenExpiresIn(),
        issuer: 'funkshan-api',
        audience: 'funkshan-client',
    } as SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, getRefreshTokenSecret(), {
        expiresIn: getRefreshTokenExpiresIn(),
        issuer: 'funkshan-api',
        audience: 'funkshan-client',
    } as SignOptions);
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiration time in seconds
    const expiresIn = getTokenExpirationSeconds(getAccessTokenExpiresIn());

    return {
        accessToken,
        refreshToken,
        expiresIn,
    };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, getAccessTokenSecret(), {
            issuer: 'funkshan-api',
            audience: 'funkshan-client',
        });

        if (typeof decoded === 'string') {
            throw new Error('Invalid token format');
        }

        return decoded as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, getRefreshTokenSecret(), {
            issuer: 'funkshan-api',
            audience: 'funkshan-client',
        });

        if (typeof decoded === 'string') {
            throw new Error('Invalid token format');
        }

        return decoded as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Generate a secure random token (for refresh tokens storage, etc.)
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Convert time string to seconds
 */
function getTokenExpirationSeconds(timeString: string): number {
    // Parse time strings like '15m', '7d', '1h', etc.
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 900; // Default to 15 minutes
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's':
            return value;
        case 'm':
            return value * 60;
        case 'h':
            return value * 60 * 60;
        case 'd':
            return value * 60 * 60 * 24;
        default:
            return 900;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}
