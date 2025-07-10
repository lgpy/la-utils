-- CreateEnum
CREATE TYPE "ChangelogDetailType" AS ENUM ('adition', 'fix', 'removal', 'change', 'improvement');

-- CreateTable
CREATE TABLE "changelog_detail" (
    "id" INTEGER NOT NULL,
    "changelogId" INTEGER NOT NULL,
    "type" "ChangelogDetailType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "changelog_detail_pkey" PRIMARY KEY ("id","changelogId")
);

-- CreateTable
CREATE TABLE "changelog" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "changelog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "changelog_detail" ADD CONSTRAINT "changelog_detail_changelogId_fkey" FOREIGN KEY ("changelogId") REFERENCES "changelog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
