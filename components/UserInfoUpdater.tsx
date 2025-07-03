"use client";

import { authClient } from "@/lib/auth";
import { fetchCompressed } from "@/lib/requests";
import { useMainStore } from "@/providers/MainStoreProvider";
import { isEqual } from "lodash";
import { useEffect, useRef } from "react";

const DEBOUNCE_DELAY = 2000;
const API_URL = "/api/user/uploadData";

export function UserInfoUpdater() {
	const auth = authClient.useSession();
	const { hasHydrated, characters } = useMainStore();
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const latestCharactersRef = useRef(characters);
	const isFirstRun = useRef(true);

	const lastUploadedDataRef = useRef<typeof characters | null>(null);

	//initial upload of characters
	useEffect(() => {
		if (!hasHydrated || lastUploadedDataRef.current !== null) return;
		lastUploadedDataRef.current = characters;
	}, [hasHydrated, characters]);

	const isUploadedSameAsCurrent = () => isEqual(latestCharactersRef.current, lastUploadedDataRef.current);

	// Keep latest characters in a ref for beforeunload
	useEffect(() => {
		latestCharactersRef.current = characters;
	}, [characters]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: characters is needed here
	useEffect(() => {
		if (!hasHydrated || auth.isPending || auth.error || auth.data == null)
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
			} catch (e) {
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
	}, [auth, hasHydrated, characters]);

	return null;
}
