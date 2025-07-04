import { useState, useEffect, useRef } from "react";
import {
	getStoredLoaLogsFileHandle,
	zEntries,
} from "@/components/LoaLogAccess/utils";
import { getLatestWeeklyReset } from "@/lib/dates";
import { toast } from "sonner";
import { DBWorkerResponse } from "@/workers/dbWorker";

interface FileAccessState {
	fileHandle: FileSystemFileHandle | null;
	hasPermission: boolean;
	fileSize: number | null;
}

export function useLoaLogsDb(onResponse?: (data: {
	difficulty: string;
	current_boss: string;
	local_player: string;
	fight_start: number;
}[]) => void) {
	const [fileAccess, setFileAccess] = useState<FileAccessState>({
		fileHandle: null,
		hasPermission: false,
		fileSize: null,
	});

	const onResponseRef = useRef(onResponse);

	useEffect(() => {
		if (onResponse) {
			onResponseRef.current = onResponse;
		}
	}, [onResponse]);

	// Persist worker instance for the lifetime of the hook
	const workerRef = useRef<Worker | null>(null);

	const [isWorkerReady, setIsWorkerReady] = useState(false);

	const handleWorkerMessage = (event: MessageEvent<DBWorkerResponse>) => {
		if (event.data.type === "init") {
			if (event.data.payload.success) {
				console.debug("Worker initialized successfully");
				setIsWorkerReady(true);
			} else {
				console.error("Worker initialization failed");
				toast.error("Failed to initialize LOA Logs worker");
				setIsWorkerReady(false);
			}
		} else if (event.data.type === "query") {
			const { payload: query } = event.data;
			if (query.length === 0 || !query[0].rows.length) {
				onResponseRef.current?.([]);
				return;
			}
			const resToObjArray = query[0].rows.map((row) =>
				Object.fromEntries(
					query[0].columns.map((col, index) => [col, row[index]]),
				),
			);
			const parsed = zEntries.safeParse(resToObjArray);
			if (!parsed.success) {
				console.error(
					"Failed to parse weekly raids data:",
					parsed.error,
				);
				throw new Error("Invalid data format in encounter_preview table");
			}
			onResponseRef.current?.(parsed.data);
		} else if (event.data.type === "error") {
			const errorMessage = event.data.payload.message;
			console.error("Worker error:", errorMessage);
			toast.error("Worker error, check console for more details");
			setIsWorkerReady(false);
		}
	};

	useEffect(() => {
		const handleError = (error: ErrorEvent) => {
			console.error("Worker error:", error);
			toast.error("Worker error, check console for more details");
		};

		async function setupFileAccessAndWorker() {
			const handle = await getStoredLoaLogsFileHandle();
			if (!handle) {
				setFileAccess({
					fileHandle: null,
					hasPermission: false,
					fileSize: null,
				});
				return;
			}
			try {
				const currentPermission = await handle.queryPermission();
				let hasPermission = currentPermission === "granted";
				if (!hasPermission) {
					setFileAccess({
						fileHandle: null,
						hasPermission: false,
						fileSize: null,
					});
					toast(
						<>
							{"Persistent file permission required. "}
							<a
								href="/loa-logs-config"
								className="underline text-primary"
								target="_blank"
								rel="noopener noreferrer"
							>
								Setup here
							</a>
						</>,
						{ duration: 8000 },
					);
					return;
				}
				const file = await handle.getFile();
				setFileAccess({
					fileHandle: handle,
					hasPermission: true,
					fileSize: file.size,
				});
				// Launch worker and send init message
				workerRef.current = new Worker(
					new URL("../../workers/dbWorker.ts", import.meta.url),
				);

				workerRef.current.addEventListener("message", handleWorkerMessage);
				workerRef.current.addEventListener("error", handleError);

				workerRef.current.postMessage({
					type: "init",
					payload: { fileHandle: handle },
				});
			} catch {
				setFileAccess({
					fileHandle: null,
					hasPermission: false,
					fileSize: null,
				});
			}
		}

		setupFileAccessAndWorker();

		return () => {
			if (workerRef.current) {
				workerRef.current.removeEventListener("message", handleWorkerMessage);
				workerRef.current.removeEventListener("error", handleError);
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, []);

	return {
		isReady: isWorkerReady,
		getWeeklyRaids: () => {
			if (!fileAccess.fileHandle) {
				throw new Error("No file handle available");
			}
			if (!workerRef.current) {
				throw new Error("Worker not initialized");
			}
			const weeklyResetTimestamp = getLatestWeeklyReset().getTime();
			const query =
				"SELECT current_boss, difficulty, local_player, fight_start FROM encounter_preview WHERE cleared=1 AND fight_start > ? ORDER BY id DESC";
			workerRef.current?.postMessage({
				type: "query",
				payload: {
					query: query.replace("?", weeklyResetTimestamp.toString()),
				},
			});
		},
	};
}
