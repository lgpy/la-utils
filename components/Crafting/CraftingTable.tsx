"use client";

import { cn } from "@/lib/utils";
import { useCraftingStore } from "@/providers/CraftStoreProvider";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { craftingItems, CraftingParents } from "@/stores/crafting";
import { items } from "@/stores/prices";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";

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
  const lastUpdated =
    pricesItem !== undefined
      ? DateTime.fromISO(pricesItem.updatedOn)
      : undefined;
  //add yellow warning if price is older than 1 day
  //add red warning if price is older than 3 days

  const type = item.type !== "general" ? store[item.type] : undefined;

  const craftcost =
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

  const gsChance =
    1 +
    ((store.general.greatSuccessChance / 100 +
      (type?.greatSuccessChance || 0) / 100 +
      1) *
      5) /
      100;

  const sellPrice =
    Math.floor(itemMarketPrice * 0.95) * item.returns * gsChance;

  const profit = sellPrice - craftcost - recipeCost;

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-row justify-between p-0">
        <div
          className={cn(
            "flex flex-row items-center justify-between p-3 gap-2 w-full rounded-t-md",
            {
              "bg-gradient-to-b from-mauve/30 to-card": item.rarity === "epic",
              "bg-gradient-to-b from-blue/30 to-card": item.rarity === "rare",
            },
          )}
        >
          <div className="flex flex-row items-center gap-3">
            <Image
              src={`/assets/${item.id}.webp`}
              width={48}
              height={48}
              alt=""
              className="size-[48px]"
            />
            <CardTitle
              className={cn("text-xl", {
                "text-mauve": item.rarity === "epic",
                "text-blue": item.rarity === "rare",
              })}
            >
              {item.name}
            </CardTitle>
          </div>
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
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("flex flex-row justify-between p-3")}>
        <div className="flex flex-row text-center gap-2">
          <div className="flex flex-col justify-between">
            <Label>Craft Cost</Label>
            <p>{(craftcost + recipeCost).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-end">Profit</Label>
          <p
            className={cn("text-xl", {
              "text-destructive": profit < 0,
              "text-success": profit > 0,
            })}
          >
            {profit.toFixed(2)}
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
  const [parent] = useAutoAnimate();

  return (
    <div>
      <div
        className="block relative top-[-70px] invisible"
        id={subtype || type}
      ></div>
      <h1
        className={cn("text-2xl font-bold", {
          "text-xl": subtype !== undefined,
        })}
      >
        {children}
      </h1>
      <div className={cn("mt-6 flex flex-row flex-wrap gap-3")} ref={parent}>
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
    <div className="flex flex-row my-6 mx-12 gap-6">
      <div>
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
