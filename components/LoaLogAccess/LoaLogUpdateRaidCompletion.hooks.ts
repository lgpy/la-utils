import { useState, useEffect, useRef } from "react";
import { getStoredLoaLogsFileHandle, requestPersistentPermission, zEntries } from "@/components/LoaLogAccess/utils";
import { getLatestWeeklyReset } from "@/lib/dates";


interface FileAccessState {
  fileHandle: FileSystemFileHandle | null;
  hasPermission: boolean;
  fileSize: number | null;
}

/**
 * Hook to get real-time LOA Logs file access status
 * This checks the actual file handle instead of relying on cached state
 */
export function useLoaLogsDb() {
  const [fileAccess, setFileAccess] = useState<FileAccessState>({
    fileHandle: null,
    hasPermission: false,
    fileSize: null,
  });

  // Persist worker instance for the lifetime of the hook
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let isMounted = true;
    let worker: Worker | null = null;

    async function setupFileAccessAndWorker() {
      const handle = await getStoredLoaLogsFileHandle();
      if (!isMounted) return;
      if (!handle) {
        setFileAccess({ fileHandle: null, hasPermission: false, fileSize: null });
        return;
      }
      try {
        let hasPermission = false;
        const currentPermission = await handle.queryPermission();
        if (currentPermission === "granted") {
          hasPermission = true;
        } else {
          hasPermission = await requestPersistentPermission(handle);
        }
        if (!hasPermission) {
          setFileAccess({ fileHandle: null, hasPermission: false, fileSize: null });
          return;
        }
        const file = await handle.getFile();
        setFileAccess({ fileHandle: handle, hasPermission: true, fileSize: file.size });
        // Launch worker and send init message
        worker = new Worker(new URL("../../workers/dbWorker.ts", import.meta.url));
        workerRef.current = worker;
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Worker init timeout"));
          }, 10000);
          const handleInit = (event: MessageEvent) => {
            if (event.data && event.data.type === "init" && event.data.success) {
              clearTimeout(timeoutId);
              worker?.removeEventListener("message", handleInit);
              resolve();
            } else if (event.data?.error) {
              clearTimeout(timeoutId);
              worker?.removeEventListener("message", handleInit);
              reject(new Error(event.data.error));
            }
          };
          if (worker) {
            worker.addEventListener("message", handleInit);
            worker.postMessage({
              type: "init",
              payload: { fileHandle: handle }
            });
          } else {
            clearTimeout(timeoutId);
            reject(new Error("Worker not initialized"));
          }
        });
      } catch (error) {
        setFileAccess({ fileHandle: null, hasPermission: false, fileSize: null });
      }
    }

    setupFileAccessAndWorker();

    return () => {
      isMounted = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    hasAccess: fileAccess.hasPermission,
    getWeeklyRaids: async () => {
      if (!fileAccess.fileHandle) {
        throw new Error("No file handle available");
      }
      if (!workerRef.current) {
        throw new Error("Worker not initialized");
      }
      const weeklyResetTimestamp = getLatestWeeklyReset().getTime();
      const query = "SELECT * FROM encounter_preview WHERE cleared=1 AND fight_start > ? ORDER BY id DESC";
      const result = await new Promise<{ columns: string[]; rows: unknown[][] }[]>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Worker query timeout"));
        }, 30000);
        const handleMessage = (event: MessageEvent) => {
          clearTimeout(timeoutId);
          resolve(event.data);
          workerRef.current?.removeEventListener("message", handleMessage);
        };
        const handleError = (error: Event) => {
          clearTimeout(timeoutId);
          reject(error);
          workerRef.current?.removeEventListener("error", handleError);
        };
        workerRef.current?.addEventListener("message", handleMessage);
        workerRef.current?.addEventListener("error", handleError);
        workerRef.current?.postMessage({
          type: "query",
          payload: {
            query: query.replace("?", weeklyResetTimestamp.toString())
          }
        });
      });
      if (result.length === 0 || !result[0].rows.length) {
        return [];
      }
      const resToObjArray = result[0].rows.map((row) =>
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
  };
}
