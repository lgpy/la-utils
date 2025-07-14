import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

const ITEM_IDS = {
	BLUE_CRYSTAL: "blue-crystal",
	OREHA_FUSION_MATERIAL: "oreha-fusion-material",
	SUPERIOR_OREHA_FUSION_MATERIAL: "superior-oreha-fusion-material",
	PRIME_OREHA_FUSION_MATERIAL: "prime-oreha-fusion-material",
	ABIDOS_FUSION_MATERIAL: "abidos-fusion-material",
	MARVELOUS_HONOR_LEAPSTONE: "marvelous-honor-leapstone",
	RADIANT_HONOR_LEAPSTONE: "radiant-honor-leapstone",
	HONOR_SHARD_POUCH_S: "honor-shard-pouch-s",
	HONOR_SHARD_POUCH_M: "honor-shard-pouch-m",
	HONOR_SHARD_POUCH_L: "honor-shard-pouch-l",
	DESTINY_SHARD_POUCH_S: "destiny-shard-pouch-s",
	DESTINY_SHARD_POUCH_M: "destiny-shard-pouch-m",
	SOLAR_GRACE: "solar-grace",
	SOLAR_BLESSING: "solar-blessing",
	SOLAR_PROTECTION: "solar-protection",
	GLACIERS_BREATH: "glaciers-breath",
	LAVAS_BREATH: "lavas-breath",
	FISH: "fish",
	REDFLESH_FISH: "redflesh-fish",
	OREHA_SOLAR_CARP: "oreha-solar-carp",
	ABIDOS_SOLAR_CARP: "abidos-solar-carp",
	ANCIENT_RELIC: "ancient-relic",
	RARE_RELIC: "rare-relic",
	OREHA_RELIC: "oreha-relic",
	ABIDOS_RELIC: "abidos-relic",
	TIMBER: "timber",
	TENDER_TIMBER: "tender-timber",
	STURDY_TIMBER: "sturdy-timber",
	ABIDOS_TIMBER: "abidos-timber",
	WILD_FLOWER: "wild-flower",
	SHY_WILD_FLOWER: "shy-wild-flower",
	BRIGHT_WILD_FLOWER: "bright-wild-flower",
	ABIDOS_WILD_FLOWER: "abidos-wild-flower",
	IRON_ORE: "iron-ore",
	HEAVY_IRON_ORE: "heavy-iron-ore",
	STRONG_IRON_ORE: "strong-iron-ore",
	ABIDOS_IRON_ORE: "abidos-iron-ore",
	THICK_RAW_MEAT: "thick-raw-meat",
	TREATED_MEAT: "treated-meat",
	OREHA_THICK_MEAT: "oreha-thick-meat",
	ABIDOS_THICK_RAW_MEAT: "abidos-thick-raw-meat",
};

type ItemID = typeof ITEM_IDS[keyof typeof ITEM_IDS];


type ItemType = {
	type: "store" | "honing" | "honing-t4" | "tradeskills",
	subtype?: "fishing" | "excavating" | "logging" | "foraging" | "mining" | "hunting",
	id: ItemID,
	name: string,
	rarity?: "common" | "uncommon" | "rare" | "epic",
	marketQty: number,
	mari?: {
		qty: number,
		bc: number,
	},
	exchange?: {
		id: ItemID,
		rate: number,
	}[]
}

export const items: ItemType[] = [
	{
		type: "store",
		id: "blue-crystal",
		name: "Blue Crystals",
		marketQty: 95,
	},
	{
		type: "honing",
		id: "oreha-fusion-material",
		name: "Oreha Fusion Material",
		rarity: "rare",
		marketQty: 1,
	},
	{
		type: "honing",
		id: "superior-oreha-fusion-material",
		name: "Superior Oreha Fusion Material",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 100,
			bc: 40,
		},
	},
	{
		type: "honing",
		id: "prime-oreha-fusion-material",
		name: "Prime Oreha Fusion Material",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 100,
			bc: 80,
		},
	},
	{
		type: "honing-t4",
		id: "abidos-fusion-material",
		name: "Abidos Fusion Material",
		rarity: "rare",
		marketQty: 1,
		mari: {
			qty: 50,
			bc: 65,
		},
	},
	{
		type: "honing",
		id: "marvelous-honor-leapstone",
		name: "Marvelous Honor Leapstone",
		rarity: "rare",
		marketQty: 1,
	},
	{
		type: "honing",
		id: "radiant-honor-leapstone",
		name: "Radiant Honor Leapstone",
		rarity: "rare",
		marketQty: 1,
		mari: {
			qty: 100,
			bc: 150,
		},
	},
	{
		type: "honing",
		id: "honor-shard-pouch-s",
		name: "Honor Shard Pouch (S)",
		rarity: "uncommon",
		marketQty: 1,
	},
	{
		type: "honing",
		id: "honor-shard-pouch-m",
		name: "Honor Shard Pouch (M)",
		rarity: "rare",
		marketQty: 1,
	},
	{
		type: "honing",
		id: "honor-shard-pouch-l",
		name: "Honor Shard Pouch (L)",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 20,
			bc: 154,
		},
	},
	{
		type: "honing-t4",
		id: "destiny-shard-pouch-s",
		name: "Destiny Shard Pouch (S)",
		rarity: "uncommon",
		marketQty: 1,
	},
	{
		type: "honing-t4",
		id: "destiny-shard-pouch-m",
		name: "Destiny Shard Pouch (M)",
		rarity: "rare",
		marketQty: 1,
	},
	{
		type: "honing",
		id: "solar-grace",
		name: "Solar Grace",
		rarity: "uncommon",
		marketQty: 1,
		mari: {
			qty: 120,
			bc: 40,
		},
	},
	{
		type: "honing",
		id: "solar-blessing",
		name: "Solar Blessing",
		rarity: "rare",
		marketQty: 1,
		mari: {
			qty: 80,
			bc: 60,
		},
	},
	{
		type: "honing",
		id: "solar-protection",
		name: "Solar Protection",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 100,
			bc: 90,
		},
	},
	{
		type: "honing-t4",
		id: "glaciers-breath",
		name: "Glacier's Breath",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 20,
			bc: 96,
		},
	},
	{
		type: "honing-t4",
		id: "lavas-breath",
		name: "Lava's Breath",
		rarity: "epic",
		marketQty: 1,
		mari: {
			qty: 10,
			bc: 150,
		},
	},
	{
		type: "tradeskills",
		subtype: "fishing",
		id: "fish",
		name: "Fish",
		rarity: "common",
		marketQty: 100,
		exchange: [],
	},
	{
		type: "tradeskills",
		subtype: "fishing",
		id: "redflesh-fish",
		name: "Redflesh Fish",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "fish",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "fishing",
		id: "oreha-solar-carp",
		name: "Oreha Solar Carp",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "fish",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "fishing",
		id: "abidos-solar-carp",
		name: "Abidos Solar Carp",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "fish",
				rate: 12.5,
			},
			{
				id: "redflesh-fish",
				rate: 6.25,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "excavating",
		id: "ancient-relic",
		name: "Ancient Relic",
		rarity: "common",
		marketQty: 100,
		exchange: [],
	},
	{
		type: "tradeskills",
		subtype: "excavating",
		id: "rare-relic",
		name: "Rare Relic",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "ancient-relic",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "excavating",
		id: "oreha-relic",
		name: "Oreha Relic",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "ancient-relic",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "excavating",
		id: "abidos-relic",
		name: "Abidos Relic",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "ancient-relic",
				rate: 12.5,
			},
			{
				id: "rare-relic",
				rate: 6.25,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "logging",
		id: "timber",
		name: "Timber",
		rarity: "common",
		marketQty: 100,
		exchange: [
			{
				id: "tender-timber",
				rate: 0.5,
			},
			{
				id: "sturdy-timber",
				rate: 0.2,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "logging",
		id: "tender-timber",
		name: "Tender Timber",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "timber",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "logging",
		id: "sturdy-timber",
		name: "Sturdy Timber",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "timber",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "logging",
		id: "abidos-timber",
		name: "Abidos Timber",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "timber",
				rate: 12.5,
			},
			{
				id: "tender-timber",
				rate: 6.25,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "foraging",
		id: "wild-flower",
		name: "Wild Flower",
		rarity: "common",
		marketQty: 100,
		exchange: [],
	},
	{
		type: "tradeskills",
		subtype: "foraging",
		id: "shy-wild-flower",
		name: "Shy Wild Flower",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "wild-flower",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "foraging",
		id: "bright-wild-flower",
		name: "Bright Wild Flower",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "wild-flower",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "foraging",
		id: "abidos-wild-flower",
		name: "Abidos Wild Flower",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "wild-flower",
				rate: 12.5,
			},
			{
				id: "shy-wild-flower",
				rate: 6.25,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "mining",
		id: "iron-ore",
		name: "Iron Ore",
		rarity: "common",
		marketQty: 100,
		exchange: [
			{
				id: "heavy-iron-ore",
				rate: 0.5,
			},
			{
				id: "strong-iron-ore",
				rate: 0.2,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "mining",
		id: "heavy-iron-ore",
		name: "Heavy Iron Ore",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "iron-ore",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "mining",
		id: "strong-iron-ore",
		name: "Strong Iron Ore",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "iron-ore",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "mining",
		id: "abidos-iron-ore",
		name: "Abidos Iron Ore",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "iron-ore",
				rate: 12.5,
			},
			{
				id: "heavy-iron-ore",
				rate: 6.25,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "hunting",
		id: "thick-raw-meat",
		name: "Thick Raw Meat",
		rarity: "common",
		marketQty: 100,
		exchange: [],
	},
	{
		type: "tradeskills",
		subtype: "hunting",
		id: "treated-meat",
		name: "Treated Meat",
		rarity: "uncommon",
		marketQty: 100,
		exchange: [
			{
				id: "thick-raw-meat",
				rate: 2.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "hunting",
		id: "oreha-thick-meat",
		name: "Oreha Thick Meat",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "thick-raw-meat",
				rate: 12.5,
			},
		],
	},
	{
		type: "tradeskills",
		subtype: "hunting",
		id: "abidos-thick-raw-meat",
		name: "Abidos Thick Raw Meat",
		rarity: "rare",
		marketQty: 100,
		exchange: [
			{
				id: "thick-raw-meat",
				rate: 12.5,
			},
			{
				id: "treated-meat",
				rate: 6.25,
			},
		],
	},
];

const zodPrices = z.object({
	prices: z.array(
		z.object({
			id: z.string(),
			price: z.number().nonnegative(),
			updatedOn: z.string(),
		}),
	),
	lastFetch: z.string().optional(),
});

export type PricesState = z.infer<typeof zodPrices>;

export type PricesActions = {
	changePrice: (itemId: string, price: number, updatedOn?: Date) => void;
	setLastFetch: (date: Date) => void;
};

export type PricesStore = PricesState & PricesActions;

export const createPriceStore = () =>
	createStore<PricesStore>()(
		persist(
			(set) => ({
				prices: [],
				changePrice(itemId, price, updatedOn) {
					set((state) => {
						const item = state.prices.find((i) => i.id === itemId);
						if (!item)
							return {
								...state,
								prices: [
									...state.prices,
									{
										id: itemId,
										price,
										updatedOn: updatedOn?.toISOString() || new Date().toISOString(),
									},
								],
							};
						// if updatedOn is older than the updatedOn of the item, do not update
						if (updatedOn && new Date(item.updatedOn) >= updatedOn) {
							return state;
						}
						item.price = price;
						item.updatedOn = updatedOn?.toISOString() || new Date().toISOString();
						return {
							...state,
							prices: state.prices,
						};
					});
				},
				setLastFetch(date) {
					set((state) => ({
						...state,
						lastFetch: date.toISOString(),
					}));
				},
			}),
			{
				name: "prices",
			},
		),
	);

export type SetType = (
	partial:
		| PricesStore
		| Partial<PricesStore>
		| ((state: PricesStore) => PricesStore | Partial<PricesStore>),
	replace?: boolean | undefined,
) => void;
