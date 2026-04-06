import AuctionCalculatorFAB from "@/components/FABs/AuctionCalculatorFAB";
import FriendRaidsFAB from "@/components/FABs/FriendRaidsFAB";
import LoaLogUpdateRaidCompletion from "@/components/FABs/LoaLogUpdateRaidCompletion";
import RosterGold from "@/components/RosterGold";
import TodoCards from "@/components/TodoCard/TodoCards";
import TodoCardsMovableMenu from "@/components/TodoCard/TodoCardsMovableMenu";
import VersionMismatchAlert from "@/components/VersionMismatchAlert";

export default function Home() {
	return (
		<>
			<TodoCardsMovableMenu />
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
