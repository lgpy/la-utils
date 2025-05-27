import type { PricesStore } from "@/stores/prices";

export function is_item_price_expired(
	item: PricesStore["prices"][number] | undefined,
) {
	if (item === undefined || item.price === 0) return true;

	const lastUpdated = new Date(item.updatedOn);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
	const diffDays = diffTime / (1000 * 60 * 60 * 24);

	return diffDays > 3;
}

export const isBadPriceItem = (
	item: PricesStore["prices"][number] | undefined,
) => {
	if (item === undefined || item.price === 0) {
		return "This item has a price of 0";
	}

	const lastUpdated = new Date(item.updatedOn);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
	const diffDays = diffTime / (1000 * 60 * 60 * 24);

	if (diffDays > 3) {
		return "This item has not been updated in over 3 days";
	}

	return null;
};
