"use client";

import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo, useState } from "react";
import TodoCard from "./TodoCard";
import { TodoCardsNoCharactersCard } from "./TodoCardsNoCharactersCard";
import TodoCardsSeparateTasksButton from "./TodoCardsSeparateTasksButton";
import TodoCardsMovableMenu from "./TodoCardsMovableMenu";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export default function TodoCards() {
	const mainStore = useMainStore();
	const uiSettingsStore = useSettingsStore((store) => store);
	const [parent] = useAutoAnimate();
	const [showTasks, setShowTasks] = useState(false);
	const [showCompleted, setShowCompleted] = useState(false);

	const charCards = useMemo(() => {
		return mainStore.characters.map((char) =>
			char.isSpacer ? (
				<div className="w-56" key={char.id}></div>
			) : (
				<TodoCard
					char={char}
					key={char.id}
					mode={
						uiSettingsStore.state.uiSettings.separateTasks
							? showTasks
								? "tasks"
								: "raids"
							: "default"
					}
					hideCompleted={
						uiSettingsStore.state.uiSettings.hideCompleted
							? !showCompleted
							: false
					}
				/>
			)
		);
	}, [
		mainStore.characters,
		showTasks,
		uiSettingsStore.state.uiSettings.separateTasks,
		uiSettingsStore.state.uiSettings.hideCompleted,
		showCompleted,
	]);

	if (!mainStore.hasHydrated) {
		return null;
	}

	return (
		<>
			{(uiSettingsStore.state.uiSettings.separateTasks ||
				uiSettingsStore.state.uiSettings.hideCompleted) && (
				<TodoCardsMovableMenu
					position={uiSettingsStore.state.uiSettings.separateTasksPos}
					setPosition={uiSettingsStore.state.setSeparateTasksPos}
				>
					{uiSettingsStore.state.uiSettings.separateTasks && (
						<div className="flex gap-1 flex-col items-center">
							<TodoCardsSeparateTasksButton
								showTasks={showTasks}
								setShowTasks={setShowTasks}
							/>
						</div>
					)}
					{uiSettingsStore.state.uiSettings.hideCompleted && (
						<div className="flex items-center gap-2 self-start">
							<Checkbox
								id="show-completed"
								checked={showCompleted}
								onCheckedChange={(checked) => setShowCompleted(!!checked)}
							/>
							<Label htmlFor="show-completed">Show All</Label>
						</div>
					)}
				</TodoCardsMovableMenu>
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
