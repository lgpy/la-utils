"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { items, PricesState } from "@/stores/prices";
import { DateTime } from "luxon";
import Image from "next/image";
import { ChangeEventHandler, useMemo } from "react";
import TruncatedTooltip from "./TruncatedTooltip";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
  item: (typeof items)[number];
  pSitem?: PricesState["prices"][number];
  changeValue: (value: number) => void;
  bcValue: number;
};

const getHighestUnit = (lastUpdated: DateTime) => {
  const now = DateTime.now();
  const diff = now.diff(lastUpdated, ["days", "hours", "minutes", "seconds"]);

  if (diff.days !== 0) {
    return `${diff.days} day${diff.days < 2 ? "" : "s"} ago`;
  } else if (diff.hours !== 0) {
    return `${diff.hours} hour${diff.hours < 2 ? "" : "s"} ago`;
  } else if (diff.minutes !== 0) {
    return `${diff.minutes} minute${diff.minutes < 2 ? "" : "s"} ago`;
  } else if (diff.seconds !== 0) {
    if (diff.seconds < 1) return "now";
    else
      return `${Math.round(diff.seconds)} second${
        diff.seconds < 2 ? "" : "s"
      } ago`;
  } else {
    return undefined;
  }
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
    const singleMarketValue = (pSitem?.price || 0) / item.marketQty;
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
    <Card className="w-[350px] flex flex-col justify-between">
      <CardHeader className="flex flex-row justify-between p-0">
        <div
          className={cn(
            "flex flex-row items-center gap-3 p-3 w-full rounded-t-md relative",
            {
              "bg-gradient-to-b from-mauve/30 to-card": item.rarity === "epic",
              "bg-gradient-to-b from-blue/30 to-card": item.rarity === "rare",
              "bg-gradient-to-b from-green/30 to-card":
                item.rarity === "uncommon",
              "bg-gradient-to-b from-gray/30 to-card": item.rarity === "common",
            },
          )}
        >
          <Image
            src={`/assets/${item.id}.webp`}
            width={48}
            height={48}
            alt=""
            className="size-[48px]"
          />
          <TruncatedTooltip
            text={item.name}
            className={{
              text: cn("text-xl font-semibold tracking-tight truncate", {
                "text-mauve": item.rarity === "epic",
                "text-blue": item.rarity === "rare",
                "text-green": item.rarity === "uncommon",
                "text-gray": item.rarity === "common",
              }),
              tooltip: "text-center",
            }}
          />
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-row justify-between p-3")}>
        <div className={cn("flex flex-col gap-1.5 max-w-44")}>
          <Label htmlFor={`p-${item.id}`}>
            Market Value
            {item.marketQty !== undefined && (
              <span className="text-muted-foreground text-xs">
                {" "}
                (x{item.marketQty})
              </span>
            )}
          </Label>
          <Input
            id={`p-${item.id}`}
            placeholder="Market Value"
            type="number"
            value={pSitem?.price || 0}
            onChange={onChange}
          />
          <p className="text-xs text-muted-foreground">
            Updated: {daysSinceUpdate !== undefined ? daysSinceUpdate : "Never"}
          </p>
        </div>
        {mari !== undefined && (
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
