"use client";

import { useCraftingStore } from "@/providers/CraftStoreProvider";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CraftingParents, CraftingStore } from "@/stores/crafting";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

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
    <Card className="flex flex-col p-4 gap-4 max-w-[300px]">
      <h2 className="text-lg font-semibold text-center">{label}</h2>
      <div className="grid gap-4 items-center text-center grid-cols-[auto_100px]">
        <Label className="text-center md:text-end">Cost Reduction</Label>
        <Input
          type="number"
          min={0}
          className="text-center no-spinner"
          value={options.costReduction}
          onChange={(e) =>
            store.changeKey(parent, "costReduction", Number(e.target.value))
          }
        />
        <Label className="text-center md:text-end">Great Success Chance</Label>
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
    </Card>
  );
}

export default function CraftingHeader() {
  const { store, hasHydrated } = useCraftingStore((store) => store);

  if (!hasHydrated) {
    return <Skeleton className="h-[300px] rounded-md" />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
      <CraftingOptions store={store} parent="general" />
      <CraftingOptions store={store} parent="special" />
    </div>
  );
}
