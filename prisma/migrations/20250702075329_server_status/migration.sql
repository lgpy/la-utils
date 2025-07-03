-- CreateEnum
CREATE TYPE "ServerName" AS ENUM ('Thaemine', 'Brelshaza', 'Luterra', 'Balthorr', 'Nineveh', 'Inanna', 'Vairgrys', 'Ortuus', 'Elpon', 'Ratik', 'Arcturus', 'Gienah');

-- CreateEnum
CREATE TYPE "ServerStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'BUSY', 'FULL');

-- CreateTable
CREATE TABLE "Server" (
    "id" "ServerName" NOT NULL,
    "status" "ServerStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);
