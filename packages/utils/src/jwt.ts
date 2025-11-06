/**
 * JWT token generation and verification utilities
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

// JWT configuration
const ACCESS_TOKEN_SECRET =
    process.env.JWT_ACCESS_SECRET ||
    'default-access-secret-change-in-production';
const REFRESH_TOKEN_SECRET =
    process.env.JWT_REFRESH_SECRET ||
    'default-refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

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
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'funkshan-api',
        audience: 'funkshan-client',
    } as SignOptions);
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
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
    const expiresIn = getTokenExpirationSeconds(ACCESS_TOKEN_EXPIRES_IN);

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
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
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
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
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
