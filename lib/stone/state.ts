import type { ColorCategory } from "./types";

export interface StoneStateInterface {
	line1: {
		detectedStatus: ColorCategory;
		pos: number;
	}[];
	line2: {
		detectedStatus: ColorCategory;
		pos: number;
	}[];
	line3: {
		detectedStatus: ColorCategory;
		pos: number;
	}[];
	percentage: number;
}

export class StoneState implements StoneStateInterface {
	readonly line1: { detectedStatus: ColorCategory; pos: number }[];
	readonly line2: { detectedStatus: ColorCategory; pos: number }[];
	readonly line3: { detectedStatus: ColorCategory; pos: number }[];
	readonly percentage: number;

	constructor(state: StoneStateInterface) {
		this.line1 = state.line1;
		this.line2 = state.line2;
		this.line3 = state.line3;
		this.percentage = state.percentage;
	}

	isEqual(other: StoneStateInterface): boolean {
		if (this.percentage !== other.percentage) return false;

		if (
			this.line1.length !== other.line1.length ||
			this.line2.length !== other.line2.length ||
			this.line3.length !== other.line3.length
		)
			return false;

		for (let i = 0; i < this.line1.length; i++)
			if (this.line1[i].detectedStatus !== other.line1[i].detectedStatus)
				return false;

		for (let i = 0; i < this.line2.length; i++)
			if (this.line2[i].detectedStatus !== other.line2[i].detectedStatus)
				return false;

		for (let i = 0; i < this.line3.length; i++)
			if (this.line3[i].detectedStatus !== other.line3[i].detectedStatus)
				return false;

		return true;
	}

	predictPercentageChange(
		newState: Omit<StoneStateInterface, "percentage">
	): number | null {
		const oldCount = { failures: 0, successes: 0 };
		const newCount = { failures: 0, successes: 0 };

		const statusChecker = (
			status: string,
			obj: { failures: number; successes: number }
		) => {
			switch (status) {
				case "success":
					obj.successes++;
					break;
				case "failure":
					obj.failures++;
					break;
				default:
					break;
			}
		};

		for (const cell of this.line1) statusChecker(cell.detectedStatus, oldCount);
		for (const cell of this.line2) statusChecker(cell.detectedStatus, oldCount);
		for (const cell of this.line3) statusChecker(cell.detectedStatus, oldCount);
		for (const cell of newState.line1)
			statusChecker(cell.detectedStatus, newCount);
		for (const cell of newState.line2)
			statusChecker(cell.detectedStatus, newCount);
		for (const cell of newState.line3)
			statusChecker(cell.detectedStatus, newCount);

		const totalOld = oldCount.successes + oldCount.failures;
		const totalNew = newCount.successes + newCount.failures;
		const totaldiff = totalNew - totalOld;

		if (totaldiff === 0) return this.percentage; // No change in total, return old percentage

		if (totaldiff === 1 && newCount.successes > oldCount.successes) {
			return Math.max(this.percentage - 10, 25);
		}

		if (totaldiff === 1 && newCount.failures > oldCount.failures) {
			return Math.min(this.percentage + 10, 75);
		}

		console.debug(
			`PredictPercentage: Unexpected totaldiff: ${totaldiff}, oldCount: ${JSON.stringify(oldCount)}, newCount: ${JSON.stringify(newCount)}`
		);
		return null;
	}

	get lines() {
		return [this.line1, this.line2, this.line3];
	}

	isStateValid(): boolean {
		const hasUnknown = this.lines.some((line) =>
			line.some((cell) => cell.detectedStatus === "unknown")
		);
		if (hasUnknown) return false;

		for (const line of this.lines) {
			const pendingIndex = line.findIndex(
				(cell) => cell.detectedStatus === "pending"
			);
			if (pendingIndex !== -1) {
				const hasStatusAfterPending = line
					.slice(pendingIndex + 1)
					.some(
						(cell) =>
							cell.detectedStatus === "success" ||
							cell.detectedStatus === "failure"
					);
				if (hasStatusAfterPending) return false;
			}
		}

		return true;
	}
}
