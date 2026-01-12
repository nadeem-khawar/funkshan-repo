module.exports = {
    apps: [
        {
            name: 'funkshan-api',
            cwd: './apps/funkshan-api',
            script: 'dist/server.js',
            instances: 2,
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: '../../logs/api-error.log',
            out_file: '../../logs/api-out.log',
            merge_logs: true,
            time: true,
        },
        {
            name: 'funkshan-web',
            cwd: './apps/funkshan-web',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3001',
            instances: 1,
            exec_mode: 'fork',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            error_file: '../../logs/web-error.log',
            out_file: '../../logs/web-out.log',
            merge_logs: true,
            time: true,
        },
        {
            name: 'funkshan-worker',
            cwd: './apps/funkshan-worker',
            script: 'dist/index.js',
            instances: 1,
            exec_mode: 'fork',
            env_production: {
                NODE_ENV: 'production',
            },
            error_file: '../../logs/worker-error.log',
            out_file: '../../logs/worker-out.log',
            merge_logs: true,
            time: true,
        },
    ],
};
