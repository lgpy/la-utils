import PriceCards from "@/components/PriceCard/PriceCards";
import { PriceStoreProvider } from "@/providers/PriceStoreProvider";
import { Metadata } from "next";
import FabOCR from "@/components/OCR/FabOcr";

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
