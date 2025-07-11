"use client";

import { Loader2Icon, Users } from "lucide-react";
import { useState } from "react";
import FriendRaids from "./FriendRaids";
import { ExpandableButton } from "../ExpandableButton";
import { FabButtonWrapper } from "./FabButtonWrapper";
import { authClient } from "@/lib/auth";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettingsStore } from "@/providers/MainStoreProvider";

export default function FriendRaidsFAB() {
	const [isOpen, setIsOpen] = useState(false);

	const session = authClient.useSession();

	const settingsStore = useSettingsStore();

	if (!session.isPending && session.data === null) {
		return null;
	}

	return (
		<>
			<FabButtonWrapper>
				<ExpandableButton
					variant="secondary"
					label="Friend Raids"
					onClick={() => setIsOpen(!isOpen)}
					disabled={session.isPending || !settingsStore.hasHydrated}
				>
					{session.isPending ? (
						<Loader2Icon className="animate-spin size-6" />
					) : (
						<Users className="size-6" />
					)}
				</ExpandableButton>
			</FabButtonWrapper>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="lg:min-w-5xl">
					<DialogHeader>
						<DialogTitle>Friend Raids</DialogTitle>
						<div className="flex flex-row justify-between">
							<DialogDescription>
								See which friends have raids available for you to join.
							</DialogDescription>
							<div className="flex items-center gap-3">
								<Label htmlFor="filterRaids">Ignore raids I don't have available</Label>
								<Checkbox id="filterRaids" checked={settingsStore.friendRaids.filterByRaids} onCheckedChange={settingsStore.togglefilterByRaids} />
							</div>
						</div>
					</DialogHeader>
					<ScrollArea className="max-h-[70vh] p-4">
						<FriendRaids filterByRaids={settingsStore.friendRaids.filterByRaids} isVisible={isOpen} />
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
