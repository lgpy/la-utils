import * as v from 'valibot';
import craftingItemsJson from "./craftingItems.json";
import itemsJson from "./items.json";
import raidsJson from "./raids.json";
import { Difficulty } from "@/prisma/generated/enums";

const itemIds = Object.keys(itemsJson) as [string, ...string[]];

const itemID = v.picklist(itemIds);

const itemRarities = v.picklist(["common", "uncommon", "rare", "epic"]);
const craftingItemTypes = v.picklist(["general", "special", "battleItem"]);

const itemType = v.picklist(["store", "honing", "honing-t4", "tradeskills"]);
const itemSubtype = v.picklist([
	"fishing",
	"excavating",
	"logging",
	"foraging",
	"mining",
	"hunting",
]);

const itemSchema = v.object({
	type: itemType,
	subtype: v.optional(itemSubtype),
	name: v.string(),
	rarity: v.optional(itemRarities),
	marketQty: v.number(),
	mari: v.optional(v
		.object({
			qty: v.number(),
			bc: v.number(),
		})),
	exchange: v.optional(v.array(v.object({
		id: itemID,
		rate: v.number(),
	})))
});

const itemsSchema = v.record(itemID, itemSchema);

const itemsMap = new Map<string, v.InferOutput<typeof itemSchema>>(
	Object.entries(v.parse(itemsSchema, itemsJson))
);

const craftingItemSchema = v.object({
	name: v.string(),
	rarity: itemRarities,
	type: craftingItemTypes,
	craftCost: v.number(),
	craftTime: v.number(),
	craftEnergy: v.number(),
	returns: v.number(),
	recipes: v.array(v.record(itemID, v.number())),
});

const craftingItemsSchema = v.record(itemID, craftingItemSchema);

const craftingItemsMap = new Map<string, v.InferOutput<typeof craftingItemSchema>>(
	Object.entries(v.parse(craftingItemsSchema, craftingItemsJson))
);

const gateDiffSchema = v.object({
	itemlevel: v.number(),
	rewards: v.object({
		gold: v.object({
			bound: v.number(),
			unbound: v.number(),
		}),
	}),
});

const gateSchema = v.object({
	bossName: v.array(v.string()),
	difficulties: v.record(v.enum(Difficulty), gateDiffSchema),
	isBiWeekly: v.optional(v.picklist(["odd", "even"])),
});

const raidSchema = v.object({
	name: v.string(),
	hidden: v.optional(v.boolean()),
	gates: v.record(v.string(), gateSchema),
});

export const raidsSchema = v.record(v.string(), raidSchema);

class GateDifficulty {
	readonly difficulty: Difficulty;
	readonly itemlevel: number;
	readonly rewards: {
		gold: {
			bound: number;
			unbound: number;
		};
	};

	constructor(difficulty: Difficulty, data: v.InferOutput<typeof gateDiffSchema>) {
		this.difficulty = difficulty;
		this.itemlevel = data.itemlevel;
		this.rewards = data.rewards;
	}
}

class Gate {
	readonly id: string;
	readonly bossName: string[];
	readonly difficulties: ReadonlyMap<Difficulty, GateDifficulty>;
	readonly isBiWeekly?: "odd" | "even";

	constructor(id: string, data: v.InferOutput<typeof gateSchema>) {
		this.id = id;
		this.bossName = data.bossName;
		this.difficulties = new Map(
			Object.entries(data.difficulties).map(([difficulty, diffData]) => [
				Difficulty[difficulty as keyof typeof Difficulty],
				new GateDifficulty(
					Difficulty[difficulty as keyof typeof Difficulty],
					diffData
				),
			])
		);
		this.isBiWeekly = data.isBiWeekly;
	}

	getDifficulty(difficulty: Difficulty): GateDifficulty | undefined {
		return this.difficulties.get(difficulty);
	}

	getDifficultyOrThrow(difficulty: Difficulty): GateDifficulty {
		const diff = this.difficulties.get(difficulty);
		if (diff === undefined)
			throw new Error(`Difficulty ${difficulty} not found in gate ${this.id}`);
		return diff;
	}
}

export class Raid {
	readonly id: string;
	readonly name: string;
	readonly gates: ReadonlyMap<string, Gate>;
	readonly hidden: boolean;

	constructor(id: string, data: v.InferOutput<typeof raidSchema>) {
		this.id = id;
		this.name = data.name;
		this.gates = new Map(
			Object.entries(data.gates).map(([gateId, gateData]) => [
				gateId,
				new Gate(gateId, gateData),
			])
		);
		this.hidden = data.hidden ?? false;
	}

	getGate(gateId: string): Gate | undefined {
		return this.gates.get(gateId);
	}

	getGateOrThrow(gateId: string): Gate {
		const gate = this.gates.get(gateId);
		if (gate === undefined)
			throw new Error(`Gate ${gateId} not found in raid ${this.id}`);
		return gate;
	}
}

class Raids {
	readonly raids: ReadonlyMap<string, Raid>;

	constructor(data: v.InferOutput<typeof raidsSchema>) {
		this.raids = new Map(
			Object.entries(data).map(([id, data]) => [id, new Raid(id, data)])
		);
	}

	get(raidId: string): Raid | undefined {
		return this.raids.get(raidId);
	}

	getOrThrow(raidId: string): Raid {
		const raid = this.raids.get(raidId);
		if (raid === undefined) throw new Error(`Raid ${raidId} not found`);
		return raid;
	}


	sortByRelease(aId: string, bId: string): number {
		const raidKeys = Array.from(this.raids.keys());
		return raidKeys.indexOf(aId) - raidKeys.indexOf(bId);
	}
}

export type ItemId = v.InferOutput<typeof itemID>; // FIXME this is a string...

export type CraftingItem = v.InferOutput<typeof craftingItemSchema>;
export const craftingData = craftingItemsMap as ReadonlyMap<
	string,
	CraftingItem
>;

export type Item = v.InferOutput<typeof itemSchema>;
export const itemData = itemsMap as ReadonlyMap<string, Item>;

export const raidData = new Raids(v.parse(raidsSchema, raidsJson));
