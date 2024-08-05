import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const items = [
  {
    type: "store",
    id: "blue-crystal",
    name: "Blue Crystals",
  },
  {
    type: "honing",
    id: "prime-oreha-fusion-material",
    name: "Prime Oreha Fusion Material",
    rarity: "epic",
    mari: {
      qty: 50,
      bc: 45,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "superior-oreha-fusion-material",
    name: "Superior Oreha Fusion Material",
    rarity: "epic",
    mari: {
      qty: 30,
      bc: 45,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "radiant-honor-leapstone",
    name: "Radiant Honor Leapstone",
    rarity: "rare",
    mari: {
      qty: 40,
      bc: 120,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "marvelous-honor-leapstone",
    name: "Marvelous Honor Leapstone",
    rarity: "rare",
    mari: {
      qty: 50,
      bc: 32,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "honor-shard-pouch-s",
    name: "Honor Shard Pouch (S)",
    rarity: "uncommon",
    mari: {
      qty: 30,
      bc: 150,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "honor-shard-pouch-m",
    name: "Honor Shard Pouch (M)",
    rarity: "rare",
    mari: {
      qty: 30,
      bc: 300,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "honor-shard-pouch-l",
    name: "Honor Shard Pouch (L)",
    rarity: "epic",
    mari: {
      qty: 25,
      bc: 375,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "solar-grace",
    name: "Solar Grace",
    rarity: "uncommon",
    mari: {
      qty: 60,
      bc: 120,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "solar-blessing",
    name: "Solar Blessing",
    rarity: "rare",
    mari: {
      qty: 50,
      bc: 250,
      marketQty: 1,
    },
  },
  {
    type: "honing",
    id: "solar-protection",
    name: "Solar Protection",
    rarity: "epic",
    mari: {
      qty: 30,
      bc: 300,
      marketQty: 1,
    },
  },
  {
    type: "tradeskills",
    subtype: "fishing",
    id: "fish",
    name: "Fish",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "fishing",
    id: "redflesh-fish",
    name: "Redflesh Fish",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "fishing",
    id: "natural-pearl",
    name: "Natural Pearl",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "fishing",
    id: "oreha-solar-carp",
    name: "Oreha Solar Carp",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "excavating",
    id: "ancient-relic",
    name: "Ancient Relic",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "excavating",
    id: "rare-relic",
    name: "Rare Relic",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "excavating",
    id: "oreha-relic",
    name: "Oreha Relic",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "logging",
    id: "timber",
    name: "Timber",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "logging",
    id: "tender-timber",
    name: "Tender Timber",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "logging",
    id: "sturdy-timber",
    name: "Sturdy Timber",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "wild-flower",
    name: "Wild Flower",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "shy-wild-flower",
    name: "Shy Wild Flower",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "bright-wild-flower",
    name: "Bright Wild Flower",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "crude-mushroom",
    name: "Crude Mushroom",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "fresh-mushroom",
    name: "Fresh Mushroom",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "exquisite-mushroom",
    name: "Exquisite Mushroom",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "mining",
    id: "iron-ore",
    name: "Iron Ore",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "mining",
    id: "heavy-iron-ore",
    name: "Heavy Iron Ore",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "mining",
    id: "strong-iron-ore",
    name: "Strong Iron Ore",
    rarity: "rare",
  },
  {
    type: "tradeskills",
    subtype: "hunting",
    id: "thick-raw-meat",
    name: "Thick Raw Meat",
    rarity: "common",
  },
  {
    type: "tradeskills",
    subtype: "hunting",
    id: "treated-meat",
    name: "Treated Meat",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "hunting",
    id: "tough-leather",
    name: "Tough Leather",
    rarity: "uncommon",
  },
  {
    type: "tradeskills",
    subtype: "hunting",
    id: "oreha-thick-meat",
    name: "Oreha Thick Meat",
    rarity: "rare",
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
});

export type PricesState = z.infer<typeof zodPrices>;

export type PricesActions = {
  changePrice: (itemId: string, price: number) => void;
};

export type PricesStore = PricesState & PricesActions;

export const createPriceStore = () =>
  createStore<PricesStore>()(
    persist(
      (set) => ({
        prices: [],
        changePrice(itemId: string, price: number) {
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
                    updatedOn: new Date().toISOString(),
                  },
                ],
              };
            item.price = price;
            item.updatedOn = new Date().toISOString();
            return {
              ...state,
              prices: state.prices,
            };
          });
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
