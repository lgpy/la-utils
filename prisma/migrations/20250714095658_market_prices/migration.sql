-- CreateEnum
CREATE TYPE "ServerRegion" AS ENUM ('NAW', 'NAE', 'EUC');

-- CreateTable
CREATE TABLE "market_price" (
    "itemId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "region" "ServerRegion" NOT NULL,

    CONSTRAINT "market_price_pkey" PRIMARY KEY ("itemId","region")
);
