import AuctionCalculatorFAB from "@/components/AuctionCalculator/AuctionCalculatorFAB";
import RosterGold from "@/components/RosterGold";
import TodoCards from "@/components/TodoCard/TodoCards";
import type { Metadata } from "next";

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
