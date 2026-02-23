import { z } from "zod";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { zPrices_v0_state, zPrices_current_state, zPrices_v1_state } from "./prices-store.versions";

const zPrices_state = zPrices_current_state;

export type PricesState = z.infer<typeof zPrices_state>;

export type PricesActions = {
  changePrices: (changes: Array<{ itemId: string; price: number; updatedOn?: Date }>) => void;
  setLastFetch: (date: Date) => void;
};

export type PricesStore = PricesState & PricesActions;

export const createPriceStore = () =>
  createStore<PricesStore>()(
    persist(
      (set) => ({
        prices: new Map(),
        changePrices(changes) {
          set((state) => {
            const newMap = new Map(state.prices);
            let changed = false;
            for (const { itemId, price, updatedOn } of changes) {
              const item = state.prices.get(itemId);
              console.log("Changing price for itemId:", itemId, "to price:", price, "updatedOn:", updatedOn);
              const newObj = {
                price,
                updatedOn:
                  updatedOn?.getTime() || new Date().getTime()
              };

              if (item === undefined) {
                newMap.set(itemId, newObj);
                changed = true;
                continue;
              }

              // dont update is item price last update is newer than the updatedOn
              if (updatedOn && new Date(item.updatedOn) >= updatedOn) {
                continue;
              }

              newMap.set(itemId, newObj);
              changed = true;
            }

            if (!changed) return state;
            return {
              ...state,
              prices: newMap,
            };
          });
        },
        setLastFetch(date) {
          set((state) => ({
            ...state,
            lastFetch: date.getTime(),
          }));
        },
      }),
      {
        name: "prices",
        storage: createJSONStorage(() => localStorage, {
          replacer(key, value) {
            if (key === "prices" && value instanceof Map) {
              return Object.fromEntries(value.entries());
            }
            return value;
          },
          reviver(key, value) {
            if (key === "prices") {
              return new Map(Object.entries(value as any));
            }
            return value;
          },
        }),
        version: 2,
        migrate: (persistedState, version) => {
          if (version <= 0) {
            const parse = zPrices_v0_state.safeParse(persistedState);
            if (!parse.success) {
              console.error("Zod validation failed:", parse.error);
              throw new Error("Failed to migrate state: Zod validation failed");
            }
            const data = parse.data;
            persistedState = {
              prices: new Map(
                data.prices.values().map((item) => [item.id, { price: item.price, updatedOn: item.updatedOn }])
              ),
              lastFetch: data.lastFetch,
            };
          }

          if (version <= 1) {
            const parse = zPrices_v1_state.safeParse(persistedState);
            if (!parse.success) {
              console.error("Zod validation failed:", parse.error);
              throw new Error("Failed to migrate state: Zod validation failed");
            }
            const data = parse.data;
            persistedState = {
              prices: new Map(
                data.prices.entries().map(([itemId, item]) => [itemId, { price: item.price, updatedOn: new Date(item.updatedOn).getTime() }])
              ),
              lastFetch: data.lastFetch ? new Date(data.lastFetch).getTime() : undefined,
            };
          }

          const parse = zPrices_state.safeParse(persistedState);

          if (!parse.success) {
            console.error("Zod validation failed:", parse.error);
            throw new Error("Failed to migrate state: Zod validation failed");
          }


          return parse.data;
        }
      }
    )
  );

export type SetType = (
  partial:
    | PricesStore
    | Partial<PricesStore>
    | ((state: PricesStore) => PricesStore | Partial<PricesStore>),
  replace?: boolean | undefined
) => void;
