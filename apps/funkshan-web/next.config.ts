import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,

    // Set the workspace root for proper file tracing in monorepo
    outputFileTracingRoot: path.join(__dirname, '../../'),

    // Allow cross-origin requests from localhost/127.0.0.1 in development
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
