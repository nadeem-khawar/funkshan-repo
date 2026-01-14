# Deployment Guide - Hetzner Server

## Overview

This document outlines the deployment automation process for the Funkshan monorepo on a Hetzner server using GitHub Actions, nginx, PM2, and RabbitMQ.

## Architecture

- **Web App**: Next.js (funkshan-web) → Port 3001
- **API**: Fastify (funkshan-api) → Port 3000
- **Worker**: Background jobs (funkshan-worker)
- **Database**: PostgreSQL hosted on Prisma Cloud
- **Message Queue**: RabbitMQ on server
- **Reverse Proxy**: nginx with SSL

## Server Requirements

### Recommended Server Specs

**Hetzner CCX23** (Dedicated CPU Cloud Server)

- 4 dedicated vCPU cores
- 16 GB RAM
- 160 GB SSD
- 20 TB traffic
- ~€26/month

**Resource Allocation:**

- Next.js Web: 2 GB RAM, 1 CPU core
- Fastify API: 1-2 GB RAM, 1-2 CPU cores
- Worker: 1 GB RAM, 1 CPU core
- RabbitMQ: 2 GB RAM, 0.5 CPU core
- nginx: 100 MB RAM, 0.5 CPU core
- System + Buffer: 8 GB RAM

### Software Stack

- Ubuntu 24.04 LTS
- Node.js 20.x LTS
- pnpm 8.x
- nginx
- RabbitMQ
- PM2 (process manager)
- Git

### Firewall Ports

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 5672 (RabbitMQ - internal only)
- 15672 (RabbitMQ Management - optional)

## Automated Server Setup (Recommended)

### Using Cloud-Init Script

Hetzner allows you to use cloud-init to automate server configuration (up to 32 KiB). This is the **recommended approach** as it:

- ✅ Automates the entire base setup
- ✅ Ensures consistency across deployments
- ✅ Reduces setup time from ~1 hour to ~10 minutes
- ✅ Eliminates manual errors
- ✅ Is version controlled and repeatable

**Steps:**

1. **Prepare the cloud-init script:**
    - Open [`docs/cloud-init.yaml`](./cloud-init.yaml)
    - Replace `YOUR_PUBLIC_KEY` with your GitHub Actions SSH public key
    - Review and adjust settings as needed

2. **Create server in Hetzner Cloud Console:**
    - Choose **CCX23** (Dedicated CPU Cloud Server)
    - Select **Ubuntu 24.04 LTS**
    - In **Cloud config** section, paste the contents of `cloud-init.yaml`
    - Add your personal SSH key for emergency access
    - Click **Create & Buy now**

3. **Wait for initialization:**
    - Server will be created and cloud-init will run automatically
    - Takes approximately 5-10 minutes
    - Monitor progress: `ssh root@SERVER_IP 'tail -f /var/log/cloud-init-output.log'`

4. **Post-setup tasks:**

    ```bash
    # SSH as funkshan user
    ssh funkshan@SERVER_IP

    # Configure RabbitMQ user
    sudo rabbitmqctl add_user funkshan YOUR_SECURE_PASSWORD
    sudo rabbitmqctl set_user_tags funkshan administrator
    sudo rabbitmqctl set_permissions -p / funkshan ".*" ".*" ".*"
    sudo rabbitmqctl set_vm_memory_high_watermark 0.125

    # Verify installations
    node --version
    pnpm --version
    pm2 --version
    sudo rabbitmqctl status
    sudo nginx -t
    ```

5. **Continue with application setup:**
    - Continue to [Configure nginx Sites](#configure-nginx-sites)
    - Then proceed to [Setup SSL with Let's Encrypt](#setup-ssl-with-lets-encrypt)

**What the cloud-init script does:**

- ✓ Creates `funkshan` user with sudo access
- ✓ Installs Node.js 20.x, pnpm, PM2
- ✓ Installs and configures RabbitMQ
- ✓ Installs and optimizes nginx for CCX23
- ✓ Configures UFW firewall
- ✓ Applies kernel optimizations
- ✓ Creates application directories
- ✓ Sets up SSH keys

## Application Setup

After completing the automated server setup, proceed with these steps to deploy your application.

### Configure nginx Sites

Create nginx site configuration at `/etc/nginx/sites-available/funkshan`:

    sudo nano /etc/nginx/sites-available/funkshan

```nginx
# API Server - HTTP (temporary, certbot will add HTTPS)
server {
    listen 80;
    server_name api.funkshan.com;

    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web App - HTTP (temporary, certbot will add HTTPS)
server {
    listen 80;
    server_name funkshan.com www.funkshan.com;

    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart nginx:

```bash
sudo ln -s /etc/nginx/sites-available/funkshan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Setup SSL with Let's Encrypt

```bash
# Obtain certificates (certbot already installed via cloud-init)
sudo certbot --nginx -d funkshan.com -d www.funkshan.com -d api.funkshan.com

# Auto-renewal is configured automatically
```

### Clone Application Repository

```bash
# As funkshan user (application directory already created via cloud-init)
cd ~/apps/funkshan-repo

# Clone repository (use SSH if you have deploy keys setup)
git clone git@github.com:nadeem-khawar/funkshan-repo.git .

# Or use HTTPS (requires GitHub token or public repo)
# git clone https://github.com/nadeem-khawar/funkshan-repo.git .
```

### Setup Environment Variables

Create `/home/funkshan/apps/funkshan-repo/.env.production`:

cd ~/apps/funkshan-repo
nano .env.production

```bash
# Application
NODE_ENV=production

# Database (Prisma Cloud)
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/funkshan"

# RabbitMQ
RABBITMQ_URL="amqp://funkshan:YOUR_PASSWORD@localhost:5672"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"

# Email (if applicable)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM=""

# API
API_URL="https://api.funkshan.com"
API_PORT=3000

# Web
NEXT_PUBLIC_API_URL="https://api.funkshan.com"
WEB_PORT=3001

# Other secrets
# Add any other environment variables your apps need
```

### Create PM2 Ecosystem File

Create `/home/funkshan/apps/funkshan-repo/ecosystem.config.js`:

```javascript
module.exports = {
    apps: [
        {
            name: 'funkshan-api',
            cwd: './apps/funkshan-api',
            script: 'dist/server.js',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: '../../logs/api-error.log',
            out_file: '../../logs/api-out.log',
            merge_logs: true,
            time: true,
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
        },
        {
            name: 'funkshan-web',
            cwd: './apps/funkshan-web',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3001',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '2G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            error_file: '../../logs/web-error.log',
            out_file: '../../logs/web-out.log',
            merge_logs: true,
            time: true,
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
        },
        {
            name: 'funkshan-worker',
            cwd: './apps/funkshan-worker',
            script: 'dist/index.js',
            instances: 1,
            exec_mode: 'fork',
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
            },
            error_file: '../../logs/worker-error.log',
            out_file: '../../logs/worker-out.log',
            merge_logs: true,
            time: true,
            autorestart: true,
            watch: false,
            max_restarts: 10,
            min_uptime: '10s',
        },
    ],
};
```

**Note:** This configuration is optimized for a CCX23 server (4 cores, 16 GB RAM). It runs the compiled JavaScript files from the `dist` folder and includes memory limits and restart policies to prevent crashes. To scale the API to 2 instances under high load, change `instances: 2` and `exec_mode: 'cluster'`.

## GitHub Actions Workflow

### Required GitHub Secrets

Add these secrets in GitHub repository settings (Settings → Secrets and variables → Actions):

- `HETZNER_HOST`: Server IP or hostname
- `HETZNER_USER`: `funkshan`
- `HETZNER_SSH_KEY`: Private SSH key (pair of the public key added to server)
- `ENV_PRODUCTION`: Contents of `.env.production` file (Base64 encoded)

### Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hetzner

on:
    push:
        branches: [main]
    workflow_dispatch:

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - name: Checkout code
              uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: '20'

            - name: Install pnpm
              uses: pnpm/action-setup@v2
              with:
                  version: 9

            - name: Get pnpm store directory
              shell: bash
              run: |
                  echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

            - name: Setup pnpm cache
              uses: actions/cache@v3
              with:
                  path: ${{ env.STORE_PATH }}
                  key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
                  restore-keys: |
                      ${{ runner.os }}-pnpm-store-

            - name: Install dependencies
              run: pnpm install --frozen-lockfile

            - name: Generate Prisma Client
              run: cd packages/database && pnpm prisma generate

            - name: Build packages
              run: |
                  pnpm --filter @funkshan/shared-types build
                  pnpm --filter @funkshan/validation build
                  pnpm --filter @funkshan/utils build
                  pnpm --filter @funkshan/api-contracts build
                  pnpm --filter @funkshan/database build
                  pnpm --filter @funkshan/email build
                  pnpm --filter @funkshan/messaging build

            - name: Run tests
              run: pnpm test || true

            - name: Build applications
              run: |
                  pnpm --filter funkshan-api build
                  pnpm --filter funkshan-web build
                  pnpm --filter funkshan-worker build

            - name: Setup SSH
              run: |
                  mkdir -p ~/.ssh
                  echo "${{ secrets.HETZNER_SSH_KEY }}" > ~/.ssh/id_rsa
                  chmod 600 ~/.ssh/id_rsa
                  ssh-keyscan -H ${{ secrets.HETZNER_HOST }} >> ~/.ssh/known_hosts

            - name: Deploy to server
              run: |
                  ssh ${{ secrets.HETZNER_USER }}@${{ secrets.HETZNER_HOST }} << 'EOF'
                    cd ~/apps/funkshan-repo

                    # Pull latest code
                    git fetch origin main
                    git reset --hard origin/main

                    # Install dependencies
                    pnpm install --frozen-lockfile --prod=false

                    # Generate Prisma Client
                    cd packages/database && pnpm prisma generate && cd ../..

                    # Build packages and apps
                    pnpm --filter @funkshan/shared-types build
                    pnpm --filter @funkshan/validation build
                    pnpm --filter @funkshan/utils build
                    pnpm --filter @funkshan/api-contracts build
                    pnpm --filter @funkshan/database build
                    pnpm --filter @funkshan/email build
                    pnpm --filter @funkshan/messaging build
                    pnpm --filter funkshan-api build
                    pnpm --filter funkshan-web build
                    pnpm --filter funkshan-worker build

                    # Run database migrations
                    cd packages/database
                    pnpm prisma migrate deploy
                    cd ../..

                    # Restart services
                    pm2 reload ecosystem.config.js --env production
                    pm2 save
                  EOF

            - name: Health check
              run: |
                  sleep 10
                  curl -f https://api.funkshan.com/health || exit 1
```

## Deployment Process

### Automated Deployment (via GitHub Actions)

1. Push code to `main` branch
2. GitHub Actions automatically:
    - Builds all packages
    - Runs tests
    - SSHs to server
    - Pulls latest code
    - Installs dependencies
    - Builds applications
    - Runs migrations
    - Restarts PM2 services
    - Performs health check

### Manual Deployment (SSH to server)

```bash
ssh funkshan@your-server-ip
cd ~/apps/funkshan-repo

# Pull latest code
git pull origin main

# Install dependencies
pnpm install --frozen-lockfile

# Build everything
pnpm build:all

# Run migrations
cd packages/database && pnpm prisma migrate deploy && cd ../..

# Restart services
pm2 reload ecosystem.config.js --env production
pm2 save

# Check status
pm2 status
pm2 logs
```

## Database Migrations

Since the database is hosted on Prisma Cloud:

1. **Development**: Run `pnpm prisma migrate dev` locally
2. **Commit**: Migration files are committed to git
3. **Production**: GitHub Actions runs `pnpm prisma migrate deploy` on server
4. **Manual**: SSH to server and run migrations if needed

## Monitoring & Logs

### View PM2 Status

```bash
pm2 status
pm2 monit
```

### View Logs

```bash
# All logs
pm2 logs

# Specific app
pm2 logs funkshan-api
pm2 logs funkshan-web
pm2 logs funkshan-worker

# Log files location
tail -f ~/apps/funkshan-repo/logs/*.log
```

### nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### RabbitMQ Management

- Access at: `http://your-server-ip:15672`
- Default credentials: `funkshan` / `YOUR_PASSWORD`

## Rollback Strategy

### Quick Rollback (via Git)

```bash
ssh funkshan@your-server-ip
cd ~/apps/funkshan-repo

# Find commit to rollback to
git log --oneline -n 10

# Rollback
git reset --hard COMMIT_HASH
pnpm install --frozen-lockfile
pnpm build:all
pm2 reload ecosystem.config.js --env production
```

### Database Rollback

```bash
# If migration needs to be reverted
cd packages/database
pnpm prisma migrate resolve --rolled-back MIGRATION_NAME
```

## Security Checklist

- [ ] SSH key authentication only (disable password auth)
- [ ] Firewall configured (ufw or iptables)
- [ ] SSL certificates installed and auto-renewal configured
- [ ] Secrets in `.env.production` are secure
- [ ] RabbitMQ uses strong password
- [ ] GitHub Actions secrets are set
- [ ] Database connection string secured
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

## Performance Monitoring

### Resource Usage Checks

Regularly monitor resource usage to ensure optimal performance:

```bash
# Check CPU and memory usage
htop

# Check disk usage
df -h

# Check disk I/O
iostat -x 1

# Check network connections
ss -s

# Check PM2 resource usage
pm2 monit

# Check nginx status
systemctl status nginx

# Check RabbitMQ memory usage
sudo rabbitmqctl status | grep memory
```

### Performance Baselines (CCX23)

**Normal Load:**

- CPU: 20-40% average
- Memory: 8-10 GB used (50-60%)
- Disk I/O: < 50 MB/s
- Network: < 100 Mbps

**High Load:**

- CPU: 60-80% average
- Memory: 12-14 GB used (75-85%)
- Disk I/O: < 100 MB/s
- Network: < 500 Mbps

**Critical (Time to Scale):**

- CPU: > 80% sustained
- Memory: > 14 GB (> 85%)
- Disk: > 140 GB used (> 85%)
- API response times > 500ms

## Maintenance

### Update Dependencies

```bash
pnpm update --latest
```

### Update Node.js

```bash
# Via nvm or system package manager
nvm install 20 --latest-npm
nvm use 20
```

### Restart All Services

```bash
pm2 restart all
```

### Stop All Services

```bash
pm2 stop all
```

## Troubleshooting

### Service won't start

```bash
pm2 logs funkshan-api --err
# Check environment variables
pm2 env funkshan-api
```

### nginx errors

```bash
sudo nginx -t
sudo systemctl status nginx
```

### RabbitMQ issues

```bash
sudo systemctl status rabbitmq-server
sudo rabbitmqctl status
```

### Disk space issues

```bash
df -h
pm2 flush  # Clear old logs

# Clean old logs (keep last 7 days)
find ~/apps/funkshan-repo/logs -name "*.log" -mtime +7 -delete

# Clean pnpm cache
pnpm store prune

# Clean old Docker images (if using Docker)
# docker system prune -a

# Clean apt cache
sudo apt-get clean
sudo apt-get autoclean
```

### High memory usage

```bash
# Check what's using memory
ps aux --sort=-%mem | head -n 10

# Check PM2 memory usage
pm2 list

# Restart high memory processes
pm2 restart funkshan-api
pm2 restart funkshan-web

# Check for memory leaks in logs
pm2 logs --lines 100
```

### High CPU usage

```bash
# Check CPU usage by process
top -o %CPU

# Check Node.js processes
ps aux | grep node

# If API is overloaded, scale to 2 instances
# Edit ecosystem.config.js:
# instances: 2, exec_mode: 'cluster'
pm2 reload ecosystem.config.js --env production
```

## Monitoring with Netdata (Optional)

Netdata provides real-time performance monitoring with zero configuration.

### Install Netdata

```bash
# Download and run installation script
wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh && sh /tmp/netdata-kickstart.sh

# Alternative: Install via package manager
# sudo apt-get install -y software-properties-common
# sudo add-apt-repository ppa:netdata/netdata -y
# sudo apt-get update
# sudo apt-get install -y netdata
```

### Configure to Listen on All Interfaces

By default, Netdata only listens on localhost. Configure it to be accessible externally:

```bash
sudo nano /etc/netdata/netdata.conf
```

Find the `[web]` section and set:

```ini
[web]
    bind to = 0.0.0.0
```

Save and restart:

```bash
sudo systemctl restart netdata
sudo systemctl enable netdata
```

### Configure Firewall

```bash
# Allow access to Netdata dashboard
sudo ufw allow 19999/tcp
sudo ufw status
```

### Verify Netdata is Running

```bash
sudo systemctl status netdata
sudo netstat -tlnp | grep 19999
```

### Access Dashboard

Open in browser: `http://37.27.246.219:19999`

### Features

- **Real-time metrics**: CPU, RAM, disk, network
- **Process monitoring**: Node.js, PM2 applications
- **Service monitoring**: nginx, RabbitMQ
- **Alerts**: Configure email/Slack notifications
- **Zero configuration**: Works out of the box

### Enable PM2 Plugin

```bash
# PM2 metrics are automatically detected
# View in Netdata under "Applications" section
```

### Secure Netdata (Recommended)

Create nginx reverse proxy for Netdata with SSL:

```bash
sudo nano /etc/nginx/sites-available/netdata
```

Add:

```nginx
server {
    listen 80;
    server_name monitor.funkshan.com;

    location / {
        proxy_pass http://localhost:19999;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/netdata /etc/nginx/sites-enabled/
sudo certbot --nginx -d monitor.funkshan.com
sudo systemctl restart nginx
```

Access securely at: `https://monitor.funkshan.com`

### Alternative: PM2 Plus

For application-specific monitoring:

```bash
pm2 plus
# Follow prompts to create free account
# Provides error tracking, custom metrics, and alerts
```

## Next Steps

1. ✅ Server setup complete (Ubuntu, Node.js, pnpm, PM2, RabbitMQ, nginx)
2. ✅ SSL certificates configured for funkshan.com, www.funkshan.com, api.funkshan.com
3. ✅ GitHub Actions workflow created for automated deployments
4. ✅ Repository cloned and initial deployment successful
5. ⏳ Configure environment variables in `.env.production`
6. ⏳ Test all applications (web, API, worker)
7. ⏳ Setup monitoring with Netdata
8. ⏳ Configure database migrations
9. ⏳ Setup error tracking (optional: Sentry)
10. ⏳ Configure backups
