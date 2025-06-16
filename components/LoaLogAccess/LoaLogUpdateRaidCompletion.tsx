"use client";

import { toast } from "sonner";
import { useLoaLogsDb } from "./LoaLogUpdateRaidCompletion.hooks";
import { useMainStore } from "@/providers/MainStoreProvider";
import { getGateInfoFromClearBossName, ignoreBosses } from "./utils";
import { DatabaseBackup } from "lucide-react";
import { Difficulty } from "@/generated/prisma";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "../FabButtonWrapper";

export default function LoaLogUpdateRaidCompletion() {
	const { hasAccess, getWeeklyRaids } = useLoaLogsDb();
	const mainStore = useMainStore();

	const updateWeeklyRaids = async () => {
		if (!hasAccess) {
			console.error("No access to LOA Logs file");
			return true;
		}

		let hasError = false;

		try {
			const weeklyRaids = await getWeeklyRaids();

			const uniqueCharacters = new Set<string>(
				weeklyRaids
					.filter((c) => c.local_player.length > 0)
					.map((raid) => raid.local_player),
			);
			const uniqueCharactersToIdMap = new Map<string, string>();
			for (const character of uniqueCharacters) {
				const char = mainStore.characters.find(
					(c) => c.name.toLowerCase() === character.toLowerCase(),
				);
				if (!char) {
					console.warn(`Character not found: ${character}`);
					hasError = true;
					continue;
				}
				uniqueCharactersToIdMap.set(character, char.id);
			}

			for (const raid of weeklyRaids) {
				if (
					!Object.values(Difficulty).includes(raid.difficulty as Difficulty)
				) {
					console.debug(
						`Skipping raid with unsupported difficulty: ${raid.difficulty}`,
					);
					continue;
				}
				if (ignoreBosses.has(raid.current_boss)) {
					continue;
				}
				const charId = uniqueCharactersToIdMap.get(raid.local_player);
				if (charId === undefined) continue;
				const raidInfo = getGateInfoFromClearBossName(raid.current_boss);
				if (!raidInfo) {
					console.warn(
						`No raid info found for boss: ${raid.current_boss}, difficulty: ${raid.difficulty}`,
					);
					hasError = true;
					continue;
				}
				try {
					mainStore.setGate(
						charId,
						raidInfo.raidId,
						raidInfo.gateId,
						new Date(raid.fight_start),
					);
				} catch (error) {
					console.warn(
						`Failed to complete gate "${raidInfo.gateId}" of "${raidInfo.raidId}" for "${raid.local_player}":`,
						error instanceof Error ? error.message : error,
					);
					hasError = true;
				}
			}
			return hasError;
		} catch (error) {
			console.error("Error updating weekly raids:", error);
			throw new Error("Failed to update weekly raids");
		}
	};

	if (!hasAccess) {
		return null;
	}

	return (
		<FabButtonWrapper>
			<ExpandableButton
				variant="secondary"
				label="Update Raids"
				onClick={() => {
					toast.promise(updateWeeklyRaids(), {
						loading: "Updating weekly raids...",
						success: (hasError) => {
							if (hasError) {
								return "Weekly raids updated with some errors, check console for details";
							}
							return "Weekly raids updated successfully";
						},
						error: "Failed to update weekly raids, check console for details",
					});
				}}
			>
				<DatabaseBackup className="size-6" />
			</ExpandableButton>
		</FabButtonWrapper>
	);
}
