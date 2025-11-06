-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpiresAt" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMP(3),
    "passwordResetRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "pushToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_isActive_idx" ON "tenants"("isActive");

-- CreateIndex
CREATE INDEX "tenants_isBlocked_idx" ON "tenants"("isBlocked");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_isBlocked_idx" ON "users"("isBlocked");

-- CreateIndex
CREATE INDEX "users_isEmailVerified_idx" ON "users"("isEmailVerified");

-- CreateIndex
CREATE INDEX "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "users_passwordResetToken_idx" ON "users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_devices_userId_idx" ON "user_devices"("userId");

-- CreateIndex
CREATE INDEX "user_devices_deviceId_idx" ON "user_devices"("deviceId");

-- CreateIndex
CREATE INDEX "user_devices_isActive_idx" ON "user_devices"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_userId_deviceId_key" ON "user_devices"("userId", "deviceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
