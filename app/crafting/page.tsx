import CraftingOptions from "@/components/Crafting/CraftingOptions";
import CraftingItemCard from "@/components/Crafting/CraftingItemCard";
import { craftingData } from "@/lib/game-info";
import { cn } from "@/lib/utils";
import { CraftingStoreProvider } from "@/stores/crafting-store.provider";
import { PriceStoreProvider } from "@/stores/prices-store.provider";
import { CraftingParents } from "@/stores/crafting-store";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Crafting | Lost Ark Utils",
	description: "",
};


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

function CraftingType({
	type,
	subtype,
	children,
}: {
	type: CraftingParents;
	subtype?: string;
	children: string;
}) {
	const items = Array.from(craftingData.entries()).filter(([, item]) => item.type === type);

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
				{items.map(([id, item]) => (
					<CraftingItemCard key={id} id={id} item={item} />
				))}
			</div>
		</div>
	);
}

export default function CraftingPage() {
	return (
		<CraftingStoreProvider>
			<div className="flex flex-col  my-6 mx-0 md:mx-6 gap-6">
				<div className="flex flex-col md:flex-row gap-3 items-center justify-center">
					<CraftingOptions parent="general" />
					<CraftingOptions parent="special" />
				</div>
				<div className="flex flex-row my-6 md:mx-12 gap-6">
					<div className="hidden md:block">
						<div className="flex flex-col gap-1 sticky top-[88px]">
							<h1 className="text-2xl font-bold mb-3">Navigation</h1>
							<NavigationAnchor>Special</NavigationAnchor>
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<PriceStoreProvider>
							<CraftingType type="special">Special</CraftingType>
						</PriceStoreProvider>
					</div>
				</div>
			</div>
		</CraftingStoreProvider>
	);
}
