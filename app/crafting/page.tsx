import CraftingOptions from "@/components/Crafting/CraftingOptions";
import CraftingTable from "@/components/Crafting/CraftingTable";
import { CraftingStoreProvider } from "@/providers/CraftStoreProvider";
import { PriceStoreProvider } from "@/providers/PriceStoreProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Crafting | Lost Ark Utils",
	description: "",
};

export default function CraftingPage() {
	return (
		<CraftingStoreProvider>
			<div className="flex flex-col  my-6 mx-0 md:mx-6 gap-6">
				<div className="flex flex-col md:flex-row gap-3 items-center justify-center">
					<CraftingOptions parent="general" />
					<CraftingOptions parent="special" />
				</div>
				<PriceStoreProvider>
					<CraftingTable />
				</PriceStoreProvider>
			</div>
		</CraftingStoreProvider>
	);
}
