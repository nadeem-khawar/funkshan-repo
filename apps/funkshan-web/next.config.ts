import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,

    // Set the workspace root for proper file tracing in monorepo
    outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
