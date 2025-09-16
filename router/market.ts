import { os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { getMarketPricesSchema } from "./market.schema";
import { fetchMarketPrices } from "@/lib/external-apis/loabuddy.server";

export const getMarketPrices = os
	.use(dbProviderMiddleware)
	.input(getMarketPricesSchema)
	.handler(async ({ context: { db }, input: { server } }) => {
		const prices = await db.marketPrice.findMany({
			where: { region: server },
			select: {
				itemId: true,
				price: true,
				updatedAt: true,
			},
		});

		// Check if the prices are old (older than 6 hours)
		const isOldData =
			prices.length > 0 &&
			new Date(prices[0].updatedAt).getTime() < Date.now() - 6 * 60 * 60 * 1000;

		if (prices.length === 0 || isOldData) {
			const newPrices = await fetchMarketPrices(server);

			const idk = newPrices.map((item) => ({
				itemId: item.item_slug,
				price: item.price,
				updatedAt: new Date(item.timestamp * 1000),
			}));

			for (const item of idk) {
				await db.marketPrice.upsert({
					where: { itemId_region: { itemId: item.itemId, region: server } },
					create: {
						itemId: item.itemId,
						price: item.price,
						region: server,
						updatedAt: item.updatedAt,
					},
					update: {
						price: item.price,
						updatedAt: item.updatedAt,
					},
				});
			}
			return idk;
		}

		return prices;
	});
