"use client";

import { useSettingsStore } from "@/stores/main-store/provider";
import { formatDistanceToNow } from "date-fns";
import { Construction, Power, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";
import { ServerStatus } from "@/prisma/generated/enums";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

function getServerStatusString(status: ServerStatus): string {
	switch (status) {
		case ServerStatus.OFFLINE:
			return "Offline";
		case ServerStatus.ONLINE:
			return "Online";
		case ServerStatus.FULL:
			return "Online - Full";
		case ServerStatus.BUSY:
			return "Online - Busy";
		case ServerStatus.MAINTENANCE:
			return "In Maintenance";
	}
}

const POLLING_INTERVALS = {
	FAST: 5 * 60 * 1000, // 5 minutes for offline/maintenance
	SLOW: 60 * 60 * 1000, // 1 hour for online servers
} as const;

export default function ServerStatusWidget() {
	const selectedServerSetting = useSettingsStore((store) => store.server);

	/*const {
		status: serverStatus,
		lastUpdated,
		isLoading,
		hasError,
	} = useServerStatus(selectedServer);*/

	const serverQuery = useQuery(
		orpc.serverStatus.getServerStatus.queryOptions({
			input: selectedServerSetting.state!,
			enabled:
				selectedServerSetting.state !== undefined &&
				selectedServerSetting.hasHydrated,
			staleTime(query) {
				if (
					query.state.data?.status === ServerStatus.OFFLINE ||
					query.state.data?.status === ServerStatus.MAINTENANCE
				) {
					return POLLING_INTERVALS.FAST;
				}
				return POLLING_INTERVALS.SLOW;
			},
			refetchInterval(query) {
				if (
					query.state.data?.status === ServerStatus.OFFLINE ||
					query.state.data?.status === ServerStatus.MAINTENANCE
				) {
					return POLLING_INTERVALS.FAST;
				}
				return POLLING_INTERVALS.SLOW;
			},
		})
	);

	const [tooltipLastUpdated, setTooltipLastUpdated] = useState<string | null>(
		null
	);

	// Update relative time display
	useEffect(() => {
		if (serverQuery.data === undefined) return;

		const updateRelativeTime = () => {
			setTooltipLastUpdated(
				formatDistanceToNow(serverQuery.data.updatedAt, {
					addSuffix: true,
				})
			);
		};

		updateRelativeTime();
		const interval = setInterval(updateRelativeTime, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [serverQuery.data]);

	if (!selectedServerSetting.hasHydrated || !selectedServerSetting.state)
		return null;

	// Determine which icon to show based on server status
	const icon = (() => {
		if (serverQuery.isLoading) {
			return <Power className="size-4 stroke-muted-foreground animate-pulse" />;
		}

		if (serverQuery.isError) {
			return <WifiOff className="size-4 stroke-destructive" />;
		}

		switch (serverQuery.data?.status) {
			case ServerStatus.OFFLINE:
				return <Power className="size-4 stroke-destructive" />;
			case ServerStatus.ONLINE:
				return <Power className="size-4 stroke-ctp-green" />;
			case ServerStatus.BUSY:
			case ServerStatus.FULL:
				return <Power className="size-4 stroke-ctp-peach" />;
			case ServerStatus.MAINTENANCE:
				return <Construction className="size-4 stroke-ctp-blue" />;
			default:
				return <Power className="size-4 stroke-muted-foreground" />;
		}
	})();

	const tooltipServerStatus = serverQuery.isError
		? "Connection Error"
		: serverQuery.isLoading
			? "Checking..."
			: serverQuery.data !== undefined
				? getServerStatusString(serverQuery.data.status)
				: "Unknown";

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex gap-1 items-center select-none cursor-help">
						{icon}
						<span
							className={`text-xs ${serverQuery.isError ? "text-destructive" : "text-muted-foreground"}`}
						>
							{selectedServerSetting.state}
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
						{serverQuery.isError && (
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
