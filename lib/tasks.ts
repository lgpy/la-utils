import type { z } from "zod";
import { getTaskResetDate } from "./dates";
import { zodTask } from "@/stores/main-store/types";

export type Task = z.infer<typeof zodTask>;

export function getTaskCompletionState(task: Task, completionDate: number | undefined, completions: number, latestReset?: Date): [number, number] {
	if (completionDate === undefined) return [0, task.timesToComplete];
	if (!latestReset) {
		latestReset = getTaskResetDate(task.type);
	}
	const taskDate = new Date(completionDate);
	if (latestReset < taskDate) return [completions, task.timesToComplete];
	else return [0, task.timesToComplete]; // expired
}

