import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuctionState {
  marketValue: number;
  isProfit: boolean;
}

interface AuctionActions {
  setMarketValue: (value: number) => void;
  setIsProfit: (value: boolean) => void;
}

export type AuctionStore = AuctionState & AuctionActions;

export const useAutionStore = create<AuctionStore>()(
  persist(
    (set) => ({
      marketValue: 0,
      isProfit: true,
      setMarketValue: (value) => set({ marketValue: value }),
      setIsProfit: (value) => set({ isProfit: value }),
    }),
    { name: "auction" },
  ),
);
