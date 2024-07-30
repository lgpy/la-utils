"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeEventHandler, useMemo } from "react";
import { Input } from "./ui/input";
import { items, PricesState } from "@/stores/prices";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import Image from "next/image";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import { DateTime, Interval } from "luxon";
import { ClipboardIcon } from "lucide-react";
import CopyButton from "./CopyButton";

type Props = {
  item: (typeof items)[number];
  pSitem?: PricesState["prices"][number];
  changeValue: (value: number) => void;
  bcValue: number;
};

const getHighestUnit = (lastUpdated: DateTime) => {
  const now = DateTime.now();
  const diff = now.diff(lastUpdated, [
    "years",
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);
  let highestUnit = "";
  let highestValue = 0;

  if (diff.years !== 0) {
    highestUnit = "years";
    highestValue = diff.years;
  } else if (diff.months !== 0) {
    highestUnit = "months";
    highestValue = diff.months;
  } else if (diff.days !== 0) {
    highestUnit = "days";
    highestValue = diff.days;
  } else if (diff.hours !== 0) {
    highestUnit = "hours";
    highestValue = diff.hours;
  } else if (diff.minutes !== 0) {
    highestUnit = "minutes";
    highestValue = diff.minutes;
  } else if (diff.seconds !== 0) {
    highestUnit = "seconds";
    highestValue = Math.round(diff.seconds);
  } else {
    return undefined;
  }
  return {
    highestUnit,
    highestValue,
  };
};

export default function PriceCard({
  changeValue,
  bcValue,
  pSitem,
  item,
}: Props) {
  const mari = useMemo(() => {
    if (!item.mari) return undefined;
    const blueCrystalValue = bcValue * item.mari.bc;
    const singleMarketValue = (pSitem?.price || 0) / item.mari.marketQty;
    const singleMariValue = blueCrystalValue / item.mari.qty;
    const profit = singleMarketValue - singleMariValue;
    //diff is the saving percentage between the market value and the Mari value
    const diff = -((profit / singleMarketValue) * 100);

    return {
      blueCrystalValue,
      singleMarketValue,
      singleMariValue,
      profit,
      diff,
      isProfit: profit > 0,
    };
  }, [bcValue, pSitem?.price, item]);

  const daysSinceUpdate = useMemo(() => {
    if (!pSitem) return undefined;
    if (!pSitem.updatedOn) return undefined;
    return getHighestUnit(DateTime.fromISO(pSitem.updatedOn));
  }, [pSitem]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    const num = Number(value);
    if (isNaN(num)) return;
    changeValue(num);
  };

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2">
          <Image
            src={`/assets/${item.id}.webp`}
            width={48}
            height={48}
            alt=""
            className="size-[48px]"
          />
          <CardTitle className="text-xl">{item.name}</CardTitle>
        </div>
        <div>
          <CopyButton variant="ghost" size="icon" textToCopy={item.name} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <div className="flex flex-col gap-1.5 max-w-44">
          <Label htmlFor={`p-${item.id}`}>Market Value</Label>
          <Input
            id={`p-${item.id}`}
            placeholder="Market Value"
            type="number"
            value={pSitem?.price || 0}
            onChange={onChange}
          />
          <p className="text-sm text-gray-500">
            Last updated:{" "}
            {daysSinceUpdate !== undefined
              ? daysSinceUpdate.highestValue + " " + daysSinceUpdate.highestUnit
              : "Never"}
          </p>
        </div>
        {mari && (
          <div className="flex flex-col items-end">
            <Label>Mari Value</Label>
            <p className="text-md mt-1.5">{+mari.singleMariValue.toFixed(2)}</p>
            <p
              className={cn("text-xs", {
                "text-destructive": !mari.isProfit,
                "text-success": mari.isProfit,
              })}
            >
              {mari.diff > 0 && "+"}
              {+mari.diff.toFixed(2)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
