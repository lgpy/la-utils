"use client";

import { usePriceStore } from "@/providers/PriceStoreProvider";
import PriceCard from "./PriceCard";
import { useMemo } from "react";
import { items } from "@/stores/prices";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function PriceCards() {
  const { store, hasHydrated } = usePriceStore((state) => state);
  const bcItem = store.prices.find((item) => item.id === "blue-crystal");
  const singleBlueCrystalValue = (bcItem?.price || 0) / 95;
  const [parent] = useAutoAnimate();

  if (!hasHydrated) {
    return null;
  }

  return (
    <div
      className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
      ref={parent}
    >
      {items.map((item) => {
        const pSitem = store.prices.find((i) => i.id === item.id);
        return (
          <PriceCard
            key={item.id}
            item={item}
            pSitem={pSitem}
            changeValue={(n) => store.changePrice(item.id, n)}
            bcValue={singleBlueCrystalValue}
          />
        );
      })}
    </div>
  );
}
