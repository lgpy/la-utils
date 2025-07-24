-- RenameTable
ALTER TABLE "AssignedRaid" RENAME TO "assigned_raid";
ALTER TABLE "Character" RENAME TO "character";
ALTER TABLE "CharacterTask" RENAME TO "character_task";
ALTER TABLE "RaidGate" RENAME TO "raid_gate";
ALTER TABLE "Server" RENAME TO "server";

-- AlterTable
CREATE SEQUENCE changelog_detail_id_seq;
ALTER TABLE "changelog_detail" ALTER COLUMN "id" SET DEFAULT nextval('changelog_detail_id_seq');
ALTER SEQUENCE changelog_detail_id_seq OWNED BY "changelog_detail"."id";
