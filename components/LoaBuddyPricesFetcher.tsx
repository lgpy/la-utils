"use client";

import { client } from "@/lib/orpc";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { usePriceStore } from "@/providers/PriceStoreProvider";
import { useSettingsStore } from "@/providers/MainStoreProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ServerName, ServerRegion } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";
import { useMemo, useState } from "react";
import { containsSlug } from "@/lib/external-apis/loabuddy";

function ServerRegionFromServerName(serverName: ServerName): ServerRegion {
  switch (serverName) {
    // NAW servers
    case ServerName.Thaemine:
    case ServerName.Brelshaza:
      return ServerRegion.NAW;

    // NAE servers
    case ServerName.Luterra:
    case ServerName.Balthorr:
    case ServerName.Nineveh:
    case ServerName.Inanna:
    case ServerName.Vairgrys:
      return ServerRegion.NAE;

    // EUC servers
    case ServerName.Ortuus:
    case ServerName.Elpon:
    case ServerName.Ratik:
    case ServerName.Arcturus:
    case ServerName.Gienah:
      return ServerRegion.EUC;

    default:
      const _exhaustiveCheck: never = serverName;
      throw new Error(`Unknown server name: ${serverName}`);
  }
}

export default function LoaBuddyPricesFetcher() {
  const priceStore = usePriceStore((state) => state);
  const settingsStore = useSettingsStore((state) => state);
  const [fetching, setFetching] = useState(false);

  const isReady = priceStore.hasHydrated && settingsStore.hasHydrated;

  const isOlderThanSixHours = useMemo(() => {
    if (!priceStore.hasHydrated) return false;
    const validIds = priceStore.store.prices
      .filter(p => containsSlug(p.id));

    if (validIds.length === 0) return true; // No prices available, consider it outdated

    const oldestUpdatedAt = validIds
      .reduce((oldest, item) => {
        const updatedOn = new Date(item.updatedOn);
        if (updatedOn < oldest)
          return updatedOn;
        return oldest;
      }, new Date());
    return oldestUpdatedAt.getTime() < Date.now() - 6 * 60 * 60 * 1000;
  }, [priceStore]);

  return <div className="flex flex-col items-center gap-2 bg-card p-2 rounded-base border-border border-1 min-w-[160px]">
    <Select
      disabled={!isReady}
      onValueChange={(value) => {
        settingsStore.state.setServer(value as ServerName);
      }}
      value={settingsStore.state.server}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a server" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>EUC</SelectLabel>
          <SelectItem value={ServerName.Ortuus}>Ortuus</SelectItem>
          <SelectItem value={ServerName.Elpon}>Elpon</SelectItem>
          <SelectItem value={ServerName.Ratik}>Ratik</SelectItem>
          <SelectItem value={ServerName.Arcturus}>Arcturus</SelectItem>
          <SelectItem value={ServerName.Gienah}>Gienah</SelectItem>
          <SelectLabel>NAE</SelectLabel>
          <SelectItem value={ServerName.Luterra}>Luterra</SelectItem>
          <SelectItem value={ServerName.Balthorr}>Balthorr</SelectItem>
          <SelectItem value={ServerName.Nineveh}>Nineveh</SelectItem>
          <SelectItem value={ServerName.Inanna}>Inanna</SelectItem>
          <SelectItem value={ServerName.Vairgrys}>Vairgrys</SelectItem>
          <SelectLabel>NAW</SelectLabel>
          <SelectItem value={ServerName.Thaemine}>Thaemine</SelectItem>
          <SelectItem value={ServerName.Brelshaza}>Brelshaza</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <Button
      disabled={!isReady || fetching || !isOlderThanSixHours}
      onClick={async () => {
        if (settingsStore.state.server === undefined) {
          toast.error("Please select a server first.");
          return;
        }
        setFetching(true);
        const uuid = uuidv4();
        toast.loading("Fetching LoaBuddy prices...", {
          id: `loaBuddyPrices-${uuid}`,
          description: "This may take a few seconds",
        });
        try {
          const prices = await client.market.getMarketPrices({ server: ServerRegionFromServerName(settingsStore.state.server) });
          for (const item of prices) {
            priceStore.store.changePrice(item.itemId, item.price, item.updatedAt);
          }
          toast.success("Fetched prices successfully", {
            id: `loaBuddyPrices-${uuid}`,
            description: "Prices updated.",
          });
        } catch (error) {
          toast.error("Failed to fetch prices", {
            id: `loaBuddyPrices-${uuid}`,
            description: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          setFetching(false);
        }
      }}
      className="w-full"
    >
      {
        isReady
          ? isOlderThanSixHours
            ? "Fetch Prices"
            : "Up to Date"
          : "Loading settings..."
      }
    </Button>
    <p className="text-xs text-muted-foreground text-center">
      Price API by LOA Buddy
    </p>
  </div >;
}
