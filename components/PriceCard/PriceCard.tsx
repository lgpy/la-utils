"use client";

import TruncatedTooltip from "@/components/TruncatedTooltip";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { type PricesState, items } from "@/stores/prices";
import { formatDistanceToNowStrict } from "date-fns";
import Image from "next/image";
import type { ChangeEventHandler } from "react";

type Props = {
	item: (typeof items)[number];
	pSitem?: PricesState["prices"][number];
	changeValue: (value: number) => void;
	bcValue: number;
};

// Helper function to get rarity-based styling
const getRarityClasses = (rarity?: string) => ({
	header: cn("bg-linear-to-b from-card to-card", {
		"from-mauve/30 dark:from-mauve/15": rarity === "epic",
		"from-blue/30 dark:from-blue/15": rarity === "rare",
		"from-green/30 dark:from-green/15": rarity === "uncommon",
		"from-overlay1/40 dark:from-overlay1/20": rarity === "common",
	}),
	text: cn("", {
		"text-mauve": rarity === "epic",
		"text-blue": rarity === "rare",
		"text-green": rarity === "uncommon",
		"text-overlay1": rarity === "common",
	}),
});

// Simple component for displaying percentage changes
const PercentChange = ({ value }: { value: number }) => (
	<p
		className={cn("text-xs", {
			"text-destructive": value >= 0,
			"text-green": value < 0,
		})}
	>
		{value > 0 && "+"}
		{value.toFixed(1)}%
	</p>
);

// Mari Shop comparison section
const MariShopSection = ({
	item,
	bcValue,
	marketPrice,
}: { item: Props["item"]; bcValue: number; marketPrice: number }) => {
	if (!item.mari) return null;

	const blueCrystalValue = bcValue * item.mari.bc;
	const singleMarketValue = marketPrice / item.marketQty;
	const singleMariValue = blueCrystalValue / item.mari.qty;
	const profit = singleMarketValue - singleMariValue;
	const diff = -((profit / singleMarketValue) * 100);

	return (
		<div className="flex flex-col items-end justify-between">
			<Label>
				Mari Value
				<span className="text-muted-foreground text-xs">
					{" "}
					(x{item.mari.qty})
				</span>
			</Label>
			<p className="text-md mt-1.5">{singleMariValue.toFixed(2)}</p>
			<PercentChange value={diff} />
			<div className="flex items-center gap-1 text-muted-foreground">
				<p className="text-xs">{item.mari.bc}</p>
				<Image
					src="/assets/blue-crystal.webp"
					height={16}
					width={16}
					alt=""
					className="size-[16px]"
				/>
			</div>
		</div>
	);
};

// Exchange comparison section
const ExchangeSection = ({
	item,
	marketPrice,
}: { item: Props["item"]; marketPrice: number }) => {
	const { store, hasHydrated } = usePriceStore((state) => state);
	if (!item.exchange) return null;

	const singleMarketValue = marketPrice / item.marketQty;

	// Find best exchange option
	const bestExchange = item.exchange.reduce<{
		item?: (typeof items)[number];
		value: number;
		rate: number;
		diff: number;
	}>(
		(best, curr) => {
			const exchangeItem = items.find((i) => i.id === curr.id);
			const storeItem = store.prices.find((i) => i.id === curr.id);

			if (!exchangeItem || !storeItem) return best;

			const value = curr.rate * storeItem.price;
			const profit = singleMarketValue - value / item.marketQty;
			const diff = -((profit / singleMarketValue) * 100);

			return value < best.value
				? { item: exchangeItem, value, rate: curr.rate, diff }
				: best;
		},
		{ item: undefined, value: Number.POSITIVE_INFINITY, rate: 0, diff: 0 },
	);

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
					src={`/assets/${bestExchange.item.id}.webp`}
					height={32}
					width={32}
					alt=""
					className="size-[32px]"
				/>
			</div>
		</div>
	);
};

export default function PriceCard({
	changeValue,
	bcValue,
	pSitem,
	item,
}: Props) {
	const marketPrice = pSitem?.price || 0;

	const dayfnsDaysSinceUpdate = pSitem?.updatedOn
		? formatDistanceToNowStrict(pSitem.updatedOn, { addSuffix: true })
		: "Never";

	const rarityClasses = getRarityClasses(item.rarity);

	const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
		const num = Number(event.target.value);
		if (!Number.isNaN(num)) {
			changeValue(num);
		}
	};

	return (
		<Card className="w-[350px] flex flex-col justify-between gap-0 py-0 overflow-hidden">
			<CardHeader className="flex flex-row justify-between p-0">
				<div
					className={cn(
						"flex flex-row items-center gap-3 p-3 w-full",
						rarityClasses.header,
					)}
				>
					<Image
						src={`/assets/${item.id}.webp`}
						width={48}
						height={48}
						alt=""
						className="size-[48px] drop-shadow-2xl shadow-white"
					/>
					<TruncatedTooltip
						text={item.name}
						className={{
							text: cn(
								"text-xl font-semibold tracking-tight truncate",
								rarityClasses.text,
							),
							tooltip: "text-center",
						}}
					/>
				</div>
			</CardHeader>
			<CardContent className="flex flex-row justify-between p-3">
				<div className="flex flex-col gap-1.5 max-w-44">
					<Label htmlFor={`p-${item.id}`}>
						Market Value
						{item.marketQty && (
							<span className="text-muted-foreground text-xs">
								{" "}
								(x{item.marketQty})
							</span>
						)}
					</Label>
					<Input
						id={`p-${item.id}`}
						placeholder="Market Value"
						type="number"
						value={marketPrice}
						onChange={handleChange}
					/>
					<p className="text-xs text-muted-foreground">
						Updated: {dayfnsDaysSinceUpdate}
					</p>
				</div>

				{/* Comparison sections */}
				<MariShopSection
					item={item}
					bcValue={bcValue}
					marketPrice={marketPrice}
				/>
				<ExchangeSection item={item} marketPrice={marketPrice} />
			</CardContent>
		</Card>
	);
}
