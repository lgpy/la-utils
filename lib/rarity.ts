import { cn } from "./utils";

export const getRarityClasses = (rarity?: string) => ({
	header: cn("bg-linear-to-b from-card to-card", {
		"from-ctp-mauve/30 dark:from-ctp-mauve/15": rarity === "epic",
		"from-ctp-blue/30 dark:from-ctp-blue/15": rarity === "rare",
		"from-ctp-green/30 dark:from-ctp-green/15": rarity === "uncommon",
		"from-ctp-overlay1/40 dark:from-ctp-overlay1/20": rarity === "common",
	}),
	text: cn("", {
		"text-ctp-mauve": rarity === "epic",
		"text-ctp-blue": rarity === "rare",
		"text-ctp-green": rarity === "uncommon",
		"text-ctp-overlay1": rarity === "common",
	}),
});
