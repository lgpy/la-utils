"use client";

import { usePriceStore } from "@/providers/PriceStoreProvider";
import PriceCard from "./PriceCard";
import { useMemo } from "react";
import { items } from "@/stores/prices";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function PriceCards() {
  const pricesStore = usePriceStore((state) => state);
  const bcItem = pricesStore.prices.find((item) => item.id === "blue-crystal");
  const singleBlueCrystalValue = (bcItem?.price || 0) / 95;
  const [parent] = useAutoAnimate();

  return (
    <div
      className="mt-6 flex flex-row flex-wrap gap-3 justify-center"
      ref={parent}
    >
      {items.map((item) => {
        const pSitem = pricesStore.prices.find((i) => i.id === item.id);
        if (!pSitem) return null;
        return (
          <PriceCard
            key={item.id}
            item={item}
            pSitem={pSitem}
            changeValue={(n) => pricesStore.changePrice(item.id, n)}
            bcValue={singleBlueCrystalValue}
          />
        );
      })}
    </div>
  );
}
