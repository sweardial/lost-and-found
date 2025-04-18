-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "Flow" AS ENUM ('lost_item', 'found_item');

-- CreateEnum
CREATE TYPE "ItemEventType" AS ENUM ('lost_item', 'found_item');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('pending', 'completed', 'discarded');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flow" "Flow" NOT NULL,
    "version" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Assistant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "eventType" "ItemEventType" NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "event_location" TEXT NOT NULL,
    "event_occurred_at" TIMESTAMP(3) NOT NULL,
    "last_matching_attempt_at" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Assistant_id_key" ON "Assistant"("id");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
