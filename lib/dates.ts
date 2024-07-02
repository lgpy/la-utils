import { DateTime } from "luxon";

export function getLatestReset(BiWeekly?: "odd" | "even") {
  const currentDate = DateTime.now().setZone("UTC");

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

export function hasReset(date: DateTime, BiWeekly?: "odd" | "even") {
  const latestReset = getLatestReset(BiWeekly);

  return latestReset >= date;
}
