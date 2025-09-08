import { TaskType } from "@/generated/prisma";
import { raidData } from "./game-info";

export function getLatestBiWeeklyReset(
	BiWeekly: "odd" | "even",
	currentDateOverride?: Date
): Date {
	return _getLatestWeeklyReset(BiWeekly, currentDateOverride);
}

export function getLatestWeeklyReset(currentDateOverride?: Date): Date {
	return _getLatestWeeklyReset(undefined, currentDateOverride);
}

const UTC_RESET_HOUR = 10;

function _getLatestWeeklyReset(
	BiWeekly?: "odd" | "even",
	currentDateOverride?: Date
): Date {
	const currentDate = currentDateOverride ?? new Date();
	const currentDay = currentDate.getUTCDay();
	const currentHour = currentDate.getUTCHours();

	const latestWednesday = new Date(currentDate);
	latestWednesday.setUTCDate(currentDate.getUTCDate() - ((currentDay + 4) % 7));
	latestWednesday.setUTCHours(UTC_RESET_HOUR, 0, 0, 0);

	if (
		latestWednesday > currentDate ||
		(latestWednesday.getUTCDay() === currentDay && currentHour < UTC_RESET_HOUR)
	) {
		latestWednesday.setUTCDate(latestWednesday.getUTCDate() - 7);
	}

	if (BiWeekly) {
		const weekNumber = Math.floor(
			(latestWednesday.getTime() -
				new Date(latestWednesday.getUTCFullYear(), 0, 1).getTime()) /
				(7 * 24 * 60 * 60 * 1000)
		);
		if (BiWeekly === "odd" && weekNumber % 2 === 0) {
			latestWednesday.setUTCDate(latestWednesday.getUTCDate() - 7);
		} else if (BiWeekly === "even" && weekNumber % 2 !== 0) {
			latestWednesday.setUTCDate(latestWednesday.getUTCDate() - 7);
		}
	}

	return latestWednesday;
}

export function getLatestDailyReset(currentDateOverride?: Date): Date {
	const currentDate = currentDateOverride ?? new Date();
	const reset = new Date(currentDate);
	reset.setUTCHours(UTC_RESET_HOUR, 0, 0, 0);
	if (reset > currentDate) {
		reset.setUTCDate(reset.getUTCDate() - 1);
	}
	return reset;
}

export function getRestedReset(currentDateOverride?: Date): Date {
	const dailyReset = getLatestDailyReset(currentDateOverride);
	const restedReset = new Date(dailyReset);
	restedReset.setUTCDate(restedReset.getUTCDate() - 2);
	return restedReset;
}

export function getGateResetDate(raidId: string, gateId: string) {
	const gateData = raidData.getOrThrow(raidId).getGateOrThrow(gateId);
	if (gateData.isBiWeekly === undefined) return getLatestWeeklyReset();
	if (gateData.isBiWeekly === "odd") return getLatestBiWeeklyReset("odd");
	return getLatestBiWeeklyReset("even");
}

export function getTaskResetDate(taskType: TaskType) {
	switch (taskType) {
		case "daily":
			return getLatestDailyReset();
		case "weekly":
			return getLatestWeeklyReset();
		case "rested":
			return getRestedReset();
		default:
			const _exhaustiveCheck: never = taskType;
			return new Date(); // Fallback, should never happen
	}
}
