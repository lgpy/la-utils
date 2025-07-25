import { Difficulty } from "@/generated/prisma";

export const shortenDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.Normal:
			return "NM";
		case Difficulty.Hard:
			return "HM";
		case Difficulty.Solo:
			return "SO";
	}
};

export const shortestDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.Normal:
			return "N";
		case Difficulty.Hard:
			return "H";
		case Difficulty.Solo:
			return "S";
	}
};

export const isGateCompleted = (
	dateRaidWasComplete: Date,
	latestReset: Date,
) => {
	return latestReset < dateRaidWasComplete;
};
