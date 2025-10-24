import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { User } from '../models';

export default async function apiRoutes(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    // Example GET endpoint
    fastify.get('/', {
        schema: {
            description: 'Get API information',
            tags: ['API'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        description: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            return {
                name: 'Funkshan API',
                version: '1.0.0',
                description: 'RESTful API built with Fastify and TypeScript',
            };
        },
    });

    // Example POST endpoint
    fastify.post('/echo', {
        schema: {
            description: 'Echo endpoint for testing',
            tags: ['API'],
            body: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
                required: ['message'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        echo: { type: 'string' },
                        timestamp: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            const { message } = request.body as { message: string };
            return {
                echo: message,
                timestamp: new Date().toISOString(),
            };
        },
    });

    // Users endpoints - Example of using Mongoose models
    fastify.get('/users', {
        schema: {
            description: 'Get all users',
            tags: ['Users'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        users: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    _id: { type: 'string' },
                                    email: { type: 'string' },
                                    name: { type: 'string' },
                                    createdAt: { type: 'string' },
                                    updatedAt: { type: 'string' },
                                },
                            },
                        },
                        count: { type: 'number' },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            try {
                const users = await User.find()
                    .sort({ createdAt: -1 })
                    .limit(100);
                return {
                    users,
                    count: users.length,
                };
            } catch (error) {
                fastify.log.error({ error }, 'Error fetching users');
                return reply.status(500).send({
                    error: 'Internal Server Error',
                    message: 'Failed to fetch users',
                });
            }
        },
    });

    fastify.post('/users', {
        schema: {
            description: 'Create a new user',
            tags: ['Users'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string', minLength: 2, maxLength: 50 },
                },
                required: ['email', 'name'],
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                email: { type: 'string' },
                                name: { type: 'string' },
                                createdAt: { type: 'string' },
                                updatedAt: { type: 'string' },
                            },
                        },
                    },
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            try {
                const { email, name } = request.body as {
                    email: string;
                    name: string;
                };

                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    reply.status(400).send({
                        error: 'Validation Error',
                        message: 'User with this email already exists',
                    });
                    return;
                }

                const user = new User({ email, name });
                await user.save();

                reply.status(201).send({ user });
            } catch (error) {
                fastify.log.error({ error }, 'Error creating user');

                if (
                    error instanceof Error &&
                    error.name === 'ValidationError'
                ) {
                    reply.status(400).send({
                        error: 'Validation Error',
                        message: error.message,
                    });
                    return;
                }

                return reply.status(500).send({
                    error: 'Internal Server Error',
                    message: 'Failed to create user',
                });
            }
        },
    });

    fastify.get('/users/:id', {
        schema: {
            description: 'Get user by ID',
            tags: ['Users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                },
                required: ['id'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string' },
                                email: { type: 'string' },
                                name: { type: 'string' },
                                createdAt: { type: 'string' },
                                updatedAt: { type: 'string' },
                            },
                        },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                    },
                },
            },
        },
        handler: async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const user = await User.findById(id);

                if (!user) {
                    reply.status(404).send({
                        error: 'Not Found',
                        message: 'User not found',
                    });
                    return;
                }

                return { user };
            } catch (error) {
                fastify.log.error({ error }, 'Error fetching user');
                return reply.status(500).send({
                    error: 'Internal Server Error',
                    message: 'Failed to fetch user',
                });
            }
        },
    });
}
