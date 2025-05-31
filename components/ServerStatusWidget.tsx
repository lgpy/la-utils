"use client";

import { ServerStatus, getServerStatusString } from "@/lib/servers";
import { useSettingsStore } from "@/providers/MainStoreProvider";
import { formatDistanceToNow } from "date-fns";
import { Construction, Power, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerStatus } from "./ServerStatusWidget.hooks";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

export default function ServerStatusWidget() {
	const settingsStore = useSettingsStore();
	const { server: selectedServer } = settingsStore;

	const {
		status: serverStatus,
		lastUpdated,
		isLoading,
		hasError,
	} = useServerStatus(selectedServer);

	const [tooltipLastUpdated, setTooltipLastUpdated] = useState<string | null>(
		null,
	);

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
