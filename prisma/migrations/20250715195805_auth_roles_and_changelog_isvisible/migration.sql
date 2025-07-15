/*
  Warnings:

  - Added the required column `isVisible` to the `changelog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Step 1: Add as nullable
ALTER TABLE "changelog" ADD COLUMN     "isVisible" BOOLEAN;

-- Step 2: Set a default value for existing rows (choose true or false as needed)
UPDATE "changelog" SET "isVisible" = true WHERE "isVisible" IS NULL;

-- Step 3: Set NOT NULL constraint
ALTER TABLE "changelog" ALTER COLUMN "isVisible" SET NOT NULL;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT;
