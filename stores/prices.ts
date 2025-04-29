import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const items = [
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
    exchange: [
      {
        id: "redflesh-fish",
        rate: 0.5,
      },
      {
        id: "oreha-solar-carp",
        rate: 0.2,
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
  },
  {
    type: "tradeskills",
    subtype: "excavating",
    id: "ancient-relic",
    name: "Ancient Relic",
    rarity: "common",
    marketQty: 100,
    exchange: [
      {
        id: "rare-relic",
        rate: 0.5,
      },
      {
        id: "oreha-relic",
        rate: 0.2,
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
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
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
  },
  {
    type: "tradeskills",
    subtype: "foraging",
    id: "wild-flower",
    name: "Wild Flower",
    rarity: "common",
    marketQty: 100,
    exchange: [
      {
        id: "shy-wild-flower",
        rate: 0.5,
      },
      {
        id: "bright-wild-flower",
        rate: 0.2,
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
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
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
  },
  {
    type: "tradeskills",
    subtype: "hunting",
    id: "thick-raw-meat",
    name: "Thick Raw Meat",
    rarity: "common",
    marketQty: 100,
    exchange: [
      {
        id: "treated-meat",
        rate: 0.5,
      },
      {
        id: "oreha-thick-meat",
        rate: 0.2,
      }
    ]
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
      }
    ]
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
      }
    ]
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
    ]
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
