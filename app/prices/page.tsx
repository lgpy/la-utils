import PriceCards from "@/components/PriceCards";
import { PriceStoreProvider } from "@/providers/PriceStoreProvider";

export default function PricesPage() {
  return (
    <PriceStoreProvider>
      <PriceCards />
    </PriceStoreProvider>
  );
}
