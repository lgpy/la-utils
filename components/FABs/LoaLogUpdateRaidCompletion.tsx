"use client";

import { useLoaLogsDb } from "./LoaLogUpdateRaidCompletion.hooks";
import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import { DbEntry, ignoreBosses } from "./LoaLogUpdateRaidCompletion.utils";
import { DatabaseBackup } from "lucide-react";
import { Difficulty } from "@/prisma/generated/enums";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "./FabButtonWrapper";
import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

function filterRaidData(raidData: DbEntry) {
	if (!Object.values(Difficulty).includes(raidData.difficulty as Difficulty))
		// Check if the difficulty is supported
		return false;

	if (ignoreBosses.has(raidData.current_boss)) return false; // Ignore guardian raids

	return true;
}

export default function LoaLogUpdateRaidCompletion() {
	const autoUpdateSetting = useSettingsStore(
		(store) => store.experiments.autoUpdateRaids
	);
	const { hasHydrated, setGates, rehydrate } = useMainStore();

	const lastUpdatedTime = useRef(0);

	const onWorkerResponse = useCallback(
		(unfilteredRaids: DbEntry[]) => {
			let hasError = false;

			let filteredRaids = unfilteredRaids.filter(filterRaidData);

			try {
				rehydrate();
				const { updatedSomething, errors } = setGates(filteredRaids);
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
		[rehydrate, setGates]
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
