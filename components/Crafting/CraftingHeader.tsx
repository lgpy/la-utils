"use client";

import { useCraftingStore } from "@/providers/CraftStoreProvider";
import { Card, CardContent } from "../ui/card";
import { CraftingParents, CraftingStore } from "@/stores/crafting";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";

const getLabel = (parent: CraftingParents) => {
  switch (parent) {
    case "general":
      return "General";
    case "special":
      return "Special";
    case "battleItem":
      return "Battle Item";
  }
};

function CraftingOptions({
  store,
  parent,
}: {
  store: CraftingStore;
  parent: CraftingParents;
}) {
  const options = store[parent];
  const label = getLabel(parent);

  return (
    <div className="flex flex-col">
      <div className="grid gap-4 items-center text-center grid-cols-[auto_100px]">
        <h2 className="text-lg font-semibold col-span-2">{label}</h2>
        <Label className="text-end">Cost Reduction</Label>
        <Input
          type="number"
          min={0}
          className="text-center no-spinner"
          value={options.costReduction}
          onChange={(e) =>
            store.changeKey(parent, "costReduction", Number(e.target.value))
          }
        />
        <Label className="text-end">Great Success Chance</Label>
        <Input
          type="number"
          min={0}
          className="text-center no-spinner"
          value={options.greatSuccessChance}
          onChange={(e) =>
            store.changeKey(
              parent,
              "greatSuccessChance",
              Number(e.target.value),
            )
          }
        />
      </div>
    </div>
  );
}

export default function CraftingHeader() {
  const { store, hasHydrated } = useCraftingStore((store) => store);

  if (!hasHydrated) {
    return <Skeleton className="h-[300px] rounded-md" />;
  }

  return (
    <Card>
      <div className="flex flex-row p-6 gap-6 justify-center">
        <CraftingOptions store={store} parent="general" />
        <CraftingOptions store={store} parent="special" />
      </div>
    </Card>
  );
}
