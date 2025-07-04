"use client";

import { authClient } from "@/lib/auth";
import { fetchCompressed } from "@/lib/requests";
import { useMainStore, useSettingsStore } from "@/providers/MainStoreProvider";
import { isEqual } from "lodash";
import { useEffect, useRef } from "react";

const DEBOUNCE_DELAY = 3000;
const API_URL = "/api/user/uploadData";

type CharData = ReturnType<typeof useMainStore>["characters"][number];

function removeIgnoredRaids(characters: CharData[], ignoredRaids: { cId: string; rId: string }[]): CharData[] {
	const characters_copy: CharData[] = JSON.parse(JSON.stringify(characters));

	for (const ignoredRaid of ignoredRaids) {
		const character = characters_copy.find(c => c.id === ignoredRaid.cId);
		if (character) {
			delete character.assignedRaids[ignoredRaid.rId];
		}
	}

	return characters_copy;
}

export function UserInfoUpdater() {
	const auth = authClient.useSession();
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const latestCharactersRef = useRef(mainStore.characters);
	const isFirstRun = useRef(true);

	const lastUploadedDataRef = useRef<typeof mainStore.characters | null>(null);

	const areStoresHydrated = mainStore.hasHydrated && settingsStore.hasHydrated;

	//initial upload of characters
	useEffect(() => {
		if (!areStoresHydrated || lastUploadedDataRef.current !== null) return;
		lastUploadedDataRef.current = removeIgnoredRaids(
			mainStore.characters,
			settingsStore.upload.ignoreRaids
		);
	}, [areStoresHydrated, mainStore.characters, settingsStore.upload.ignoreRaids]);

	const isUploadedSameAsCurrent = () => isEqual(latestCharactersRef.current, lastUploadedDataRef.current);

	// Keep latest characters in a ref for beforeunload
	useEffect(() => {
		latestCharactersRef.current = removeIgnoredRaids(
			mainStore.characters,
			settingsStore.upload.ignoreRaids
		);
	}, [mainStore.characters, settingsStore.upload.ignoreRaids]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: characters is needed here
	useEffect(() => {
		if (!areStoresHydrated || auth.isPending || auth.error || auth.data == null)
			return;

		if (isFirstRun.current) {
			isFirstRun.current = false;
			return;
		}

		if (isUploadedSameAsCurrent()) {
			return;
		}

		timeoutRef.current = setTimeout(() => {
			console.debug("Uploading character data to the server...");

			const uploadData = async () => {
				try {
					const jsonString = JSON.stringify(latestCharactersRef.current);

					await fetchCompressed(API_URL, {
						method: "POST",
						body: jsonString,
					});
				} catch (error) {
					console.error("Failed to compress and upload character data:", error);

					// Fallback to uncompressed data
					await fetch(API_URL, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(latestCharactersRef.current),
					});
				}
			};


			lastUploadedDataRef.current = latestCharactersRef.current;
			uploadData();
		}, DEBOUNCE_DELAY);

		const handleBeforeUnload = () => {
			try {
				if (isUploadedSameAsCurrent()) {
					return;
				}
				const jsonString = JSON.stringify(latestCharactersRef.current);
				const blob = new Blob([jsonString], { type: "application/json" });
				navigator.sendBeacon(API_URL, blob);
			} catch {
				// ignore
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [auth, areStoresHydrated, mainStore.characters, settingsStore.upload.ignoreRaids]);

	return null;
}
