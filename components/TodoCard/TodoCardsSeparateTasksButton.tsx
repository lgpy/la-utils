"use client";

import { useMainStore } from "@/stores/main-store/provider";
import { Toggle } from "../ui/toggle";
import { ClipboardListIcon } from "lucide-react";

interface Props {
	showTasks: boolean;
	setShowTasks: (value: boolean) => void;
}

export default function TodoCardsSeparateTasksButton({
	showTasks,
	setShowTasks,
}: Props) {
	const mainStore = useMainStore();

	const tasks = mainStore.characters.flatMap((char) => char.tasks);
	const tasksByType = {
		daily: tasks.filter((task) => task.type === "daily"),
		weekly: tasks.filter((task) => task.type === "weekly"),
		rested: tasks.filter((task) => task.type === "rested"),
	};
	const dailyTasks = tasksByType.daily.filter((task) => !task.completed);
	const weeklyTasks = tasksByType.weekly.filter((task) => !task.completed);
	const restedTasks = tasksByType.rested.filter((task) => !task.completed);

	return (
		<>
			<Toggle
				aria-label="Toggle italic"
				pressed={showTasks}
				onPressedChange={setShowTasks}
			>
				<ClipboardListIcon />
				Show Tasks
			</Toggle>
			<div className="grid grid-cols-[max-content_1fr] gap-1 text-xs text-muted-foreground">
				{tasksByType.daily.length > 0 && (
					<>
						<span className="text-end">{dailyTasks.length}</span>
						<span>Daily</span>
					</>
				)}
				{tasksByType.rested.length > 0 && (
					<>
						<span className="text-end">{restedTasks.length}</span>
						<span>Rested</span>
					</>
				)}
				{tasksByType.weekly.length > 0 && (
					<>
						<span className="text-end">{weeklyTasks.length}</span>
						<span>Weekly</span>
					</>
				)}
			</div>
		</>
	);
}
