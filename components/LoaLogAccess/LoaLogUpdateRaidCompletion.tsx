"use client";

import { useLoaLogsDb } from "./LoaLogUpdateRaidCompletion.hooks";
import { useMainStore, useSettingsStore } from "@/providers/MainStoreProvider";
import { getGateInfoFromClearBossName, ignoreBosses } from "./utils";
import { DatabaseBackup } from "lucide-react";
import { Difficulty } from "@/generated/prisma";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "../FabButtonWrapper";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

export default function LoaLogUpdateRaidCompletion() {
	const settingsStore = useSettingsStore();
	const { characters, hasHydrated, setGate } = useMainStore();

	const lastUpdatedTime = useRef(0);

	const onWorkerResponse = useCallback((weeklyRaids: {
		difficulty: string;
		current_boss: string;
		local_player: string;
		fight_start: number;
	}[]) => {
		let hasError = false;
		const uniqueCharacters = new Set<string>(
			weeklyRaids
				.filter((c) => c.local_player.length > 0)
				.map((raid) => raid.local_player),
		);
		const uniqueCharactersToIdMap = new Map<string, string>();
		for (const character of uniqueCharacters) {
			const char = characters.find(
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
				setGate(
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
		toast.success("Weekly raids updated successfully", {
			description: hasError
				? "Some errors occurred while updating raids. Please check the console for details."
				: undefined,
			id: "loa-log-update-raids",
		});
		// oxlint-disable-next-line exhaustive-deps
	}, [hasHydrated]);

	const loa_logs_db = useLoaLogsDb(hasHydrated ? onWorkerResponse : undefined);

	const updateRaids = useCallback(() => {
		if (!loa_logs_db.isReady) return;
		try {
			loa_logs_db.getWeeklyRaids();
		} catch (error) {
			toast.error("Failed to update weekly raids", {
				description: error instanceof Error ? error.message : String(error),
			});
		}
	}, [loa_logs_db]);

	useEffect(() => {
		if (!settingsStore.hasHydrated || !settingsStore.experiments.autoUpdateRaids || !loa_logs_db.isReady) {
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
	}, [settingsStore.hasHydrated, settingsStore.experiments.autoUpdateRaids, updateRaids, loa_logs_db.isReady]);

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
