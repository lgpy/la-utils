import { useState, useEffect } from "react";
import { getStoredLoaLogsFileHandle, getWeeklyRaids, requestPersistentPermission } from "@/components/LoaLogAccess/utils";


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
      .then(async (handle) => {
        if (handle) {
          try {
            // Check current permission status
            const currentPermission = await handle.queryPermission();

            if (currentPermission === "granted") {
              // Permission already granted, verify file access
              const file = await handle.getFile();
              setFileAccess({
                fileHandle: handle,
                hasPermission: true,
                fileSize: file.size,
              });
            } else {
              // Try to request persistent permission
              const granted = await requestPersistentPermission(handle);
              if (granted) {
                const file = await handle.getFile();
                setFileAccess({
                  fileHandle: handle,
                  hasPermission: true,
                  fileSize: file.size,
                });
              } else {
                setFileAccess({
                  fileHandle: null,
                  hasPermission: false,
                  fileSize: null,
                });
              }
            }
          } catch (error) {
            // File no longer accessible or other error
            setFileAccess({
              fileHandle: null,
              hasPermission: false,
              fileSize: null,
            });
          }
        } else {
          setFileAccess({
            fileHandle: null,
            hasPermission: false,
            fileSize: null,
          });
        }
      })
      .catch(() => {
        // Handle any errors by resetting state
        setFileAccess({
          fileHandle: null,
          hasPermission: false,
          fileSize: null,
        });
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
