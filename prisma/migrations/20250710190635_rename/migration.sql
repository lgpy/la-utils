-- AlterTable
ALTER TABLE "assigned_raid" RENAME CONSTRAINT "AssignedRaid_pkey" TO "assigned_raid_pkey";

-- AlterTable
ALTER TABLE "character" RENAME CONSTRAINT "Character_pkey" TO "character_pkey";

-- AlterTable
ALTER TABLE "character_task" RENAME CONSTRAINT "CharacterTask_pkey" TO "character_task_pkey";

-- AlterTable
ALTER TABLE "raid_gate" RENAME CONSTRAINT "RaidGate_pkey" TO "raid_gate_pkey";

-- AlterTable
ALTER TABLE "server" RENAME CONSTRAINT "Server_pkey" TO "server_pkey";

-- RenameForeignKey
ALTER TABLE "assigned_raid" RENAME CONSTRAINT "AssignedRaid_userId_characterId_fkey" TO "assigned_raid_userId_characterId_fkey";

-- RenameForeignKey
ALTER TABLE "character" RENAME CONSTRAINT "Character_userId_fkey" TO "character_userId_fkey";

-- RenameForeignKey
ALTER TABLE "character_task" RENAME CONSTRAINT "CharacterTask_userId_characterId_fkey" TO "character_task_userId_characterId_fkey";

-- RenameForeignKey
ALTER TABLE "raid_gate" RENAME CONSTRAINT "RaidGate_assignedRaidId_characterId_userId_fkey" TO "raid_gate_assignedRaidId_characterId_userId_fkey";
