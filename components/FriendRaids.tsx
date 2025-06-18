"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { orpc } from "@/lib/orpc";
import { raids } from "@/lib/raids";
import { useMainStore } from "@/providers/MainStoreProvider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Class, Difficulty } from "@/generated/prisma";
import type { InferRouterOutputs } from "@orpc/server";
import type { router } from "@/router";
import type { MainStore } from "@/stores/main";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, RussianRuble } from "lucide-react";
import { separateSupportAndDps } from "@/lib/chars";
import { Button } from "./ui/button";
import ClassIcon from "./class-icons/ClassIcon";

export type Outputs = InferRouterOutputs<typeof router>;

export type FriendRaidsData = Outputs["friendRaids"]["getFriendsRaids"];

export interface FriendRaidsRun {
	userId: string;
	charactersIds: string[];
}

export type FriendRaidsAvailableRaid = ReturnType<
	MainStore["availableRaids"]
>[number];

// --- Types for raid/gate info from lib/raids.ts ---
export interface RaidGateInfo {
	bossName: string[];
	difficulties: Partial<
		Record<Difficulty, { itemlevel: number; rewards: { gold: number } }>
	>;
	isBiWeekly?: "odd" | "even";
}

export interface RaidInfo {
	name: string;
	gates: Record<string, RaidGateInfo>;
}

interface Props {
	isOpen: boolean;
	onOpenChange?: (open: boolean) => void;
}

function FriendRaidsDialog({
	isOpen,
	onOpenChange,
	children,
}: Props & { children: React.ReactNode }) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Friend Raids</DialogTitle>
					<DialogDescription>
						See which friends have raids available for you to join.
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}

function RaidGateAvatars({
	runsArr,
	data,
	raidId,
	difficulty,
	gateId,
}: {
	runsArr: FriendRaidsRun[];
	data: FriendRaidsData | undefined;
	raidId: string;
	difficulty: Difficulty;
	gateId: string;
}) {
	if (!Array.isArray(runsArr) || runsArr.length === 0) {
		return (
			<div className="text-xs text-muted-foreground">No friends available</div>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="min-w-1/2 h-10 flex items-center gap-2"
				>
					<div className="flex-1 flex justify-center">
						<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
							{runsArr.map((run) => {
								const user = data?.userInfo?.[run.userId];
								if (!user) return null;
								return (
									<Avatar
										key={`${raidId}-${difficulty}-${gateId}-${run.userId}`}
									>
										{user.image ? (
											<AvatarImage src={user.image} alt={user.name} />
										) : (
											<AvatarFallback>
												{user.name?.[0]?.toUpperCase() || "?"}
											</AvatarFallback>
										)}
									</Avatar>
								);
							})}
						</div>
					</div>
					<ChevronDown className="shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className=" w-max max-w-[40vw]">
				{runsArr.map((run) => {
					const user = data?.userInfo?.[run.userId];
					if (!user) return null;
					const runChars = Object.entries(user.characters).filter(
						([charId, _]) => run.charactersIds.includes(charId),
					);
					console.log(
						Object.entries(user.characters),
						runChars,
						run.charactersIds,
						run,
					);
					const { dps, support } = separateSupportAndDps(
						runChars.map(([charId, char]) => ({
							id: charId,
							...char,
						})),
					);

					// Simplified: Collect up to 3 unique DPS and 3 unique supports by class, then fill up to 6
					const getUniqueByClass = (arr: typeof dps | typeof support) => {
						const seen = new Set<string>();
						return arr.filter((c) => {
							if (seen.has(c.class)) return false;
							seen.add(c.class);
							return true;
						});
					};
					const uniqueDps = getUniqueByClass(dps).slice(0, 3);
					const uniqueSupport = getUniqueByClass(support).slice(0, 3);
					let unitedArray = [...uniqueDps, ...uniqueSupport];

					// If less than 6, fill with remaining DPS then supports (no duplicate classes)
					if (unitedArray.length < 6) {
						const addMore = (arr: typeof dps | typeof support) => {
							for (const c of arr) {
								if (unitedArray.length === 6) break;
								if (!unitedArray.some((u) => u.class === c.class)) {
									unitedArray.push(c);
								}
							}
						};
						addMore(dps);
						addMore(support);
					}
					// Ensure DPS first, supports last
					unitedArray = [
						...unitedArray.filter((c) => dps.some((d) => d.class === c.class)),
						...unitedArray.filter((c) =>
							support.some((s) => s.class === c.class),
						),
					];
					// unitedArray now contains up to 6 unique classes, with DPS first and supports last

					return (
						<div
							key={`${raidId}-${difficulty}-${gateId}-${run.userId}`}
							className="flex justify-between items-center p-2 hover:bg-muted rounded w-full gap-4"
						>
							<div className="flex items-center gap-2 hover:bg-muted rounded">
								<Avatar className="shrink-0 size-10">
									{user.image ? (
										<AvatarImage src={user.image} alt={user.name} />
									) : (
										<AvatarFallback>
											{user.name?.[0]?.toUpperCase() || "?"}
										</AvatarFallback>
									)}
								</Avatar>
								<div className="flex flex-col">
									<span className="font-medium">{user.name}</span>
									<span className="text-xs text-muted-foreground flex items-center gap-1">
										{unitedArray.map((c) => (
											<ClassIcon
												c={c.class as Class}
												key={c.id}
												className="size-5"
											/>
										))}
										{Object.keys(runChars).length > unitedArray.length && (
											<span className="font-semibold">
												+{Object.keys(runChars).length -
													unitedArray.length}{" "}
											</span>
										)}
									</span>
								</div>
							</div>

							<div className="flex flex-col justify-around gap-0.5 text-end">
								{dps.length > 0 && (
									<span className="text-xs text-muted-foreground">
										{dps.length} DPS
									</span>
								)}
								{support.length > 0 && (
									<span className="text-xs text-muted-foreground">
										{support.length} SUP
									</span>
								)}
							</div>
						</div>
					);
				})}
			</PopoverContent>
		</Popover>
	);
}

function RaidCardGroup({
	raidId,
	difficulties,
	raidInfo,
	gateEntries,
	data,
}: {
	raidId: string;
	difficulties: Difficulty[];
	raidInfo: RaidInfo;
	gateEntries: [string, RaidGateInfo][];
	data: FriendRaidsData | undefined;
}) {
	return (
		<div key={raidId} className="border rounded-lg p-4">
			<div className="font-bold text-lg text-primary mb-4 flex items-center justify-between">
				<span>{raidInfo.name}</span>
			</div>
			<div className="flex flex-col gap-4">
				{difficulties.map((difficulty) => {
					// Collect all unique userIds and their characterIds who have runs in any gate for this raid/difficulty
					const userIdToCharIds: Record<string, Set<string>> = {};
					for (const [gateId] of gateEntries) {
						const runs = data?.raids?.[raidId]?.[gateId]?.[difficulty] || [];
						for (const run of runs) {
							if (!userIdToCharIds[run.userId])
								userIdToCharIds[run.userId] = new Set();
							for (const cid of run.charactersIds) {
								userIdToCharIds[run.userId].add(cid);
							}
						}
					}
					const runsArr = Object.entries(userIdToCharIds).map(
						([userId, charIdSet]) => ({
							userId,
							charactersIds: Array.from(charIdSet),
						}),
					);
					if (runsArr.length === 0) return null;
					return (
						<div key={raidId + difficulty} className="flex items-center gap-4 ">
							<span className="text-accent font-semibold mr-2 min-w-[64px]">
								{difficulty}
							</span>
							<RaidGateAvatars
								runsArr={runsArr}
								data={data}
								raidId={raidId}
								difficulty={difficulty}
								gateId={"all"}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function FriendRaidsContent({
	availableRaids,
	data,
}: {
	availableRaids: FriendRaidsAvailableRaid[];
	data: FriendRaidsData | undefined;
}) {
	if (availableRaids && availableRaids.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				You have no available raids.
			</div>
		);
	}
	if (availableRaids && availableRaids.length > 0 && data) {
		// Group by raidId, collect all difficulties for each raid
		const grouped = availableRaids.reduce(
			(acc, { raidId, difficulty }) => {
				if (!acc[raidId]) acc[raidId] = [];
				acc[raidId].push(difficulty);
				return acc;
			},
			{} as Record<string, Difficulty[]>,
		);

		const renderedRaidCards: React.ReactNode[] = [];
		for (const [raidId, difficulties] of Object.entries(grouped)) {
			const raidInfo = raids[raidId];
			if (!raidInfo) continue;
			const gateEntries = Object.entries(raidInfo.gates).filter(
				([, gateInfo]) => difficulties.some((d) => gateInfo.difficulties[d]),
			);
			// Only show if at least one difficulty has users
			const hasAnyUsers = difficulties.some((difficulty) =>
				gateEntries.some(([gateId]) => {
					const runsArr = data.raids?.[raidId]?.[gateId]?.[difficulty] || [];
					return Array.isArray(runsArr) && runsArr.length > 0;
				}),
			);
			if (hasAnyUsers) {
				renderedRaidCards.push(
					<RaidCardGroup
						key={raidId}
						raidId={raidId}
						difficulties={difficulties}
						raidInfo={raidInfo}
						gateEntries={gateEntries}
						data={data}
					/>,
				);
			}
		}
		if (renderedRaidCards.length === 0) {
			return (
				<div className="text-center py-8 text-muted-foreground">
					Your friends have no raids available.
				</div>
			);
		}
		return (
			<div className="space-y-6 max-h-[60vh] overflow-y-auto p-2">
				{renderedRaidCards}
			</div>
		);
	}
	return null;
}

export default function FriendRaids({ isOpen, onOpenChange }: Props) {
	const mainStore = useMainStore();
	const availableRaids = useMemo(() => mainStore.availableRaids(), [mainStore]);
	const friendRaidsQuery = useQuery(
		orpc.friendRaids.getFriendsRaids.queryOptions({ input: availableRaids }),
	);
	const data = friendRaidsQuery.data;

	return (
		<FriendRaidsDialog isOpen={isOpen} onOpenChange={onOpenChange}>
			{friendRaidsQuery.isLoading && (
				<div className="text-center py-8">Loading...</div>
			)}
			{friendRaidsQuery.isError && (
				<div className="text-center py-8 text-destructive">
					Error loading friend raids.
				</div>
			)}
			<FriendRaidsContent availableRaids={availableRaids} data={data} />
		</FriendRaidsDialog>
	);
}
