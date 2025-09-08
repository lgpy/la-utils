import { useEffect, useState } from "react";
import { StoreApi } from "zustand";
import { PersistOptions } from "zustand/middleware";

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

export const useHydration = (
	boundStore: Write<StoreApi<any>, StorePersist<any, any>>
) => {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		if (!boundStore.persist) return;
		const unsubHydrate = boundStore.persist.onHydrate(() => setHydrated(false));
		const unsubFinishHydration = boundStore.persist.onFinishHydration(() =>
			setHydrated(true)
		);
		if (typeof boundStore.persist.hasHydrated === "function") {
			setHydrated(boundStore.persist.hasHydrated());
		}
		return () => {
			unsubHydrate();
			unsubFinishHydration();
		};
	}, [boundStore]);

	return hydrated;
};
