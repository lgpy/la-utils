import * as v from 'valibot';
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { zPrices_v0_state, zPrices_current_state, zPrices_v1_state, zPrices_v2_state } from "./prices-store.versions";

const zPrices_state = zPrices_current_state;

export type PricesState = v.InferOutput<typeof zPrices_state>;

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
            const parse = v.safeParse(zPrices_v0_state, persistedState);
            if (!parse.success) {
              console.error("Zod validation failed:", parse.issues);
              throw new Error("Failed to migrate state: Zod validation failed");
            }
            const data = parse.output;
            persistedState = {
              prices: new Map(
                data.prices.values().map((item) => [item.id, { price: item.price, updatedOn: item.updatedOn }])
              ),
              lastFetch: data.lastFetch,
            } satisfies v.InferOutput<typeof zPrices_v1_state>;
          }

          if (version <= 1) {
            const parse = v.safeParse(zPrices_v1_state, persistedState);
            if (!parse.success) {
              console.error("Zod validation failed:", parse.issues);
              throw new Error("Failed to migrate state: Zod validation failed");
            }
            const data = parse.output;
            persistedState = {
              prices: new Map(
                data.prices.entries().map(([itemId, item]) => [itemId, { price: item.price, updatedOn: new Date(item.updatedOn).getTime() }])
              ),
              lastFetch: data.lastFetch ? new Date(data.lastFetch).getTime() : undefined,
            } satisfies v.InferOutput<typeof zPrices_v2_state>;
          }

          const parse = v.safeParse(zPrices_state, persistedState);

          if (!parse.success) {
            console.error("Zod validation failed:", parse.issues);
            throw new Error("Failed to migrate state: Zod validation failed");
          }


          return parse.output;
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
