"use client";

import { client } from "@/lib/orpc";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { usePriceStore } from "@/stores/prices-store.provider";
import { useSettingsStore } from "@/stores/main-store/provider";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ServerName, ServerRegion } from "@/prisma/generated/enums";
import { v4 as uuidv4 } from "uuid";
import { useMemo, useState } from "react";

function ServerRegionFromServerName(serverName: ServerName): ServerRegion {
	switch (serverName) {
		// NAW servers
		case ServerName.Thaemine:
		case ServerName.Brelshaza:
			return ServerRegion.NAW;

		// NAE servers
		case ServerName.Luterra:
		case ServerName.Balthorr:
		case ServerName.Nineveh:
		case ServerName.Inanna:
		case ServerName.Vairgrys:
			return ServerRegion.NAE;

		// EUC servers
		case ServerName.Ortuus:
		case ServerName.Elpon:
		case ServerName.Ratik:
		case ServerName.Arcturus:
		case ServerName.Gienah:
			return ServerRegion.EUC;

		default:
			const _exhaustiveCheck: never = serverName;
			throw new Error(`Unknown server name: ${serverName}`);
	}
}

export default function LoaBuddyPricesFetcher() {
	const priceStore = usePriceStore((state) => state);
	const settingsStore = useSettingsStore((state) => state);
	const [fetching, setFetching] = useState(false);

	const isReady = priceStore.hasHydrated && settingsStore.hasHydrated;

	const hasFetchedIn3Hours = useMemo(() => {
		if (!priceStore.hasHydrated) return false;
		const lastFetch = priceStore.state.lastFetch;
		if (!lastFetch) return false;
		const lastFetchDate = new Date(lastFetch);
		const now = new Date();
		const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
		return lastFetchDate >= threeHoursAgo;
	}, [priceStore]);

	return (
		<div className="flex flex-col items-center gap-2 bg-card p-2 rounded-base border-border border-1 min-w-[180px] mt-6">
			<Select
				disabled={!isReady}
				onValueChange={(value) => {
					settingsStore.state.setServer(value as ServerName);
				}}
				value={settingsStore.state.server}
			>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select a server" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>EUC</SelectLabel>
						<SelectItem value={ServerName.Ortuus}>Ortuus</SelectItem>
						<SelectItem value={ServerName.Elpon}>Elpon</SelectItem>
						<SelectItem value={ServerName.Ratik}>Ratik</SelectItem>
						<SelectItem value={ServerName.Arcturus}>Arcturus</SelectItem>
						<SelectItem value={ServerName.Gienah}>Gienah</SelectItem>
						<SelectLabel>NAE</SelectLabel>
						<SelectItem value={ServerName.Luterra}>Luterra</SelectItem>
						<SelectItem value={ServerName.Balthorr}>Balthorr</SelectItem>
						<SelectItem value={ServerName.Nineveh}>Nineveh</SelectItem>
						<SelectItem value={ServerName.Inanna}>Inanna</SelectItem>
						<SelectItem value={ServerName.Vairgrys}>Vairgrys</SelectItem>
						<SelectLabel>NAW</SelectLabel>
						<SelectItem value={ServerName.Thaemine}>Thaemine</SelectItem>
						<SelectItem value={ServerName.Brelshaza}>Brelshaza</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<Button
				disabled={!isReady || fetching || hasFetchedIn3Hours}
				onClick={async () => {
					if (settingsStore.state.server === undefined) {
						toast.error("Please select a server first.");
						return;
					}
					setFetching(true);
					const uuid = uuidv4();
					toast.loading("Fetching LoaBuddy prices...", {
						id: `loaBuddyPrices-${uuid}`,
						description: "This may take a few seconds",
					});
					try {
						const prices = await client.market.getMarketPrices({
							server: ServerRegionFromServerName(settingsStore.state.server),
						});

						priceStore.state.changePrices(
							prices.map((p) => ({
								itemId: p.itemId,
								price: p.price,
								updatedOn: p.updatedAt,
							}))
						);
						priceStore.state.setLastFetch(new Date());
						toast.success("Fetched prices successfully", {
							id: `loaBuddyPrices-${uuid}`,
							description: "Prices updated.",
						});
					} catch (error) {
						toast.error("Failed to fetch prices", {
							id: `loaBuddyPrices-${uuid}`,
							description:
								error instanceof Error ? error.message : "Unknown error",
						});
					} finally {
						setFetching(false);
					}
				}}
				className="w-full"
			>
				{fetching
					? "Fetching..."
					: hasFetchedIn3Hours
						? "Up to Date"
						: "Fetch Prices"}
			</Button>
			<p className="text-xs text-muted-foreground text-center">
				Price API by LOA Buddy
			</p>
		</div>
	);
}
