import type { z } from "zod";
import { getTaskResetDate } from "./dates";
import { zodTask } from "@/stores/main/types";

export type Task = z.infer<typeof zodTask>;

export function isTaskCompleted(task: Task, latestReset?: Date): boolean {
	if (task.completedDate === undefined) return false;
	if (!latestReset) {
		latestReset = getTaskResetDate(task.type);
	}
	const taskDate = new Date(task.completedDate);
	return latestReset < taskDate;
}
