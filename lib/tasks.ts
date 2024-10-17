import { zodTask } from "@/stores/main";
import { DateTime } from "luxon";
import { z } from "zod";
import { getLatestWeeklyReset, hasReset } from "./dates";

export type Task = z.infer<typeof zodTask>;

export function isTaskCompleted(
  task: Task,
  currentDateOverride?: DateTime,
): boolean {
  if (task.completedDate === undefined) return false;
  const taskDate = DateTime.fromISO(task.completedDate);

  switch (task.type) {
    case "weekly": {
      const latestReset = getLatestWeeklyReset({ currentDateOverride });
      return latestReset < taskDate;
    }
    case "daily": {
      const latestReset = getLatestWeeklyReset({ currentDateOverride });
      return latestReset < taskDate;
    }
  }
}
