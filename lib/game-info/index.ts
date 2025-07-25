import z from "zod";
import craftingItemsJson from "./craftingItems.json";
import itemsJson from "./items.json";
import raidsJson from "./raids.json";
import { Difficulty } from "@/generated/prisma";

const itemIds = Object.keys(itemsJson) as [string, ...string[]];

const itemID = z.enum(itemIds);

const itemRarities = z.enum(["common", "uncommon", "rare", "epic"]);
const craftingItemTypes = z.enum(["general", "special", "battleItem"]);

const itemType = z.enum(["store", "honing", "honing-t4", "tradeskills"]);
const itemSubtype = z.enum(["fishing", "excavating", "logging", "foraging", "mining", "hunting"]);

const itemSchema = z.object({
  type: itemType,
  subtype: itemSubtype.optional(),
  name: z.string(),
  rarity: itemRarities.optional(),
  marketQty: z.number(),
  mari: z.object({
    qty: z.number(),
    bc: z.number(),
  }).optional(),
  exchange: z.object({
    id: itemID,
    rate: z.number(),
  }).array().optional(),
})

const itemsSchema = z.record(itemID, itemSchema);

const itemsMap = new Map<string, z.infer<typeof itemSchema>>(
  Object.entries(itemsSchema.parse(itemsJson))
);

const craftingItemSchema = z.object({
  name: z.string(),
  rarity: itemRarities,
  type: craftingItemTypes,
  craftCost: z.number(),
  craftTime: z.number(),
  craftEnergy: z.number(),
  returns: z.number(),
  recipes: z.array(z.record(itemID, z.number())),
})

const craftingItemsSchema = z.record(itemID, craftingItemSchema);

const craftingItemsMap = new Map<string, z.infer<typeof craftingItemSchema>>(
  Object.entries(craftingItemsSchema.parse(craftingItemsJson))
);

const gateDiffSchema = z.object({
  itemlevel: z.number(),
  rewards: z.object({
    gold: z.object({
      bound: z.number(),
      unbound: z.number(),
    }),
  }),
})

const gateSchema = z.object({
  bossName: z.array(z.string()),
  difficulties: z.record(z.nativeEnum(Difficulty), gateDiffSchema),
  isBiWeekly: z.enum(["odd", "even"]).optional(),
});

const raidSchema = z.object({
  name: z.string(),
  gates: z.record(z.string(), gateSchema),
})

export const raidsSchema = z.record(z.string(), raidSchema);

class GateDifficulty {
  readonly difficulty: Difficulty;
  readonly itemlevel: number;
  readonly rewards: {
    gold: {
      bound: number;
      unbound: number;
    };
  };

  constructor(difficulty: Difficulty, data: z.infer<typeof gateDiffSchema>) {
    this.difficulty = difficulty;
    this.itemlevel = data.itemlevel;
    this.rewards = data.rewards;
  }

  shortDifficulty(difficulty: Difficulty) {
    switch (difficulty) {
      case Difficulty.Normal:
        return "NM";
      case Difficulty.Hard:
        return "HM";
      case Difficulty.Solo:
        return "SO";
      default:
        const _: never = difficulty; // Ensure all cases are handled
    }
  };

  shortestDifficulty(difficulty: Difficulty) {
    switch (difficulty) {
      case Difficulty.Normal:
        return "N";
      case Difficulty.Hard:
        return "H";
      case Difficulty.Solo:
        return "S";
      default:
        const _: never = difficulty; // Ensure all cases are handled
    }
  }
}

class Gate {
  readonly id: string;
  readonly bossName: string[];
  readonly difficulties: ReadonlyMap<Difficulty, GateDifficulty>;
  readonly isBiWeekly?: "odd" | "even";

  constructor(id: string, data: z.infer<typeof gateSchema>) {
    this.id = id;
    this.bossName = data.bossName;
    this.difficulties = new Map(
      Object.entries(data.difficulties).map(([difficulty, diffData]) => [Difficulty[difficulty as keyof typeof Difficulty], new GateDifficulty(
        Difficulty[difficulty as keyof typeof Difficulty],
        diffData
      )])
    );
    this.isBiWeekly = data.isBiWeekly;
  }

  getDifficulty(difficulty: Difficulty): GateDifficulty | undefined {
    return this.difficulties.get(difficulty);
  }

  getDifficultyOrThrow(difficulty: Difficulty): GateDifficulty {
    const diff = this.difficulties.get(difficulty);
    if (diff === undefined) throw new Error(`Difficulty ${difficulty} not found in gate ${this.id}`);
    return diff;
  }
}

export class Raid {
  readonly id: string;
  readonly name: string;
  readonly gates: ReadonlyMap<string, Gate>;

  constructor(id: string, data: z.infer<typeof raidSchema>) {
    this.id = id;
    this.name = data.name;
    this.gates = new Map(
      Object.entries(data.gates).map(([gateId, gateData]) => [gateId, new Gate(gateId, gateData)])
    );
  }

  getGate(gateId: string): Gate | undefined {
    return this.gates.get(gateId);
  }

  getGateOrThrow(gateId: string): Gate {
    const gate = this.gates.get(gateId);
    if (gate === undefined) throw new Error(`Gate ${gateId} not found in raid ${this.id}`);
    return gate;
  }
}

class Raids {
  readonly raids: ReadonlyMap<string, Raid>;

  constructor(data: z.infer<typeof raidsSchema>) {
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
}

export type ItemId = z.infer<typeof itemID>; // FIXME this is a string...

export type CraftingItem = z.infer<typeof craftingItemSchema>;
export const craftingData = craftingItemsMap as ReadonlyMap<string, CraftingItem>;

export type Item = z.infer<typeof itemSchema>;
export const itemData = itemsMap as ReadonlyMap<string, Item>;

export const raidData = new Raids(raidsSchema.parse(raidsJson));
