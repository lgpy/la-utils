"use client";
import { useMainStore } from "@/stores/main-store/provider";
import { useEffect, useRef } from "react";
import { showAlert } from "./AlertDialog.hooks";

export default function VersionMismatchAlert() {
	const store = useMainStore();

	const hasShown = useRef(false);

	useEffect(() => {
		if (store.isOldVersion && !hasShown.current) {
			hasShown.current = true;
			try {
				showAlert({
					title: "Version Mismatch",
					description:
						"Your user data has failed to migrate to the latest version, join the discord server for support.",
					confirmButton: {
						text: "Join Discord",
					},
					cancelButton: {
						text: "Dismiss",
					},
				}).then((confirmed) => {
					if (confirmed) {
						window.open("https://discord.gg/zHzU8HZfWp", "_blank");
					}
				});
			} catch (error) {
				console.error("Error showing version mismatch alert:", error);
			}
		}
	}, [store.isOldVersion]);

	return null;
}
