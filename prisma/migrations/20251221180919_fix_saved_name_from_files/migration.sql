/*
  Warnings:

  - Changed the type of `savedName` on the `files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "files" DROP COLUMN "savedName",
ADD COLUMN     "savedName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "files_savedName_key" ON "files"("savedName");
