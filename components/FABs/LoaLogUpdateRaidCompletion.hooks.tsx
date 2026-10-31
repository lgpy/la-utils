import { useState, useEffect, useRef } from "react";
import {
	DbEntry,
	getStoredLoaLogsFileHandle,
	probeHandleReadable,
	zEntries,
} from "@/components/FABs/LoaLogUpdateRaidCompletion.utils";
import { getLatestWeeklyReset } from "@/lib/dates";
import { toast } from "sonner";
import { DBWorkerResponse } from "@/workers/dbWorker";
import Link from "next/link";
import * as v from "valibot";

export interface LoaLogsDbSource {
	fileName: string | null;
	fileSize: number | null;
}

export function useLoaLogsDb(onResponse?: (data: DbEntry[]) => void) {
	const [source, setSource] = useState<LoaLogsDbSource | null>(null);

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
					query[0].columns.map((col, index) => [col, row[index]])
				)
			);
			const parsed = v.safeParse(zEntries, resToObjArray);
			if (!parsed.success) {
				console.error("Failed to parse weekly raids data:", parsed.issues);
				throw new Error("Invalid data format in encounter_preview table");
			}
			onResponseRef.current?.(parsed.output);
		} else if (event.data.type === "error") {
			const errorMessage = event.data.payload.message;
			console.error("Worker error:", errorMessage);
			toast.error("Worker error, check console for more details");
			setIsWorkerReady(false);
		}
	};

	useEffect(() => {
		let cancelled = false;

		const handleError = (error: ErrorEvent) => {
			console.error("Worker error:", error);
			toast.error("Worker error, check console for more details");
		};

		const startWorker = (fileHandle: FileSystemFileHandle) => {
			const worker = new Worker(
				new URL("../../workers/dbWorker.ts", import.meta.url),
				{
					type: "module",
				}
			);
			worker.addEventListener("message", handleWorkerMessage);
			worker.addEventListener("error", handleError);
			worker.postMessage({
				type: "init",
				payload: { fileHandle },
			});
			workerRef.current = worker;
		};

		async function setupFileAccessAndWorker() {
			// The database is read in place through the stored handle; there is no
			// local copy. Probe instead of trusting queryPermission(), which can report
			// "granted" while the browser still refuses to read the file.
			const storedHandle = await getStoredLoaLogsFileHandle();
			if (cancelled) return;

			if (storedHandle) {
				const probe = await probeHandleReadable(storedHandle);
				if (cancelled) return;
				if (probe.readable) {
					const file = await storedHandle.getFile();
					setSource({ fileName: file.name, fileSize: file.size });
					startWorker(storedHandle);
					return;
				}
				console.debug("Stored LOA Logs handle is not readable:", probe.reason);
			}

			setSource(null);
			toast(
				<>
					{"No readable LOA Logs database. "}
					<Link
						prefetch={false}
						href="/loa-logs-config"
						className="underline text-primary"
						target="_blank"
						rel="noopener noreferrer"
					>
						Set it up here
					</Link>
				</>,
				{ duration: 8000 }
			);
		}

		setupFileAccessAndWorker();

		return () => {
			cancelled = true;
			if (workerRef.current) {
				workerRef.current.removeEventListener("message", handleWorkerMessage);
				workerRef.current.removeEventListener("error", handleError);
				workerRef.current.terminate();
				workerRef.current = null;
				setIsWorkerReady(false);
			}
		};
	}, []);

	return {
		isReady: isWorkerReady,
		source,
		getWeeklyRaids: () => {
			if (!source) {
				throw new Error("No LOA Logs database available");
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
