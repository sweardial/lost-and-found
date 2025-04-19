/*
  Warnings:

  - The `responseFormat` column on the `Assistant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Assistant" DROP COLUMN "responseFormat",
ADD COLUMN     "responseFormat" JSONB;
