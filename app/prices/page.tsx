import LoaBuddyPricesFetcher from "@/components/LoaBuddyPricesFetcher";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Item, itemData } from "@/lib/game-info";
import { getRarityClasses } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { PriceStoreProvider } from "@/stores/prices-store.provider";
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import Image from "next/image";
import TruncatedTooltip from "@/components/TruncatedTooltip";
import { Label } from "@/components/ui/label";
import { ExchangeSection, MariShopSection, PriceCardPriceInput } from "@/components/PriceCard/PriceCard";

export const metadata: Metadata = {
	title: "Prices | Lost Ark Utils",
	description: "",
};


type PriceCardProps = {
	item: Item;
	itemId: string;
};

function PriceCard({
	item,
	itemId
}: PriceCardProps) {
	const rarityClasses = getRarityClasses(item.rarity);

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
						src={`/assets/${itemId}.webp`}
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
					<Label htmlFor={`p-${itemId}`}>
						Market Value
						{item.marketQty && (
							<span className="text-muted-foreground text-xs">
								{" "}
								(x{item.marketQty})
							</span>
						)}
					</Label>
					<PriceCardPriceInput itemId={itemId} />
				</div>

				{/* Comparison sections */}

				{item.mari && (
					<MariShopSection
						itemId={itemId}
						mari={item.mari}
						marketQty={item.marketQty}
					/>
				)}
				{item.exchange && (
					<ExchangeSection item={item} itemId={itemId} exchange={item.exchange} />
				)}
			</CardContent>
		</Card>
	);
}

function NavigationAnchor({
	type,
	children,
	className,
	subtype,
}: {
	children: string;
	type: Item["type"];
	className?: string;
	subtype?: Item["subtype"];
}) {
	return (
		<Link
			href={`#${subtype || type}`}
			className={cn(
				"text-lg text-muted-foreground hover:text-foreground",
				{ "text-md": subtype !== undefined },
				className,
			)}
		>
			<span>{children}</span>
		</Link>
	);
}

function PricesType({
	type,
	subtype,
	children,
	className,
}: {
	type: string;
	subtype?: string;
	children: string;
	className?: {
		title: string;
		container: string;
	};
}) {
	const filteredItems = Array.from(itemData.entries()).filter(([, item]) => item.type === type)
		.filter(([, item]) => item.subtype === subtype);

	return (
		<div>
			<div
				className="block relative top-[-70px] invisible"
				id={subtype || type}
			/>
			<h1
				className={cn(
					"text-2xl font-bold text-center md:text-start",
					{
						"text-xl": subtype !== undefined,
					},
					className?.title,
				)}
			>
				{children}
			</h1>
			<div
				className={cn(
					"mt-6 flex flex-row flex-wrap gap-3 justify-center md:justify-start",
					className?.container,
				)}
			>
				{filteredItems
					.map(([itemId, item]) => <PriceCard
						key={itemId}
						item={item}
						itemId={itemId}
					/>)}
			</div>
		</div>
	);
}

const types: {
	type: Item["type"];
	name: string;
	subtypes?: {
		type: Item["subtype"];
		name: string;
	}[];
}[] = [
		{ type: "store", name: "Store" },
		{ type: "honing-t4", name: "Honing T4" },
		{ type: "honing", name: "Honing T3" },
		{
			type: "tradeskills",
			name: "Trade Skills",
			subtypes: [
				{ type: "foraging", name: "Foraging" },
				{ type: "logging", name: "Logging" },
				{ type: "mining", name: "Mining" },
				{ type: "hunting", name: "Hunting" },
				{ type: "fishing", name: "Fishing" },
				{ type: "excavating", name: "Excavating" },
			],
		},
	];

export default function PricesPage() {
	return (
		<PriceStoreProvider>
			<div className="flex flex-row my-6 md:mx-12 gap-6 relative">
				<div className="hidden md:block">
					<div className="flex flex-col gap-1 sticky top-[88px]">
						<h1 className="text-2xl font-bold mb-3">Navigation</h1>
						{types.map((type) => (
							<Fragment key={`na${type.type}`}>
								<NavigationAnchor type={type.type}>{type.name}</NavigationAnchor>
								{type.subtypes?.map((subtype) => (
									<NavigationAnchor
										key={`na${type.type}${subtype.type}`}
										type={type.type}
										subtype={subtype.type}
										className="ml-3"
									>
										{subtype.name}
									</NavigationAnchor>
								))}
							</Fragment>
						))}
						<LoaBuddyPricesFetcher />
					</div>
				</div>

				<div className="flex flex-col gap-6">
					{types.map((type) => {
						if (type.subtypes !== undefined)
							return (
								<div key={type.type}>
									<div
										className="block relative top-[-70px] invisible"
										id={type.type}
									/>
									<div className="flex flex-col gap-6">
										<h1 className="text-2xl font-bold text-center md:text-start">
											{type.name}
										</h1>
										{type.subtypes.map((subtype) => (
											<PricesType
												key={subtype.type}
												type={type.type}
												subtype={subtype.type}
											>
												{subtype.name}
											</PricesType>
										))}
									</div>
								</div>
							);

						return (
							<PricesType
								key={type.type}
								type={type.type}
							>
								{type.name}
							</PricesType>
						);
					})}
				</div>
			</div>
		</PriceStoreProvider>
	);
}
