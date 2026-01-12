/**
 * Auth routes index
 */
import { FastifyInstance } from 'fastify';
import { AuthService } from '../../services/AuthService';
import { AuthController } from '../../controllers/AuthController';
import { UserService } from '../../services/UserService';
import { UserController } from '../../controllers/UserController';
import registerRoute from './register';
import loginRoute from './login';
import refreshTokenRoute from './refresh-token';

export default async function authRoutes(fastify: FastifyInstance) {
    // Initialize services and controllers once for all auth routes
    const authService = new AuthService(fastify.prisma);
    const authController = new AuthController(authService);
    const userService = new UserService(fastify.prisma);
    const userController = new UserController(userService);

    // Register routes with shared controller instances
    await fastify.register(registerRoute, { userController });
    await fastify.register(loginRoute, { authController });
    await fastify.register(refreshTokenRoute, { authController });
}
