import { zodTask } from "@/stores/main";
import { DateTime } from "luxon";
import { z } from "zod";

export type Task = z.infer<typeof zodTask>;

export function isTaskCompleted(task: Task, latestReset: DateTime): boolean {
  if (task.completedDate === undefined) return false;
  const taskDate = DateTime.fromISO(task.completedDate);
  return latestReset < taskDate;
}
