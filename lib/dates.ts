import { DateTime } from "luxon";
import { raids } from "./raids";
import { Task } from "./tasks";

export function getLatestBiWeeklyReset(
  BiWeekly: "odd" | "even",
  currentDateOverride?: DateTime,
): DateTime {
  return _getLatestWeeklyReset(BiWeekly, currentDateOverride);
}

export function getLatestWeeklyReset(currentDateOverride?: DateTime): DateTime {
  return _getLatestWeeklyReset(undefined, currentDateOverride);
}

function _getLatestWeeklyReset(
  BiWeekly?: "odd" | "even",
  currentDateOverride?: DateTime,
) {
  const currentDate = currentDateOverride ?? DateTime.now().setZone("UTC");

  let latestWednesday = currentDate
    .set({ weekday: 3 })
    .set({ hour: 8, minute: 0, second: 0, millisecond: 0 });

  if (latestWednesday > currentDate) {
    latestWednesday = latestWednesday.minus({ weeks: 1 });
  }
  if (BiWeekly) {
    if (BiWeekly === "odd" && latestWednesday.weekNumber % 2 !== 0) {
      latestWednesday = latestWednesday.minus({ weeks: 1 });
    } else if (BiWeekly === "even" && latestWednesday.weekNumber % 2 === 0) {
      latestWednesday = latestWednesday.minus({ weeks: 1 });
    }
  }

  return latestWednesday;
}

export function getLatestDailyReset(currentDateOverride?: DateTime) {
  const currentDate = currentDateOverride ?? DateTime.now().setZone("UTC");
  const reset = currentDate.set({
    hour: 8,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  if (reset > currentDate) {
    return reset.minus({ days: 1 });
  }
  return reset;
}

export function getGateResetDate(raidId: string, gateId: string) {
  const isBiWeekly = raids[raidId].gates[gateId].isBiWeekly;
  if (isBiWeekly === undefined) return getLatestWeeklyReset();
  else if (isBiWeekly === "odd") return getLatestBiWeeklyReset("odd");
  else return getLatestBiWeeklyReset("even");
}

export function getTaskResetDate(taskType: Task["type"]) {
  switch (taskType) {
    case "daily":
      return getLatestDailyReset();
    case "weekly":
      return getLatestWeeklyReset();
  }
}
