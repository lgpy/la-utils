import { DateTime } from "luxon";

export function getLatestWeeklyReset({
  BiWeekly,
  currentDateOverride,
}: {
  BiWeekly?: "odd" | "even";
  currentDateOverride?: DateTime;
}) {
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

export function getLatestDailyReset({
  currentDateOverride,
}: {
  currentDateOverride?: DateTime;
}) {
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

export function hasReset({
  dateRaidWasComplete,
  BiWeekly,
  currentDateOverride,
}: {
  dateRaidWasComplete: DateTime;
  BiWeekly?: "odd" | "even";
  currentDateOverride?: DateTime;
}) {
  const latestReset = getLatestWeeklyReset({
    BiWeekly,
    currentDateOverride,
  });

  return latestReset >= dateRaidWasComplete;
}
