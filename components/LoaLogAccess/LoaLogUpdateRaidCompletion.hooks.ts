import { useState, useEffect } from "react";
import { getStoredLoaLogsFileHandle, getWeeklyRaids } from "@/components/LoaLogAccess/utils";


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

  useEffect(() => {
    getStoredLoaLogsFileHandle()
      .then((handle) => {
        if (handle) {
          handle.queryPermission().then((permission) => {
            if (permission === "granted") {
              handle.getFile().then((file) => {
                setFileAccess({
                  fileHandle: handle,
                  hasPermission: true,
                  fileSize: file.size,
                });
              });
            }
          });
        }
      })
      .catch(() => {
        // Ignore errors when checking stored access
      });
  }, []);

  return {
    hasAccess: fileAccess.hasPermission,
    getWeeklyRaids: async () => {
      if (!fileAccess.fileHandle) {
        throw new Error("No file handle available");
      }

      const file = await fileAccess.fileHandle.getFile();

      const result = await getWeeklyRaids(file);

      return result;
    }
  };
}
