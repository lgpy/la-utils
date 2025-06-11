import { getLatestWeeklyReset } from "@/lib/dates";
import { raids } from "@/lib/raids";
import initSqlJs from "sql.js";
import { z } from "zod";

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

export interface LoaLogsFileAccess {
  fileHandle: FileSystemFileHandle | null;
  hasPermission: boolean;
  lastAccessed: Date | null;
  fileSize: number | null;
}

// IndexedDB utilities for persistent file handle storage
export async function storeLoaLogsFileHandle(fileHandle: FileSystemFileHandle): Promise<void> {
  const request = indexedDB.open("LoaLogsDB", 1);
  return new Promise<void>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["fileHandles"], "readwrite");
      const store = transaction.objectStore("fileHandles");
      store.put(fileHandle, "encounters.db");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("fileHandles")) {
        db.createObjectStore("fileHandles");
      }
    };
  });
}

export async function getStoredLoaLogsFileHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const request = indexedDB.open("LoaLogsDB", 1);
    const fileHandle = await new Promise<FileSystemFileHandle | null>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["fileHandles"], "readonly");
        const store = transaction.objectStore("fileHandles");
        const getRequest = store.get("encounters.db");
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("fileHandles")) {
          db.createObjectStore("fileHandles");
        }
      };
    });

    // Return the stored handle directly without validation
    // The validation and permission request should be done by the caller
    // to properly trigger the persistent permissions flow
    return fileHandle;
  } catch (error) {
    console.warn("Failed to retrieve stored file handle:", error);
    return null;
  }
}

// New function to request persistent permissions on a stored handle
export async function requestPersistentPermission(fileHandle: FileSystemFileHandle): Promise<boolean> {
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
  const request = indexedDB.open("LoaLogsDB", 1);
  return new Promise<void>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["fileHandles"], "readwrite");
      const store = transaction.objectStore("fileHandles");
      store.delete("encounters.db");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" &&
    typeof FileSystemHandle !== "undefined" &&
    "queryPermission" in FileSystemHandle.prototype &&
    "requestPermission" in FileSystemHandle.prototype;
}

const zEntries = z.object({
  current_boss: z.string(),
  difficulty: z.string(),
  local_player: z.string(),
  fight_start: z.number(),
}).array();

export async function getWeeklyRaids(file: File) {
  const SQL = await initSqlJs({
    locateFile: (file) =>
      file.endsWith(".wasm") ? `https://sql.js.org/dist/${file}` : file,
  });

  const arrayBuffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(arrayBuffer));

  const tableExists =
    db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='encounter_preview'",
    ).length > 0;

  if (!tableExists) {
    db.close();
    throw new Error("encounter_preview table does not exist in the database.");
  }

  const weeklyResetTimestamp = getLatestWeeklyReset().getTime();
  const result = db.exec(
    "SELECT * FROM encounter_preview WHERE cleared=1 AND fight_start > ? ORDER BY id DESC",
    [weeklyResetTimestamp],
  );

  if (result.length === 0) {
    db.close();
    return [];
  }

  db.close();

  const resToObjArray = result[0].values.map((row) =>
    Object.fromEntries(
      result[0].columns.map((col, index) => [col, row[index]]),
    ),
  );

  const parsedEntries = zEntries.safeParse(resToObjArray);
  if (!parsedEntries.success) {
    console.error("Failed to parse weekly raids data:", parsedEntries.error);
    throw new Error("Invalid data format in encounter_preview table");
  }
  return parsedEntries.data;
}

export function getGateInfoFromClearBossName(
  clearBossName: string,
  difficulty: string,
) {
  if (difficulty !== "Normal" && difficulty !== "Hard") {
    throw new Error("Invalid difficulty, expected 'Normal' or 'Hard'");
  }
  for (const [raidId, raidInfo] of Object.entries(raids)) {
    for (const [gateId, gateInfo] of Object.entries(raidInfo.gates)) {
      if (gateInfo.difficulties[difficulty]?.clearBossName === clearBossName)
        return {
          raidId,
          gateId,
        }
    }
  }

  return null;
}
