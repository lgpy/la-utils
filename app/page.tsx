import AuctionCalculatorFAB from "@/components/FABs/AuctionCalculatorFAB";
import FriendRaidsFAB from "@/components/FABs/FriendRaidsFAB";
import LoaLogUpdateRaidCompletion from "@/components/FABs/LoaLogUpdateRaidCompletion";
import RosterGold from "@/components/RosterGold";
import TodoCards from "@/components/TodoCard/TodoCards";
import VersionMismatchAlert from "@/components/VersionMismatchAlert";
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
			<VersionMismatchAlert />
		</>
	);
}
