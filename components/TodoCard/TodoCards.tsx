"use client";

import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo, useState } from "react";
import TodoCard from "./TodoCard";
import { TodoCardsNoCharactersCard } from "./TodoCardsNoCharactersCard";
import { Toggle } from "@/components/ui/toggle"
import { ClipboardListIcon } from "lucide-react";

export default function TodoCards() {
	const mainStore = useMainStore();
	const experimentsStore = useSettingsStore((store) => store.experiments);
	const [parent] = useAutoAnimate();
	const [showTasks, setShowTasks] = useState(false);

	const charCards = useMemo(() => {
		return mainStore.characters.map((char) => (
			<TodoCard char={char} key={char.id} mode={experimentsStore.state.separateTasks ? (showTasks ? "tasks" : "raids") : "default"} />
		));
	}, [mainStore.characters, showTasks, experimentsStore.state.separateTasks]);

	if (!mainStore.hasHydrated) {
		return null;
	}

	return (
		<>
			{experimentsStore.state.separateTasks && (
				<div className="absolute top-20 right-4">
					<Toggle aria-label="Toggle italic" pressed={showTasks} onPressedChange={setShowTasks}>
						<ClipboardListIcon />
						Show Tasks
					</Toggle>
				</div>
			)}
			<main
				className="mt-6 grid xl:grid-cols-[auto_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_auto] sm:grid-cols-[auto_auto] gap-3 justify-center"
				ref={parent}
			>
				{charCards}
				{mainStore.characters.length === 0 && <TodoCardsNoCharactersCard />}
			</main>
		</>
	);
}
