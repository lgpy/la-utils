import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const items = [
  {
    id: "blue-crystal",
    name: "Blue Crystals",
  },
  {
    id: "prime-oreha-fusion-material",
    name: "Prime Oreha Fusion Material",
    mari: {
      qty: 50,
      bc: 45,
      marketQty: 1,
    },
  },
  {
    id: "superior-oreha-fusion-material",
    name: "Superior Oreha Fusion Material",
    mari: {
      qty: 30,
      bc: 45,
      marketQty: 1,
    },
  },
  {
    id: "radiant-honor-leapstone",
    name: "Radiant Honor Leapstone",
    mari: {
      qty: 40,
      bc: 120,
      marketQty: 1,
    },
  },
  {
    id: "marvelous-honor-leapstone",
    name: "Marvelous Honor Leapstone",
    mari: {
      qty: 50,
      bc: 32,
      marketQty: 1,
    },
  },
  {
    id: "honor-shard-pouch-l",
    name: "Honor Shard Pouch (L)",
    mari: {
      qty: 25,
      bc: 375,
      marketQty: 1,
    },
  },
  {
    id: "honor-shard-pouch-m",
    name: "Honor Shard Pouch (M)",
    mari: {
      qty: 30,
      bc: 300,
      marketQty: 1,
    },
  },
  {
    id: "honor-shard-pouch-s",
    name: "Honor Shard Pouch (S)",
    mari: {
      qty: 30,
      bc: 150,
      marketQty: 1,
    },
  },
  {
    id: "solar-protection",
    name: "Solar Protection",
    mari: {
      qty: 30,
      bc: 300,
      marketQty: 1,
    },
  },
  {
    id: "solar-blessing",
    name: "Solar Blessing",
    mari: {
      qty: 50,
      bc: 250,
      marketQty: 1,
    },
  },
  {
    id: "solar-grace",
    name: "Solar Grace",
    mari: {
      qty: 60,
      bc: 120,
      marketQty: 1,
    },
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
