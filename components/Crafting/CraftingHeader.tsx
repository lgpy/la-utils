"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCraftingStore } from "@/providers/CraftStoreProvider";
import type { CraftingParents, CraftingStore } from "@/stores/crafting";

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

function CraftingOptions({
	store,
	parent,
}: {
	store: CraftingStore;
	parent: CraftingParents;
}) {
	const options = store[parent];
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
						store.changeKey(parent, "costReduction", Number(e.target.value))
					}
				/>
				<Label className="text-end justify-end">Great Success Chance</Label>
				<Input
					type="number"
					min={0}
					className="text-center no-spinner"
					value={options.greatSuccessChance}
					onChange={(e) =>
						store.changeKey(
							parent,
							"greatSuccessChance",
							Number(e.target.value),
						)
					}
				/>
			</CardContent>
		</Card>
	);
}

export default function CraftingHeader() {
	const { store, hasHydrated } = useCraftingStore((store) => store);

	if (!hasHydrated) {
		return null;
	}

	return (
		<div className="flex flex-col md:flex-row gap-3 items-center justify-center">
			<CraftingOptions store={store} parent="general" />
			<CraftingOptions store={store} parent="special" />
		</div>
	);
}
