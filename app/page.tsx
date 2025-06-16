import AuctionCalculatorFAB from "@/components/AuctionCalculator/AuctionCalculatorFAB";
import FriendRaidsFAB from "@/components/FriendRaidsFAB";
import LoaLogUpdateRaidCompletion from "@/components/LoaLogAccess/LoaLogUpdateRaidCompletion";
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
			<RosterGold />

			<div className="fixed right-4 bottom-4 flex flex-col gap-2 items-end">
				<FriendRaidsFAB />
				<LoaLogUpdateRaidCompletion />
				<AuctionCalculatorFAB />
			</div>
		</>
	);
}
