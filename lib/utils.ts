import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatGold(gold: number) {
	const absGold = Math.abs(gold);
	let dividedGold = 0;
	let suffix = "";
	const prefix = gold < 0 ? "-" : "";
	if (absGold >= 1000000) {
		dividedGold = absGold / 1000000;
		suffix = "m";
	} else if (absGold >= 1000) {
		dividedGold = absGold / 1000;
		suffix = "k";
	} else {
		dividedGold = absGold;
	}

	const formattedGold =
		dividedGold % 1 === 0 ? dividedGold.toFixed(0) : dividedGold.toFixed(1);
	return `${prefix}${formattedGold}${suffix}`;
}

export interface Resolution {
	width: number;
	height: number;
}

export interface Region {
	x: number;
	y: number;
	width: number;
	height: number;
}
