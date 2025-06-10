"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { useLoaLogsDb } from "./LoaLogUpdateRaidCompletion.hooks";
import { useMainStore } from "@/providers/MainStoreProvider";
import { getGateInfoFromClearBossName } from "./utils";
import { RefreshCw } from "lucide-react";

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
				weeklyRaids.map((raid) => raid.local_player),
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
				const charId = uniqueCharactersToIdMap.get(raid.local_player);
				if (charId === undefined) continue;
				const raidInfo = getGateInfoFromClearBossName(
					raid.current_boss,
					raid.difficulty,
				);
				if (!raidInfo) {
					console.warn(
						`No raid info found for boss: ${raid.current_boss}, difficulty: ${raid.difficulty}`,
					);
					hasError = true;
					continue;
				}
				mainStore.setGate(
					charId,
					raidInfo.raidId,
					raidInfo.gateId,
					new Date(raid.fight_start),
				);
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
		<Button
			size="icon"
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
			title="Update Weekly Raids"
		>
			<RefreshCw />
		</Button>
	);
}
