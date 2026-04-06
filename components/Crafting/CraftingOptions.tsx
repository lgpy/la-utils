"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCraftingStore } from "@/stores/crafting-store.provider";
import type { CraftingParents } from "@/stores/crafting-store";

const getLabel = (parent: CraftingParents) => {
	switch (parent) {
		case "general":
			return "General";
		case "special":
			return "Special";
		case "battleItem":
			return "Battle Item";
	}
};

export default function CraftingOptions({
	parent,
}: {
	parent: CraftingParents;
}) {
	const craftingStore = useCraftingStore((store) => store);
	const options = craftingStore.state[parent];
	const label = getLabel(parent);

	return (
		<Card className="flex flex-col max-w-[300px]">
			<CardHeader>
				<CardTitle className="text-center">{label}</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4 items-center text-center grid-cols-[max-content_60px]">
				<Label className="text-end justify-end">Cost Reduction</Label>
				<Input
					type="number"
					min={0}
					className="text-center no-spinner"
					value={options.costReduction}
					onChange={(e) =>
						craftingStore.state.changeKey(
							parent,
							"costReduction",
							Number(e.target.value)
						)
					}
					disabled={!craftingStore.hasHydrated}
				/>
				<Label className="text-end justify-end">Great Success Chance</Label>
				<Input
					type="number"
					min={0}
					className="text-center no-spinner"
					value={options.greatSuccessChance}
					onChange={(e) =>
						craftingStore.state.changeKey(
							parent,
							"greatSuccessChance",
							Number(e.target.value)
						)
					}
					disabled={!craftingStore.hasHydrated}
				/>
			</CardContent>
		</Card>
	);
}
