import FabOCR from "@/components/OCR/FabOcr";
import PriceCards from "@/components/PriceCard/PriceCards";
import { PriceStoreProvider } from "@/providers/PriceStoreProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Prices | Lost Ark Utils",
	description: "",
};

export default function PricesPage() {
	return (
		<PriceStoreProvider>
			<PriceCards />
			<FabOCR />
		</PriceStoreProvider>
	);
}
