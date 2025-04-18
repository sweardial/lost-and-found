/*
  Warnings:

  - Made the column `description` on table `Assistant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assistant" ALTER COLUMN "description" SET NOT NULL;
