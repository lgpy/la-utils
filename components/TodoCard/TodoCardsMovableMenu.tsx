"use client";

import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";
import MovableMenu from "../MovableMenu";
import TodoCardsSeparateTasksButton from "./TodoCardsSeparateTasksButton";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export default function TodoCardsMovableMenu() {
	const mainStore = useMainStore();
	const uiSettingsStore = useSettingsStore((store) => store);

	if (!mainStore.hasHydrated || !uiSettingsStore.hasHydrated) return null;

	if (
		!uiSettingsStore.state.uiSettings.separateTasks &&
		!uiSettingsStore.state.uiSettings.hideCompleted
	)
		return null;

	return (
		<MovableMenu
			position={uiSettingsStore.state.uiSettings.separateTasksPos}
			setPosition={uiSettingsStore.state.setSeparateTasksPos}
		>
			{uiSettingsStore.state.uiSettings.separateTasks && (
				<div className="flex gap-1 flex-col items-center">
					<TodoCardsSeparateTasksButton
						showTasks={uiSettingsStore.state.uiSettings.showSeparatedTasks}
						setShowTasks={uiSettingsStore.state.setShowSeparatedTasks}
					/>
				</div>
			)}
			{uiSettingsStore.state.uiSettings.hideCompleted && (
				<div className="flex items-center gap-2 self-start">
					<Checkbox
						id="show-completed"
						checked={uiSettingsStore.state.uiSettings.forceShowCompleted}
						onCheckedChange={(checked) =>
							uiSettingsStore.state.setForceShowCompleted(!!checked)
						}
					/>
					<Label htmlFor="show-completed">Show All</Label>
				</div>
			)}
		</MovableMenu>
	);
}
