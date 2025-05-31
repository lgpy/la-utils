import type { ServerStatusResponse } from "@/app/api/serverStatus/route";
import { ServerStatus } from "@/lib/servers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ServerStatusState {
	status: ServerStatus | null;
	lastUpdated: number | null;
	isLoading: boolean;
	hasError: boolean;
}

const POLLING_INTERVALS = {
	FAST: 5 * 60 * 1000, // 5 minutes for offline/maintenance
	SLOW: 30 * 60 * 1000, // 30 minutes for online servers
} as const;

async function fetchServerStatus(server: string): Promise<ServerStatus> {
	const res = await fetch(
		`/api/serverStatus?server=${encodeURIComponent(server)}`,
		{
			cache: "no-cache",
			next: { revalidate: 0 },
		},
	);

	if (!res.ok) {
		throw new Error(`Server returned ${res.status}: ${res.statusText}`);
	}

	const data: ServerStatusResponse = await res.json();
	return data.status;
}

export function useServerStatus(selectedServer?: string) {
	const [state, setState] = useState<ServerStatusState>({
		status: null,
		lastUpdated: null,
		isLoading: true,
		hasError: false,
	});

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);

	const pollingInterval = useMemo(() => {
		const isOfflineOrMaintenance =
			state.status === ServerStatus.OFFLINE ||
			state.status === ServerStatus.MAINTENANCE;
		return isOfflineOrMaintenance
			? POLLING_INTERVALS.FAST
			: POLLING_INTERVALS.SLOW;
	}, [state.status]);

	const timeSinceUpdate = useMemo(() => {
		if (!state.lastUpdated) return null;
		return Date.now() - state.lastUpdated;
	}, [state.lastUpdated]);

	const fetchStatus = useCallback(async (): Promise<void> => {
		if (!selectedServer || !mountedRef.current) return;

		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			const status = await fetchServerStatus(selectedServer);

			if (!mountedRef.current) return;

			setState({
				status,
				lastUpdated: Date.now(),
				isLoading: false,
				hasError: false,
			});
		} catch (error) {
			console.error("Error fetching server status:", error);

			if (!mountedRef.current) return;

			setState((prev) => ({
				...prev,
				isLoading: false,
				hasError: true,
			}));
		}
	}, [selectedServer]);

	// Initial fetch and interval setup
	useEffect(() => {
		if (!selectedServer) {
			setState((prev) => ({ ...prev, isLoading: false }));
			return;
		}

		// Initial fetch
		fetchStatus();

		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Set up new interval
		intervalRef.current = setInterval(() => {
			if (mountedRef.current) {
				fetchStatus();
			}
		}, pollingInterval);

		// Cleanup function
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [selectedServer, pollingInterval, fetchStatus]);

	// Cleanup on unmount
	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, []);

	return {
		...state,
		timeSinceUpdate,
	};
}
