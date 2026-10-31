import { raidData } from "@/lib/game-info";
import * as v from "valibot";

// File System Access API utilities for LOA Logs
declare global {
	interface FileSystemFileHandle {
		getFile(): Promise<File>;
		queryPermission(): Promise<"granted" | "denied" | "prompt">;
		requestPermission(): Promise<"granted" | "denied" | "prompt">;
		name: string;
	}
	interface DataTransferItem {
		getAsFileSystemHandle?(): Promise<FileSystemFileHandle>;
	}
}

const IDB_NAME = "LoaLogsDB";
// Kept at 2 even though only `fileHandles` is used: an earlier build created the
// database at version 2, and reopening it with a lower version throws.
const IDB_VERSION = 2;
const HANDLE_STORE = "fileHandles";
const DB_KEY = "encounters.db";

export const BLOCKED_PATH_HINT =
	"Your browser refused to read the file even though access was granted. This can happen when " +
	"the browser lost access to the folder, or when the file is locked or being replaced. " +
	"The database is read in place and never copied. Click Clear Access and connect the file " +
	"again; if it keeps failing, try Chrome or Edge and rerun the setup.";

function openLoaLogsDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(IDB_NAME, IDB_VERSION);
		request.onerror = () => reject(request.error);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(HANDLE_STORE)) {
				db.createObjectStore(HANDLE_STORE);
			}
		};
		request.onsuccess = () => resolve(request.result);
	});
}

async function idbGet<T>(storeName: string): Promise<T | null> {
	const db = await openLoaLogsDb();
	try {
		return await new Promise<T | null>((resolve, reject) => {
			const transaction = db.transaction([storeName], "readonly");
			const request = transaction.objectStore(storeName).get(DB_KEY);
			request.onsuccess = () => resolve((request.result as T) ?? null);
			request.onerror = () => reject(request.error);
		});
	} finally {
		db.close();
	}
}

async function idbPut(storeName: string, value: unknown): Promise<void> {
	const db = await openLoaLogsDb();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction([storeName], "readwrite");
			transaction.objectStore(storeName).put(value, DB_KEY);
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
	} finally {
		db.close();
	}
}

async function idbDelete(storeName: string): Promise<void> {
	const db = await openLoaLogsDb();
	try {
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction([storeName], "readwrite");
			transaction.objectStore(storeName).delete(DB_KEY);
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
	} finally {
		db.close();
	}
}

// --- Live file handle --------------------------------------------------------
// The database is always read in place through the stored handle: no copy is
// made, nothing is duplicated on disk, and reads see the current file contents.
// Always probe a handle with `probeHandleReadable()` before trusting it:
// `queryPermission()` can report "granted" while reads still fail.

export async function storeLoaLogsFileHandle(
	fileHandle: FileSystemFileHandle
): Promise<void> {
	await idbPut(HANDLE_STORE, fileHandle);
}

export async function getStoredLoaLogsFileHandle(): Promise<FileSystemFileHandle | null> {
	try {
		// The caller validates the handle; validation triggers the persistent
		// permissions flow, which must happen on a user gesture.
		return await idbGet<FileSystemFileHandle>(HANDLE_STORE);
	} catch (error) {
		console.warn("Failed to retrieve stored file handle:", error);
		return null;
	}
}

// New function to request persistent permissions on a stored handle
export async function requestPersistentPermission(
	fileHandle: FileSystemFileHandle
): Promise<boolean> {
	try {
		// This is the key: calling requestPermission() on a previously stored handle
		// triggers the new three-way persistent permissions prompt
		const permission = await fileHandle.requestPermission();
		return permission === "granted";
	} catch (error) {
		console.warn("Failed to request persistent permission:", error);
		return false;
	}
}

export async function clearStoredLoaLogsFileHandle(): Promise<void> {
	await idbDelete(HANDLE_STORE);
}

export type HandleProbeResult =
	| { readable: true }
	| { readable: false; reason: "blocked" | "missing" | "denied" | "unknown" };

/**
 * Checks whether a handle can actually be read. This is the only reliable
 * capability check for the File System Access API: a browser can reject a read
 * with a SecurityError even when permission has been reported as granted.
 */
export async function probeHandleReadable(
	fileHandle: FileSystemFileHandle
): Promise<HandleProbeResult> {
	try {
		await fileHandle.getFile();
		return { readable: true };
	} catch (error) {
		const name = error instanceof DOMException ? error.name : "";
		if (name === "SecurityError") return { readable: false, reason: "blocked" };
		if (name === "NotFoundError") return { readable: false, reason: "missing" };
		if (name === "NotAllowedError")
			return { readable: false, reason: "denied" };
		return { readable: false, reason: "unknown" };
	}
}

/** Maps File System Access failures to something a user can act on. */
export function describeFileAccessError(error: unknown): string | null {
	if (error instanceof DOMException) {
		if (
			error.name === "SecurityError" ||
			/security policy of the user agent/i.test(error.message)
		) {
			return BLOCKED_PATH_HINT;
		}
		if (error.name === "NotFoundError") {
			return "The encounters.db file could not be found. It may have been moved, renamed or deleted by LOA Logs.";
		}
		if (error.name === "NotAllowedError") {
			return "File access was denied. Allow access to the file and try again.";
		}
	}
	return null;
}

export function isFileSystemAccessSupported(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof FileSystemHandle !== "undefined" &&
		"queryPermission" in FileSystemHandle.prototype &&
		"requestPermission" in FileSystemHandle.prototype
	);
}

export const zEntries = v.array(
	v.object({
		current_boss: v.string(),
		difficulty: v.string(),
		local_player: v.string(),
		fight_start: v.number(),
	})
);

export type DbEntry = v.InferOutput<typeof zEntries.item>;

// guardian raids: https://github.com/snoww/loa-logs/blob/master/src/lib/constants/encounters.ts
export const ignoreBosses = new Set([
	"Drextalas",
	"Skolakia",
	"Argeos",
	"Veskal",
	"Gargadeth",
	"Sonavel",
	"Hanumatan",
	"Kungelanium",
	"Deskaluda",
]);

export function getGateInfoFromClearBossName(clearBossName: string) {
	for (const [raidId, raidInfo] of raidData.raids.entries()) {
		for (const [gateId, gateInfo] of raidInfo.gates.entries()) {
			if (gateInfo.bossName.includes(clearBossName)) {
				return {
					raidId,
					gateId,
				};
			}
		}
	}

	return null;
}
