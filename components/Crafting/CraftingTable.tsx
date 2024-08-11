"use client";

import { isBadPriceItem } from "@/lib/items";
import { cn } from "@/lib/utils";
import { useCraftingStore } from "@/providers/CraftStoreProvider";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { craftingItems, CraftingParents } from "@/stores/crafting";
import { items } from "@/stores/prices";
import Image from "next/image";
import Link from "next/link";
import TruncatedTooltip from "../TruncatedTooltip";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import WarningTooltipIcon from "../WarningTooltipIcon";

function NavigationAnchor({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <Link
      href={`#${""}`}
      className={cn(
        "text-lg text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <span>{children}</span>
    </Link>
  );
}

function CraftingItem({
  item,
  recipeIdx,
}: {
  item: (typeof craftingItems)[number];
  recipeIdx: number;
}) {
  const { store: pricesStore, hasHydrated: pricesHasHydrated } = usePriceStore(
    (store) => store,
  );
  const { store, hasHydrated: craftHasHydrated } = useCraftingStore(
    (store) => store,
  );

  if (!pricesHasHydrated || !craftHasHydrated) {
    return <div>loading...</div>;
  }

  const pricesItem = pricesStore?.prices.find((i) => i.id === item.id);
  const pricesRecipeItems = Object.keys(item.recipes[recipeIdx]).reduce(
    (acc, key) => {
      acc[key] = pricesStore?.prices.find((i) => i.id === key)?.price || 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  const itemMarketPrice = pricesItem?.price || 0;

  const type = item.type !== "general" ? store[item.type] : undefined;

  const itemCraftCost =
    item.craftCost -
    (item.craftCost * store.general.costReduction) / 100 -
    (item.craftCost * (type?.costReduction || 0)) / 100;

  const recipeCost = Object.entries(item.recipes[recipeIdx]).reduce(
    (acc, [key, amount]) => {
      const price = pricesRecipeItems[key];
      const storeItem = items.find((i) => i.id === key);
      const singleMarketItemCost = price / (storeItem?.marketQty || 1);
      acc += singleMarketItemCost * amount;
      return acc;
    },
    0,
  );

  const craftCost = itemCraftCost + recipeCost;

  const gsChance =
    1 +
    ((store.general.greatSuccessChance / 100 +
      (type?.greatSuccessChance || 0) / 100 +
      1) *
      5) /
      100;

  const sellPrice =
    Math.floor(itemMarketPrice * 0.95) * item.returns * gsChance;

  const profit = sellPrice - craftCost;

  const marketdiff = -((profit / sellPrice) * 100);

  const warning = isBadPriceItem(pricesItem);

  return (
    <Card className="w-[350px] flex flex-col justify-between">
      <CardHeader className="flex flex-row justify-between p-0">
        <div
          className={cn(
            "w-full grid grid-cols-[48px_auto_32px] items-center gap-3 p-3 rounded-t-md",
            {
              "bg-gradient-to-b from-mauve/30 to-card": item.rarity === "epic",
              "bg-gradient-to-b from-blue/30 to-card": item.rarity === "rare",
            },
          )}
        >
          <div className="relative">
            <Image
              src={`/assets/${item.id}.webp`}
              width={48}
              height={48}
              alt=""
              className="size-[48px]"
            />
            {warning !== null && (
              <WarningTooltipIcon
                tooltip={warning}
                className="absolute -top-1 -right-1 size-5"
              />
            )}
          </div>
          <TruncatedTooltip
            text={item.name}
            className={{
              text: cn("text-xl font-semibold tracking-tight truncate", {
                "text-mauve": item.rarity === "epic",
                "text-blue": item.rarity === "rare",
              }),
              tooltip: "text-center",
            }}
          />
          {/*
          <div className="flex flex-col -space-y-4">
            {Object.keys(item.recipes[recipeIdx]).map((key) => {
              return (
                <Avatar
                  key={`avatar-${item.id}-${recipeIdx}-${key}`}
                  className="size-auto"
                >
                  <AvatarImage
                    src={`/assets/${key}.webp`}
                    alt=""
                    height={32}
                    width={32}
                    className="size-8"
                  />
                </Avatar>
              );
            })}
          </div>*/}
          <Image
            src={`/assets/${Object.keys(item.recipes[recipeIdx]).at(0)}.webp`}
            height={32}
            width={32}
            alt=""
          />
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-row justify-between p-3")}>
        <div className="flex flex-row text-center gap-3">
          <div className="flex flex-col justify-between">
            <Label>Craft Cost</Label>
            <p>{(itemCraftCost + recipeCost).toFixed(2)}</p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex flex-col justify-between">
            <Label className="text-end">Raw Profit</Label>
            <p
              className={cn({
                "text-destructive": profit < 0,
                "text-success": profit > 0,
              })}
            >
              {profit.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-end">Profit</Label>
          <p
            className={cn("text-xl", {
              "text-destructive": marketdiff < 0,
              "text-success": marketdiff > 0,
            })}
          >
            {marketdiff > 0 && "+"}
            {marketdiff.toFixed(2)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CraftingType({
  type,
  subtype,
  children,
}: {
  type: CraftingParents;
  subtype?: string;
  children: string;
}) {
  const items = craftingItems.filter((item) => item.type === type);

  return (
    <div>
      <div
        className="block relative top-[-70px] invisible"
        id={subtype || type}
      ></div>
      <h1
        className={cn("text-2xl font-bold text-center md:text-start", {
          "text-xl": subtype !== undefined,
        })}
      >
        {children}
      </h1>
      <div
        className={cn(
          "mt-6 flex flex-row flex-wrap gap-3 justify-center md:justify-start",
        )}
      >
        {items.map((item) =>
          item.recipes.map((_, idx) => (
            <CraftingItem key={item.id + idx} item={item} recipeIdx={idx} />
          )),
        )}
      </div>
    </div>
  );
}

export default function CraftingTable() {
  const { store, hasHydrated } = useCraftingStore((store) => store);

  if (!hasHydrated) {
    return <div>loading...</div>;
  }

  return (
    <div className="flex flex-row my-6 md:mx-12 gap-6">
      <div className="hidden md:block">
        <div className="flex flex-col gap-1 sticky top-[88px]">
          <h1 className="text-2xl font-bold mb-3">Navigation</h1>
          <NavigationAnchor>Special</NavigationAnchor>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <CraftingType type="special">Special</CraftingType>
      </div>
    </div>
  );
}
