"use client";

import { useLoaLogsDb } from "./LoaLogUpdateRaidCompletion.hooks";
import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import {
	getGateInfoFromClearBossName,
	ignoreBosses,
} from "./LoaLogUpdateRaidCompletion.utils";
import { DatabaseBackup } from "lucide-react";
import { Difficulty } from "@/generated/prisma";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "./FabButtonWrapper";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

type DbRaidData = {
	difficulty: string;
	current_boss: string;
	local_player: string;
	fight_start: number;
};

function filterRaidData(raidData: DbRaidData) {
	if (!Object.values(Difficulty).includes(raidData.difficulty as Difficulty))
		// Check if the difficulty is supported
		return false;

	if (ignoreBosses.has(raidData.current_boss)) return false; // Ignore guardian raids

	return true;
}

function assignCharIdsToLocalPlayers(
	raidDataArr: DbRaidData[],
	characters: ReturnType<typeof useMainStore>["characters"]
) {
	const uniqueCharacters = new Set<string>(
		raidDataArr
			.filter((c) => c.local_player.length > 0)
			.map((raid) => raid.local_player)
	);
	const uniqueCharactersToIdMap = new Map<string, string>();
	for (const character of uniqueCharacters) {
		const char = characters.find(
			(c) => c.name.toLowerCase() === character.toLowerCase()
		);
		if (!char) {
			continue;
		}
		uniqueCharactersToIdMap.set(character, char.id);
	}

	return {
		localPlayerCharacterIds: uniqueCharactersToIdMap,
		notFound: Array.from(uniqueCharacters).filter(
			(character) => !uniqueCharactersToIdMap.has(character)
		),
	};
}

export default function LoaLogUpdateRaidCompletion() {
	const autoUpdateSetting = useSettingsStore(
		(store) => store.experiments.autoUpdateRaids
	);
	const { characters, hasHydrated, setGates, rehydrate } = useMainStore();

	const lastUpdatedTime = useRef(0);

	const onWorkerResponse = useCallback(
		(unfilteredRaids: DbRaidData[]) => {
			let hasError = false;

			let filteredRaids = unfilteredRaids.filter(filterRaidData);

			const {
				localPlayerCharacterIds: localplayer_to_char_id_map,
				notFound: localplayer_not_found,
			} = assignCharIdsToLocalPlayers(filteredRaids, characters);

			filteredRaids = filteredRaids.filter(
				(raid) => !localplayer_not_found.includes(raid.local_player)
			); // Exclude raids with local players not found

			if (localplayer_not_found.length > 0) {
				console.warn(
					`Characters not found for local players: ${localplayer_not_found.join(", ")}`
				);
				hasError = true;
			}

			const updates: Array<{
				charId: string;
				raidId: string;
				gateId: string;
				completedDate: Date;
			}> = [];

			for (const raid of filteredRaids) {
				const charId = localplayer_to_char_id_map.get(raid.local_player);
				if (charId === undefined) continue;

				const raidInfo = getGateInfoFromClearBossName(raid.current_boss);
				if (!raidInfo) {
					console.warn(`No raid info found for boss: ${raid.current_boss}`);
					hasError = true;
					continue;
				}

				updates.push({
					charId,
					raidId: raidInfo.raidId,
					gateId: raidInfo.gateId,
					completedDate: new Date(raid.fight_start),
				});
			}

			if (updates.length === 0) {
				toast.info("No updates found for weekly raids", {
					id: "loa-log-update-raids",
				});
				return;
			}

			try {
				rehydrate();
				const { updatedSomething, errors } = setGates(updates);
				if (errors.length > 0) {
					for (const error of errors) {
						console.warn(error);
					}
					hasError = true;
				}
				if (updatedSomething) {
					toast.success("Weekly raids updated successfully", {
						description: hasError
							? "Some errors occurred while processing raids. Please check the console for details."
							: undefined,
						id: "loa-log-update-raids",
						duration: hasError ? 3000 : 2000,
					});
				} else {
					toast.info("No updates found for weekly raids", {
						id: "loa-log-update-raids",
						description: hasError
							? "Some errors occurred while processing raids. Please check the console for details."
							: undefined,
						duration: hasError ? 3000 : 2000,
					});
				}
			} catch (error) {
				console.error("Failed to update gates:", error);
				toast.error("Failed to update weekly raids", {
					description: "Check console for details.",
					id: "loa-log-update-raids",
				});
			}
		},
		[characters, rehydrate, setGates]
	);

	const loa_logs_db = useLoaLogsDb(hasHydrated ? onWorkerResponse : undefined);

	const updateRaids = useCallback(() => {
		if (!loa_logs_db.isReady) return;
		try {
			toast.loading("Updating weekly raids...", {
				id: "loa-log-update-raids",
			});
			loa_logs_db.getWeeklyRaids();
		} catch (error) {
			toast.error("Failed to update weekly raids", {
				description: error instanceof Error ? error.message : String(error),
			});
		}
	}, [loa_logs_db]);

	useEffect(() => {
		if (
			!autoUpdateSetting.hasHydrated ||
			!autoUpdateSetting.state ||
			!loa_logs_db.isReady
		) {
			return;
		}

		const updateRaidsOnFocus = () => {
			if (Date.now() - lastUpdatedTime.current < 5 * 60 * 1000) {
				// Skip if last update was less than 5 minutes ago
				return;
			}
			lastUpdatedTime.current = Date.now();
			updateRaids();
		};

		window.addEventListener("focus", updateRaidsOnFocus);

		if (lastUpdatedTime.current === 0) {
			lastUpdatedTime.current = Date.now();
			updateRaids();
		}

		return () => {
			window.removeEventListener("focus", updateRaidsOnFocus);
		};
	}, [
		autoUpdateSetting.hasHydrated,
		autoUpdateSetting.state,
		updateRaids,
		loa_logs_db.isReady,
	]);

	return (
		<FabButtonWrapper>
			<ExpandableButton
				variant="secondary"
				label="Update Raids"
				onClick={() => {
					updateRaids();
				}}
				disabled={!loa_logs_db.isReady || !hasHydrated}
			>
				<DatabaseBackup className="size-6" />
			</ExpandableButton>
		</FabButtonWrapper>
	);
}
