import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

const zodCrafting = z.object({
	general: z.object({
		costReduction: z.number(),
		greatSuccessChance: z.number(),
		timeReduction: z.number(),
		energyReduction: z.number(),
	}),
	special: z.object({
		costReduction: z.number(),
		greatSuccessChance: z.number(),
		timeReduction: z.number(),
		energyReduction: z.number(),
	}),
	battleItem: z.object({
		costReduction: z.number(),
		greatSuccessChance: z.number(),
		timeReduction: z.number(),
		energyReduction: z.number(),
	}),
});
export type CraftingState = z.infer<typeof zodCrafting>;
export type CraftingParents = keyof CraftingState;
export type CraftingKeys = keyof CraftingState[CraftingParents];

export type CraftingActions = {
	changeKey: (
		parent: CraftingParents,
		key: CraftingKeys,
		value: number,
	) => void;
};

export type CraftingStore = CraftingState & CraftingActions;

export const createCraftingStore = () =>
	createStore<CraftingStore>()(
		persist(
			(set) => ({
				general: {
					costReduction: 0,
					greatSuccessChance: 0,
					timeReduction: 0,
					energyReduction: 0,
				},
				special: {
					costReduction: 0,
					greatSuccessChance: 0,
					timeReduction: 0,
					energyReduction: 0,
				},
				battleItem: {
					costReduction: 0,
					greatSuccessChance: 0,
					timeReduction: 0,
					energyReduction: 0,
				},
				changeKey(parent, key, value) {
					set((state) => {
						state[parent][key] = value;
						return {
							...state,
						};
					});
				},
			}),
			{
				name: "crafting",
			},
		),
	);

export type SetType = (
	partial:
		| CraftingStore
		| Partial<CraftingStore>
		| ((state: CraftingStore) => CraftingStore | Partial<CraftingStore>),
	replace?: boolean | undefined,
) => void;
