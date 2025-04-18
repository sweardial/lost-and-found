/*
  Warnings:

  - A unique constraint covering the columns `[flow,isCurrentVersion]` on the table `Assistant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isCurrentVersion` to the `Assistant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assistant" ADD COLUMN     "isCurrentVersion" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "unique_current_version_per_flow_where_true" ON "Assistant"("flow", "isCurrentVersion");
