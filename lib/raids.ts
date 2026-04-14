import { Difficulty } from "@/prisma/generated/enums";

export const shortenDifficulty = (difficulty: Difficulty) => {
	switch (difficulty) {
		case Difficulty.Normal:
			return "NM";
		case Difficulty.Hard:
			return "HM";
		case Difficulty.Solo:
			return "SO";
		case Difficulty.Nightmare:
			return "NT";
		default:
			const _exhaustive: never = difficulty;
			return _exhaustive;
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
		case Difficulty.Nightmare:
			return "T";
		default:
			const _exhaustive: never = difficulty;
			return _exhaustive;
	}
};

export const isGateCompleted = (
	dateRaidWasComplete: Date,
	latestReset: Date
) => {
	return latestReset < dateRaidWasComplete;
};
