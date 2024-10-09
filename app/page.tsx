import RosterGold from "@/components/RosterGold";
import type { Metadata } from "next";
import AuctionCalculatorFAB from "@/components/AuctionCalculator/AuctionCalculatorFAB";
import TodoCards from "@/components/TodoCard/TodoCards";

export const metadata: Metadata = {
  title: "Home | Lost Ark Utils",
  description: "",
};

export default function Home() {
  return (
    <>
      <TodoCards />
      <AuctionCalculatorFAB />
      <RosterGold />
    </>
  );
}
