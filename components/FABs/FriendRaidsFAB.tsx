"use client";

import { Loader2Icon, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMainStore, useSettingsStore } from "@/stores/main-store/provider";

import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import {
	filterFriendDataByAvailableRaids,
	translateToUsableData,
} from "./FriendRaids.utils";
import FriendRaids from "./FriendRaids";
import FancyMultiSelect from "../FancyMultiSelect";
import _ from "lodash";

export default function FriendRaidsFAB() {
	const [isOpen, setIsOpen] = useState(false);

	const session = authClient.useSession();

	const settingsStore = useSettingsStore((store) => store);
	const mainStore = useMainStore();
	const availableRaids = useMemo(() => mainStore.availableRaids(), [mainStore]);

	const [selected, setSelected] = useState<string[]>([]);

	const friendRaidsQuery = useQuery(
		orpc.friendRaids.getFriendsRaids.queryOptions({
			input: {
				filterByRaids: settingsStore.state.friendRaids.filterByRaids,
				raids: settingsStore.state.friendRaids.filterByRaids
					? availableRaids
					: [],
			},
			enabled: isOpen,
			staleTime: 5 * 60 * 1000,
			select: (data) => {
				if (settingsStore.state.friendRaids.filterByRaids)
					data = filterFriendDataByAvailableRaids(data, availableRaids);
				return {
					...data,
					displayData: translateToUsableData(data),
				};
			},
			refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
		})
	);

	const filteredDisplayData = useMemo(() => {
		if (selected.length === 0) return friendRaidsQuery.data?.displayData;
		return Object.fromEntries(
			Object.entries(friendRaidsQuery.data?.displayData || {})
				.map(([raidId, raidData]) => {
					const newRaidData = {
						...raidData,
						difficulties: Object.fromEntries(
							Object.entries(raidData.difficulties)
								.map(([difficultyId, users]) => {
									const newUsers = users.filter((user) =>
										selected.some((selectedId) => selectedId === user.id)
									);

									if (newUsers.length === 0) return null;

									return [difficultyId, newUsers];
								})
								.filter((entry) => entry !== null)
						),
					};

					const difficultyCount = Object.keys(newRaidData.difficulties).length;
					if (difficultyCount === 0) return null;

					return [raidId, newRaidData];
				})
				.filter((entry) => entry !== null)
		);
	}, [friendRaidsQuery.data, selected]);

	const hasImportedFriendFilter = useRef(false);

	useEffect(() => {
		if (hasImportedFriendFilter.current) return;
		if (!settingsStore.hasHydrated) return;
		if (friendRaidsQuery.data === undefined) return;
		if (!isOpen) {
			hasImportedFriendFilter.current = false;
			return;
		}
		const existingFriendIds =
			settingsStore.state.friendRaids.friendFilter.filter(
				(id) => id in friendRaidsQuery.data.userInfo
			);
		setSelected(existingFriendIds);
		hasImportedFriendFilter.current = true;
	}, [settingsStore, isOpen, friendRaidsQuery.data]);

	useEffect(() => {
		if (!isOpen) return;
		if (!hasImportedFriendFilter.current) return;
		if (!settingsStore.hasHydrated) return;
		const isEqual = _.isEqual(
			selected.sort(),
			settingsStore.state.friendRaids.friendFilter.sort()
		);
		if (isEqual) return;
		settingsStore.state.setFriendFilter(selected);
	}, [selected, settingsStore, isOpen]);

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
				<DialogContent
					className="lg:min-w-5xl"
					showCloseButton={false}
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<div className="flex flex-row justify-between">
							<div className="flex flex-col gap-2">
								<DialogTitle>Friend Raids</DialogTitle>
								<DialogDescription>
									See which friends have raids available for you to join.
								</DialogDescription>
							</div>
							<div className="flex flex-col gap-2 items-end">
								<FancyMultiSelect
									className="max-w-full min-w-sm"
									data={
										Object.entries(friendRaidsQuery.data?.userInfo || {}).map(
											([id, user]) => ({
												label: user.name,
												value: id,
											})
										) || []
									}
									selected={selected}
									setSelected={setSelected}
									placeholder="Filter by friends..."
								/>
								<div className="flex items-center gap-3">
									<Label htmlFor="filterRaids">
										Ignore raids I don't have available
									</Label>
									<Checkbox
										id="filterRaids"
										checked={settingsStore.state.friendRaids.filterByRaids}
										onCheckedChange={settingsStore.state.togglefilterByRaids}
									/>
								</div>
							</div>
						</div>
					</DialogHeader>
					<ScrollArea className="max-h-[70vh] p-4">
						{friendRaidsQuery.isLoading ? (
							<div className="text-center py-8">Loading...</div>
						) : friendRaidsQuery.error ? (
							<div className="text-center py-8 text-destructive">
								Error loading friend raids.
							</div>
						) : friendRaidsQuery.data === undefined ||
						  Object.keys(friendRaidsQuery.data).length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								You have no available raids.
							</div>
						) : (
							<FriendRaids data={filteredDisplayData ?? {}} />
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
