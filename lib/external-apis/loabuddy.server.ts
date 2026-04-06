import 'server-only'

import { ServerRegion } from "@/prisma/generated/enums";
import { itemSlugs } from "./loabuddy";

const marketDataApiUrl =
	"https://marketdata-api.yrzhao1068589.workers.dev/v1/prices/latest";

export async function fetchMarketPrices(server: ServerRegion) {
	const response = await fetch(marketDataApiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			region_slug: server.toLowerCase(),
			item_slugs: itemSlugs,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch market prices: ${response.statusText}`);
	}

	const jsonData: Array<{
		item_slug: string;
		price: number;
		timestamp: number;
	}> = await response.json();

	return jsonData;
}
