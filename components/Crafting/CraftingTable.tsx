"use client";

import TruncatedTooltip from "@/components/TruncatedTooltip";
import WarningTooltipIcon from "@/components/WarningTooltipIcon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { isBadPriceItem, is_item_price_expired } from "@/lib/items";
import { cn } from "@/lib/utils";
import { useCraftingStore } from "@/providers/CraftStoreProvider";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { type CraftingParents, craftingItems } from "@/stores/crafting";
import { items } from "@/stores/prices";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

function NavigationAnchor({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	return (
		<Link
			href={`#${""}`}
			className={cn(
				"text-lg text-muted-foreground hover:text-foreground",
				className,
			)}
		>
			<span>{children}</span>
		</Link>
	);
}

const getRarityClasses = (rarity?: string) => ({
	header: cn("bg-linear-to-b from-card to-card", {
		"from-ctp-mauve/30 dark:from-ctp-mauve/15": rarity === "epic",
		"from-ctp-blue/30 dark:from-ctp-blue/15": rarity === "rare",
		"from-ctp-green/30 dark:from-ctp-green/15": rarity === "uncommon",
		"from-ctp-overlay1/40 dark:from-ctp-overlay1/20": rarity === "common",
	}),
	text: cn("", {
		"text-ctp-mauve": rarity === "epic",
		"text-ctp-blue": rarity === "rare",
		"text-ctp-green": rarity === "uncommon",
		"text-ctp-overlay1": rarity === "common",
	}),
});

function CraftingItem({ item }: { item: (typeof craftingItems)[number] }) {
	const { store: pricesStore, hasHydrated: pricesHasHydrated } = usePriceStore(
		(store) => store,
	);
	const { store, hasHydrated: craftHasHydrated } = useCraftingStore(
		(store) => store,
	);

	if (!pricesHasHydrated || !craftHasHydrated) {
		return <div>loading...</div>;
	}

	const item_price = pricesStore?.prices.find((i) => i.id === item.id);

	const recipe_items_price = Object.values(item.recipes).reduce(
		(acc, items) => {
			for (const key of Object.keys(items)) {
				if (acc[key] !== undefined) continue;
				const price = pricesStore?.prices.find((i) => i.id === key)?.price || 0;
				acc[key] = price;
			}
			return acc;
		},
		{} as Record<string, number>,
	);

	const itemMarketPrice = item_price?.price || 0;

	const type = item.type !== "general" ? store[item.type] : undefined;

	const gold_craft_cost =
		item.craftCost -
		(item.craftCost * store.general.costReduction) / 100 -
		(item.craftCost * (type?.costReduction || 0)) / 100;

	const gsChance =
		1 +
		((store.general.greatSuccessChance / 100 +
			(type?.greatSuccessChance || 0) / 100 +
			1) *
			5) /
		100;

	const sellPrice =
		Math.floor(itemMarketPrice * 0.95) * item.returns * gsChance;

	const recipes = item.recipes
		.map((recipe_items, idx) => {
			const recipe_item_cost = Object.entries(recipe_items).reduce(
				(acc, [key, amount]) => {
					const price = recipe_items_price[key];
					const storeItem = items.find((i) => i.id === key);
					const singleMarketItemCost = price / (storeItem?.marketQty || 1);
					return acc + singleMarketItemCost * amount;
				},
				0,
			);
			const isPricesBad = Object.keys(recipe_items).some((key) =>
				is_item_price_expired(pricesStore?.prices.find((i) => i.id === key)),
			);
			const craft_cost = recipe_item_cost + gold_craft_cost;
			const profit = sellPrice - craft_cost;

			return {
				recipe_item_cost,
				idx,
				craft_cost,
				profit,
				marketdiff: -((profit / sellPrice) * 100),
				isPricesBad,
			};
		})
		.sort((a, b) => a.marketdiff - b.marketdiff);

	const isItemPriceBad = isBadPriceItem(item_price);

	const rarityClasses = getRarityClasses(item.rarity);

	return (
		<Card className="w-[350px] flex flex-col justify-between h-fit gap-0 py-0 overflow-hidden">
			<CardHeader className="flex flex-row justify-between p-0">
				<div
					className={cn(
						"w-full grid grid-cols-[48px_auto_32px] items-center gap-3 p-3",
						rarityClasses.header,
					)}
				>
					<div className="relative">
						<Image
							src={`/assets/${item.id}.webp`}
							width={48}
							height={48}
							alt=""
							className="size-[48px]"
						/>
						{isItemPriceBad !== null && (
							<WarningTooltipIcon
								tooltip={isItemPriceBad}
								className="absolute -top-1 -right-1 size-5"
							/>
						)}
					</div>
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
			<CardContent
				className={cn(
					"p-3 grid grid-cols-[auto_auto_auto] gap-y-3 gap-x-3 text-center",
				)}
			>
				<p className="font-bold">Recipe</p>
				<p className="font-bold">Cost</p>
				<p className="font-bold">Profit</p>
				{recipes.map((recipe, idx) => (
					<Fragment key={idx}>
						<div className="relative size-fit mx-auto">
							<Image
								src={`/assets/${Object.keys(item.recipes[recipe.idx]).at(
									0,
								)}.webp`}
								height={48}
								width={48}
								alt=""
							/>
							{recipe.isPricesBad && (
								<WarningTooltipIcon
									tooltip="One of the recipe items price is older than 3 days"
									className="absolute -top-1 -right-1 size-5"
								/>
							)}
						</div>
						<p className="self-center">{recipe.craft_cost.toLocaleString()}</p>
						<p
							className={cn("font-semibold self-center", {
								"text-destructive": recipe.marketdiff > 0,
								"text-ctp-green": recipe.marketdiff < 0,
							})}
						>
							{recipe.marketdiff > 0 && "+"}
							{recipe.marketdiff.toFixed(2)}%
							<span className="font-normal text-xs">
								({recipe.profit > 0 && "+"}
								{recipe.profit.toLocaleString()})
							</span>
						</p>
					</Fragment>
				))}
			</CardContent>
		</Card>
	);
}

function CraftingType({
	type,
	subtype,
	children,
}: {
	type: CraftingParents;
	subtype?: string;
	children: string;
}) {
	const items = craftingItems.filter((item) => item.type === type);

	return (
		<div>
			<div
				className="block relative top-[-70px] invisible"
				id={subtype || type}
			/>
			<h1
				className={cn("text-2xl font-bold text-center md:text-start", {
					"text-xl": subtype !== undefined,
				})}
			>
				{children}
			</h1>
			<div
				className={cn(
					"mt-6 flex flex-row flex-wrap gap-3 justify-center md:justify-start",
				)}
			>
				{items.map((item) => (
					<CraftingItem key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}

export default function CraftingTable() {
	const { hasHydrated } = useCraftingStore((store) => store);

	if (!hasHydrated) {
		return null;
	}

	return (
		<div className="flex flex-row my-6 md:mx-12 gap-6">
			<div className="hidden md:block">
				<div className="flex flex-col gap-1 sticky top-[88px]">
					<h1 className="text-2xl font-bold mb-3">Navigation</h1>
					<NavigationAnchor>Special</NavigationAnchor>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				<CraftingType type="special">Special</CraftingType>
			</div>
		</div>
	);
}
