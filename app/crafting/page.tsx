import CraftingHeader from "@/components/Crafting/CraftingHeader";
import CraftingTable from "@/components/Crafting/CraftingTable";
import { CraftingStoreProvider } from "@/providers/CraftStoreProvider";
import { PriceStoreProvider } from "@/providers/PriceStoreProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crafting | Lost Ark Utils",
  description: "",
};

export default function CraftingPage() {
  return (
    <CraftingStoreProvider>
      <div className="flex flex-col  my-6 mx-0 md:mx-6 gap-6">
        <CraftingHeader />
        <PriceStoreProvider>
          <CraftingTable />
        </PriceStoreProvider>
      </div>
    </CraftingStoreProvider>
  );
}
