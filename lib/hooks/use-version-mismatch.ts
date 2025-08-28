
import { useEffect, useState } from 'react';
import { StoreApi } from 'zustand';
import { PersistOptions } from 'zustand/middleware';

type PersistListener<S> = (state: S) => void;
type StorePersist<S, Ps> = {
  persist: {
    setOptions: (options: Partial<PersistOptions<S, Ps>>) => void;
    clearStorage: () => void;
    rehydrate: () => Promise<void> | void;
    hasHydrated: () => boolean;
    onHydrate: (fn: PersistListener<S>) => () => void;
    onFinishHydration: (fn: PersistListener<S>) => () => void;
    getOptions: () => Partial<PersistOptions<S, Ps>>;
  };
};
type Write<T, U> = Omit<T, keyof U> & U;

export const useVersionMismatch = (boundStore: Write<StoreApi<any>, StorePersist<any, any>>) => {
  const [isOldVersion, setIsOldVersion] = useState(false);

  useEffect(() => {
    if (window === undefined) return;
    const options = boundStore.persist.getOptions();
    if (options.name === undefined) return;
    const storageEntry = localStorage.getItem(options.name);
    if (storageEntry) {
      const jsonStorageEntry = JSON.parse(storageEntry);
      const options = boundStore.persist.getOptions();
      if (
        typeof jsonStorageEntry.version === "number" &&
        options.version !== undefined &&
        jsonStorageEntry.version < options.version
      ) {
        setIsOldVersion(true);
      }
    }
  }, [boundStore.persist]);

  return isOldVersion;
}

