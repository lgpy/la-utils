import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const craftingItems: {
	name: string;
	rarity: "rare" | "epic";
	id: string;
	type: CraftingParents;
	craftCost: number;
	craftTime: number;
	craftEnergy: number;
	returns: number;
	recipes: {
		[key: string]: number;
	}[];
}[] = [
	{
		name: "Oreha Fusion Material",
		id: "oreha-fusion-material",
		rarity: "rare",
		type: "special",
		craftCost: 205,
		craftTime: 45 * 60,
		craftEnergy: 216,
		returns: 30,
		recipes: [
			{
				"oreha-thick-meat": 10,
				"tough-leather": 40,
				"thick-raw-meat": 80,
			},
			{
				"oreha-relic": 8,
				"rare-relic": 26,
				"ancient-relic": 64,
			},
			{
				"oreha-solar-carp": 10,
				"natural-pearl": 40,
				fish: 80,
			},
		],
	},
	{
		name: "Superior Oreha Fusion Material",
		id: "superior-oreha-fusion-material",
		rarity: "epic",
		type: "special",
		craftCost: 250,
		craftTime: 60 * 60,
		craftEnergy: 288,
		returns: 20,
		recipes: [
			{
				"oreha-thick-meat": 16,
				"tough-leather": 64,
				"thick-raw-meat": 128,
			},
			{
				"oreha-relic": 16,
				"rare-relic": 29,
				"ancient-relic": 94,
			},
			{
				"oreha-solar-carp": 16,
				"natural-pearl": 64,
				fish: 128,
			},
		],
	},
	{
		name: "Prime Oreha Fusion Material",
		id: "prime-oreha-fusion-material",
		rarity: "epic",
		type: "special",
		craftCost: 300,
		craftTime: 75 * 60,
		craftEnergy: 360,
		returns: 15,
		recipes: [
			{
				"oreha-thick-meat": 52,
				"tough-leather": 69,
				"thick-raw-meat": 142,
			},
			{
				"oreha-relic": 52,
				"rare-relic": 51,
				"ancient-relic": 107,
			},
			{
				"oreha-solar-carp": 52,
				"redflesh-fish": 69,
				fish: 142,
			},
		],
	},
	{
		name: "Abidos Fusion Material",
		id: "abidos-fusion-material",
		rarity: "rare",
		type: "special",
		craftCost: 400,
		craftTime: 60 * 60,
		craftEnergy: 288,
		returns: 10,
		recipes: [
			{
				"abidos-wild-flower": 33,
				"shy-wild-flower": 45,
				"wild-flower": 86,
			},
			{
				"abidos-relic": 33,
				"rare-relic": 45,
				"ancient-relic": 86,
			},
			{
				"abidos-solar-carp": 33,
				"redflesh-fish": 45,
				fish: 86,
			},
			{
				"abidos-timber": 33,
				"tender-timber": 45,
				timber: 86,
			},
			{
				"abidos-iron-ore": 33,
				"heavy-iron-ore": 45,
				"iron-ore": 86,
			},
			{
				"abidos-thick-raw-meat": 33,
				"treated-meat": 45,
				"thick-raw-meat": 86,
			},
		],
	},
];

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
