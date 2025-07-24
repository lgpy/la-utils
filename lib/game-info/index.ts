import z from "zod";
import craftingItemsJson from "./craftingItems.json";
import itemsJson from "./items.json";

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

export type ItemId = z.infer<typeof itemID>;

export type CraftingItem = z.infer<typeof craftingItemSchema>;
export const craftingItems = craftingItemsMap as ReadonlyMap<string, CraftingItem>;

export type Item = z.infer<typeof itemSchema>;
export const items = itemsMap as ReadonlyMap<string, Item>;
