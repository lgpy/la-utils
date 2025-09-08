import { z } from "zod";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

const zodPrices = z.object({
	prices: z.array(
		z.object({
			id: z.string(),
			price: z.number().nonnegative(),
			updatedOn: z.string(),
		})
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
										updatedOn:
											updatedOn?.toISOString() || new Date().toISOString(),
									},
								],
							};
						// if updatedOn is older than the updatedOn of the item, do not update
						if (updatedOn && new Date(item.updatedOn) >= updatedOn) {
							return state;
						}
						item.price = price;
						item.updatedOn =
							updatedOn?.toISOString() || new Date().toISOString();
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
