/*
  Warnings:

  - You are about to drop the column `created_at` on the `Assistant` table. All the data in the column will be lost.
  - You are about to drop the column `response_format` on the `Assistant` table. All the data in the column will be lost.
  - You are about to drop the column `top_p` on the `Assistant` table. All the data in the column will be lost.
  - You are about to drop the column `event_location` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `event_occurred_at` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `last_matching_attempt_at` on the `Item` table. All the data in the column will be lost.
  - Added the required column `responseFormat` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topP` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventLocation` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventOccurredAt` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastMatchingAttemptAt` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assistant" DROP COLUMN "created_at",
DROP COLUMN "response_format",
DROP COLUMN "top_p",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "responseFormat" TEXT NOT NULL,
ADD COLUMN     "topP" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "event_location",
DROP COLUMN "event_occurred_at",
DROP COLUMN "last_matching_attempt_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventLocation" TEXT NOT NULL,
ADD COLUMN     "eventOccurredAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastMatchingAttemptAt" TIMESTAMP(3) NOT NULL;
