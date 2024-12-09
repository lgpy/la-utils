import { zodTask } from "@/stores/main";
import { z } from "zod";

export type Task = z.infer<typeof zodTask>;

export function isTaskCompleted(task: Task, latestReset: Date): boolean {
  if (task.completedDate === undefined) return false;
  const taskDate = new Date(task.completedDate);
  return latestReset < taskDate;
}
