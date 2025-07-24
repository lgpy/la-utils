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
