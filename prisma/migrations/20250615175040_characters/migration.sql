-- CreateEnum
CREATE TYPE "Class" AS ENUM ('Berserker', 'Destroyer', 'Gunlancer', 'Paladin', 'Slayer', 'Arcanist', 'Bard', 'Sorceress', 'Summoner', 'Glaivier', 'Scrapper', 'Soulfist', 'Wardancer', 'Striker', 'Breaker', 'Artillerist', 'Deadeye', 'Gunslinger', 'Machinist', 'Sharpshooter', 'Deathblade', 'Reaper', 'Shadowhunter', 'Souleater', 'Aeromancer', 'Artist', 'Wildsoul');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('solo', 'normal', 'hard');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('daily', 'weekly');

-- CreateTable
CREATE TABLE "Character" (
    "userId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Class" NOT NULL,
    "itemLevel" INTEGER NOT NULL,
    "isGoldEarner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("userId","id")
);

-- CreateTable
CREATE TABLE "AssignedRaid" (
    "raidId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AssignedRaid_pkey" PRIMARY KEY ("raidId","characterId","userId")
);

-- CreateTable
CREATE TABLE "RaidGate" (
    "gateId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "completedDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "assignedRaidId" TEXT NOT NULL,

    CONSTRAINT "RaidGate_pkey" PRIMARY KEY ("gateId","assignedRaidId","characterId","userId")
);

-- CreateTable
CREATE TABLE "CharacterTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "completedDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "CharacterTask_pkey" PRIMARY KEY ("id","characterId","userId")
);

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedRaid" ADD CONSTRAINT "AssignedRaid_userId_characterId_fkey" FOREIGN KEY ("userId", "characterId") REFERENCES "Character"("userId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidGate" ADD CONSTRAINT "RaidGate_assignedRaidId_characterId_userId_fkey" FOREIGN KEY ("assignedRaidId", "characterId", "userId") REFERENCES "AssignedRaid"("raidId", "characterId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTask" ADD CONSTRAINT "CharacterTask_userId_characterId_fkey" FOREIGN KEY ("userId", "characterId") REFERENCES "Character"("userId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
