/**
 * User Service - Business logic for user operations
 */
import type { PrismaClient, User } from '@funkshan/database';
import { UserRepository } from '@funkshan/database';
import type { CreateUserRequest } from '@funkshan/api-contracts';
import { hashPassword } from '@funkshan/utils';

export class UserService {
    private userRepository: UserRepository;

    constructor(private prisma: PrismaClient) {
        this.userRepository = new UserRepository(prisma);
    }

    /**
     * Register a new user
     */
    async registerUser(userData: CreateUserRequest): Promise<User> {
        // Hash the password
        const hashedPassword = await hashPassword(userData.password);

        // Create user with device (repository handles validation and nested create)
        const user = await this.userRepository.createUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            password: hashedPassword,
            deviceId: userData.deviceId,
            deviceType: userData.deviceType,
            deviceName: userData.deviceName,
            pushToken: userData.pushToken,
        });

        // TODO: Send email verification
        // await this.sendEmailVerification(user.email);

        return user;
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User | null> {
        return this.userRepository.findById(id);
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findByEmail(email);
    }
}
