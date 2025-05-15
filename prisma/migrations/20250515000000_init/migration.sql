-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_token_key" ON "subscriptions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_city_key" ON "subscriptions"("email", "city");
