/*
  Warnings:

  - Added the required column `created_at` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructions` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadata` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `response_format` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `temperature` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tools` to the `Assistant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `top_p` to the `Assistant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "instructions" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "response_format" TEXT NOT NULL,
ADD COLUMN     "temperature" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "tools" JSONB NOT NULL,
ADD COLUMN     "top_p" DOUBLE PRECISION NOT NULL;
