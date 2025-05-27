"use client";

import type { ServerStatusResponse } from "@/app/api/serverStatus/route";
import { ServerStatus, getServerStatusString } from "@/lib/servers";
import { useSettingsStore } from "@/providers/MainStoreProvider";
import { formatDistanceToNow } from "date-fns";
import { Construction, Power, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

// Audio notification function with volume control and error handling
function playNotification(volume = 30): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		try {
			const sound = new Audio("/ringtone.mp3");
			sound.volume = Math.min(Math.max(volume / 100, 0), 1); // Ensure volume is between 0-1
			sound.onended = () => resolve();
			sound.onerror = (error) => reject(error);

			// Modern browsers require user interaction before playing audio
			const playPromise = sound.play();
			if (playPromise) {
				playPromise.catch((error) => {
					console.warn("Audio playback failed:", error);
					resolve(); // Resolve anyway to prevent hanging promises
				});
			}
		} catch (error) {
			console.error("Audio notification error:", error);
			reject(error);
		}
	});
}

export default function ServerStatusWidget() {
	const settingsStore = useSettingsStore();
	const { server: selectedServer } = settingsStore;

	const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
	const [lastUpdated, setLastUpdated] = useState<number | null>(null);
	const [tooltipLastUpdated, setTooltipLastUpdated] = useState<string | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [hasError, setHasError] = useState<boolean>(false);

	// Function to fetch server status with error handling
	const fetchServerStatus = async () => {
		if (!selectedServer) return;

		try {
			setIsLoading(true);
			// Pass the server name as a query parameter
			const res = await fetch(
				`/api/serverStatus?server=${encodeURIComponent(selectedServer)}`,
				{
					cache: "no-cache",
					next: { revalidate: 0 },
				},
			);

			if (!res.ok) {
				throw new Error(`Server returned ${res.status}: ${res.statusText}`);
			}

			const data: ServerStatusResponse = await res.json();

			if (data.error) {
				console.warn("Server status warning:", data.error);
			}

			// Use the direct status property instead of looking it up in the servers object
			const status = data.status;

			if (status !== undefined) {
				// Check if server came back online
				if (
					status === ServerStatus.ONLINE &&
					(serverStatus === ServerStatus.OFFLINE ||
						serverStatus === ServerStatus.MAINTENANCE)
				) {
					// Show notification and play sound
					toast.info(`Server ${selectedServer} is back online!`, {
						duration: 240000,
					});
					await playNotification(30);
				}

				setServerStatus(status);
			}

			setLastUpdated(data.lastUpdated);
			setHasError(false);
		} catch (error) {
			console.error("Error fetching server status:", error);
			setHasError(true);

			// Don't show toast for every error to avoid spamming the user
			if (serverStatus === null) {
				toast.error("Unable to fetch server status", {
					description: "Will retry in a few minutes",
					duration: 3000,
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Update relative time display
	useEffect(() => {
		if (lastUpdated === null) return;

		const updateRelativeTime = () => {
			setTooltipLastUpdated(
				formatDistanceToNow(new Date(lastUpdated), {
					addSuffix: true,
				}),
			);
		};

		updateRelativeTime();
		const interval = setInterval(updateRelativeTime, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [lastUpdated]);

	// Reset states and fetch when selectedServer changes
	useEffect(() => {
		if (!settingsStore.hasHydrated || !selectedServer) return;

		// Reset states when server changes
		setServerStatus(null);
		setIsLoading(true);
		setHasError(false);

		// Fetch status for the new server
		fetchServerStatus();
	}, [selectedServer]);

	// Initialize and schedule status updates
	useEffect(() => {
		if (!settingsStore.hasHydrated || !selectedServer) return;

		// Initial fetch is now handled by the selectedServer effect above

		// Set different polling intervals based on server status
		const pollingInterval =
			serverStatus === ServerStatus.OFFLINE ||
			serverStatus === ServerStatus.MAINTENANCE
				? 5 * 60 * 1000 // 5 minutes for offline/maintenance
				: 30 * 60 * 1000; // 30 minutes for online servers

		const interval = setInterval(fetchServerStatus, pollingInterval);

		return () => clearInterval(interval);
	}, [settingsStore.hasHydrated, selectedServer, serverStatus]);

	if (!settingsStore.hasHydrated || !selectedServer) return null;

	// Determine which icon to show based on server status
	const icon = (() => {
		if (isLoading) {
			return <Power className="size-4 stroke-muted-foreground animate-pulse" />;
		}

		if (hasError) {
			return <WifiOff className="size-4 stroke-destructive" />;
		}

		switch (serverStatus) {
			case ServerStatus.OFFLINE:
				return <Power className="size-4 stroke-destructive" />;
			case ServerStatus.ONLINE:
				return <Power className="size-4 stroke-green" />;
			case ServerStatus.BUSY:
			case ServerStatus.FULL:
				return <Power className="size-4 stroke-peach" />;
			case ServerStatus.MAINTENANCE:
				return <Construction className="size-4 stroke-blue" />;
			default:
				return <Power className="size-4 stroke-muted-foreground" />;
		}
	})();

	const tooltipServerStatus = hasError
		? "Connection Error"
		: isLoading
			? "Checking..."
			: serverStatus !== null
				? getServerStatusString(serverStatus)
				: "Unknown";

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex gap-1 items-center select-none cursor-help">
						{icon}
						<span
							className={`text-xs ${hasError ? "text-destructive" : "text-muted-foreground"}`}
						>
							{selectedServer}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="space-y-1">
						<p className="font-medium">
							Server status:{" "}
							<span className="font-normal">{tooltipServerStatus}</span>
						</p>
						<p className="text-sm text-muted-foreground">
							Last updated:{" "}
							{tooltipLastUpdated !== null ? tooltipLastUpdated : "never"}
						</p>
						{hasError && (
							<p className="text-xs text-destructive">
								Could not connect to status service
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
