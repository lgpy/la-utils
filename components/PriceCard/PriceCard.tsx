"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Item, itemData } from "@/lib/game-info";
import { getRarityClasses } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { usePriceStore } from "@/stores/prices-store.provider";
import { formatDistanceToNowStrict } from "date-fns";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

// Simple component for displaying percentage changes
const PercentChange = ({ value }: { value: number }) => (
	<p
		className={cn("text-xs", {
			"text-destructive": value >= 0,
			"text-ctp-green": value < 0,
		})}
	>
		{value > 0 && "+"}
		{value.toFixed(1)}%
	</p>
);

interface MariShopSectionProps {
	mari: NonNullable<Item["mari"]>;
	marketQty: number;
	itemId: string;
}

// Mari Shop comparison section
export const MariShopSection = ({
	mari,
	marketQty,
	itemId,
}: MariShopSectionProps) => {
	const priceStore = usePriceStore();

	const marketPrice = useMemo(() => {
		if (!priceStore.hasHydrated)
			return 0;
		const item = priceStore.store.prices.find((i) => i.id === itemId);
		return item?.price || 0;
	}, [priceStore, itemId]);

	const blueCrystalValue = priceStore.single_bc_price * mari.bc;
	const singleMarketValue = marketPrice / marketQty;
	const singleMariValue = blueCrystalValue / mari.qty;
	const profit = singleMarketValue - singleMariValue;
	const diff = -((profit / singleMarketValue) * 100);

	return (
		<div className="flex flex-col items-end justify-between">
			<Label>
				Mari Value
				<span className="text-muted-foreground text-xs">
					{" "}
					(x{mari.qty})
				</span>
			</Label>
			{priceStore.hasHydrated && (
				<div className="flex flex-col items-end">
					<p className="text-md">{singleMariValue.toFixed(2)}</p>
					<PercentChange value={diff} />
				</div>
			)}
			< div className="flex items-center gap-1 text-muted-foreground">
				<p className="text-xs">{mari.bc}</p>
				<Image
					src="/assets/blue-crystal.webp"
					height={16}
					width={16}
					alt=""
					className="size-[16px]"
				/>
			</div>
		</div >
	);
};

interface ExchangeSectionProps {
	item: Item
	itemId: string;
	exchange: NonNullable<Item["exchange"]>;
}

// Exchange comparison section
export const ExchangeSection = ({
	item,
	itemId,
	exchange
}: ExchangeSectionProps) => {
	const priceStore = usePriceStore();

	const marketPrice = useMemo(() => {
		if (!priceStore.hasHydrated)
			return 0;
		const item = priceStore.store.prices.find((i) => i.id === itemId);
		return item?.price || 0;
	}, [priceStore, itemId]);

	const singleMarketValue = marketPrice / item.marketQty;

	// Find best exchange option
	const bestExchange = exchange.reduce<{
		item?: Item;
		value: number;
		rate: number;
		diff: number;
		id?: string;
	}>(
		(best, curr) => {
			const exchangeItem = itemData.get(curr.id);
			const storeItem = priceStore.store.prices.find((i) => i.id === curr.id);

			if (!exchangeItem || !storeItem) return best;

			const value = curr.rate * storeItem.price;
			const profit = singleMarketValue - value / item.marketQty;
			const diff = -((profit / singleMarketValue) * 100);

			return value < best.value
				? { item: exchangeItem, value, rate: curr.rate, diff, id: curr.id }
				: best;
		},
		{ item: undefined, value: Number.POSITIVE_INFINITY, rate: 0, diff: 0, id: undefined },
	);

	if (!priceStore.hasHydrated) return <div className="flex items-end h-full">
		<Loader2Icon className="animate-spin" />
	</div>;

	if (!bestExchange.item) return null;

	const rarityClasses = getRarityClasses(bestExchange.item.rarity);

	return (
		<div className="flex flex-col items-end justify-between">
			<Label>
				Exchange
				<span className="text-muted-foreground text-xs">
					{" "}
					(x{bestExchange.rate * 100})
				</span>
			</Label>
			<p
				className={cn(
					"text-xs text-muted-foreground mt-1.5",
					rarityClasses.text,
				)}
			>
				{bestExchange.item.name}
			</p>
			<div className="flex flex-row gap-3 items-center text-end">
				<div>
					<p className="text-md">{bestExchange.value.toFixed(2)}</p>
					<PercentChange value={bestExchange.diff} />
				</div>
				<Image
					src={`/assets/${bestExchange.id}.webp`}
					height={32}
					width={32}
					alt=""
					className="size-[32px]"
				/>
			</div>
		</div>
	);
};

export function PriceCardPriceInput({ itemId }: { itemId: string }) {
	const priceStore = usePriceStore();

	const {
		marketPrice,
		timeSinceUpdate,
	} = useMemo(() => {
		if (!priceStore.hasHydrated) {
			return { marketPrice: 0, timeSinceUpdate: "Never" };
		}

		const item = priceStore.store.prices.find((i) => i.id === itemId);
		const timeSinceUpdate = item?.updatedOn
			? formatDistanceToNowStrict(item.updatedOn, { addSuffix: true })
			: "Never";
		return {
			marketPrice: item?.price || 0,
			timeSinceUpdate
		}
	}, [priceStore, itemId]);

	return (<>
		<Input
			id={`p-${itemId}`}
			type="number"
			disabled={!priceStore.hasHydrated}
			value={priceStore.hasHydrated ? marketPrice : ""}
			onChange={(event) => {
				const num = Number(event.target.value);
				if (!Number.isNaN(num)) {
					priceStore.store.changePrice(itemId, num);
				}
			}}
		/>
		<p className="text-xs text-muted-foreground">
			Updated: {priceStore.hasHydrated ? timeSinceUpdate : ""}
		</p>
	</>)
}
