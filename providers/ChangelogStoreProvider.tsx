"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createChangelogStore, type ChangelogStore } from "@/stores/changelog";

const ChangelogStoreContext = createContext<ReturnType<
	typeof createChangelogStore
> | null>(null);

export interface ChangelogStoreProviderProps {
	children: ReactNode;
}

export const ChangelogStoreProvider = ({
	children,
}: ChangelogStoreProviderProps) => {
	const store = createChangelogStore();

	return (
		<ChangelogStoreContext.Provider value={store}>
			{children}
		</ChangelogStoreContext.Provider>
	);
};

export const useChangelogStore = () => {
	const context = useContext(ChangelogStoreContext);
	const [isHydrated, setIsHydrated] = useState(false);

	if (!context) {
		throw new Error(
			"useChangelogStore must be used within a ChangelogStoreProvider",
		);
	}

	useEffect(() => {
		if (context.persist.hasHydrated) {
			setIsHydrated(context.persist.hasHydrated());
		}
		context.persist.onFinishHydration(() => {
			setIsHydrated(true);
		});
	}, [context.persist]);

	const store = useStore(context);

	return {
		...store,
		isHydrated,
	};
};
