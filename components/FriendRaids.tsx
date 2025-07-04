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
import { useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Class, Difficulty } from "@/generated/prisma";
import type { InferRouterOutputs } from "@orpc/server";
import type { router } from "@/router";
import type { MainStore } from "@/stores/main";
import {
	separateSupportAndDps,
	sortDifficulties,
	sortRaidKeys,
} from "@/lib/chars";
import ClassIcon from "./class-icons/ClassIcon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { authClient } from "@/lib/auth";

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

function translateToUsableData(
	data: FriendRaidsData,
	availableRaids: FriendRaidsAvailableRaid[],
) {
	return Object.fromEntries(
		Object.entries(data.raids)
			.filter(([raidId]) =>
				availableRaids.some((raid) => raid.raidId === raidId),
			)
			.sort(([a], [b]) => sortRaidKeys(a, b))
			.map(([raidId, diffs]) => {
				return [
					raidId,
					{
						name: raids[raidId]?.name || "Unknown Raid",
						difficulties: Object.fromEntries(
							Object.entries(diffs)
								.filter(([difficulty]) =>
									availableRaids.some(
										(raid) =>
											raid.difficulty === difficulty && raid.raidId === raidId,
									),
								)
								.sort(([a], [b]) =>
									sortDifficulties(a as Difficulty, b as Difficulty),
								)
								.map(([difficulty, users]) => {
									return [
										difficulty,
										users
											.sort((a, b) =>
												data.userInfo[b.userId]?.name.localeCompare(
													data.userInfo[a.userId]?.name,
												),
											)
											.map((run) => ({
												id: run.userId,
												name: data.userInfo[run.userId]?.name || "Unknown",
												image: data.userInfo[run.userId]?.image || null,
												characters: run.charactersIds.map((charId) => ({
													id: charId,
													name:
														data.userInfo[run.userId]?.characters?.[charId]
															?.characterName || "Unknown",
													class:
														data.userInfo[run.userId]?.characters?.[charId]
															?.class || "Unknown",
													itemLevel:
														data.userInfo[run.userId]?.characters?.[charId]
															?.itemLevel || 0,
													isGoldEarner:
														data.userInfo[run.userId]?.characters?.[charId]
															?.isGoldEarner || false,
												})),
											})),
									];
								}),
						),
					},
				];
			}),
	);
}

type UsableData = ReturnType<typeof translateToUsableData>;

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
			<DialogContent className="lg:min-w-5xl">
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
	raidId,
	difficulty,
	users,
}: {
	users: UsableData[string]["difficulties"][Difficulty];
	raidId: string;
	difficulty: Difficulty;
}) {
	if (users.length === 0) {
		return (
			<div className="text-xs text-muted-foreground">No friends available</div>
		);
	}

	return users.map((user) => {
		const { dps, support } = separateSupportAndDps(user.characters);

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
			...unitedArray.filter((c) => support.some((s) => s.class === c.class)),
		];
		// unitedArray now contains up to 6 unique classes, with DPS first and supports last

		return (
			<div
				key={`${raidId}-${difficulty}-${user.id}`}
				className="flex justify-between items-center p-2 gap-4 w-full bg-secondary/20 border-secondary/50 border-1 rounded-md"
			>
				<div className="flex items-center gap-2">
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
								<ClassIcon c={c.class as Class} key={c.id} className="size-5" />
							))}
							{user.characters.length > unitedArray.length && (
								<span className="font-semibold">
									+{user.characters.length - unitedArray.length}{" "}
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
	});
}

function RaidCardGroup({
	raidId,
	raidData,
}: {
	raidId: string;
	raidData: UsableData[string];
}) {
	return (
		<div key={raidId} className="border rounded-lg p-4">
			<div className="font-bold text-lg text-primary mb-4 flex items-center justify-between">
				<span>{raidData.name}</span>
			</div>
			<div className="flex flex-col gap-4">
				<Accordion type="multiple">
					{Object.entries(raidData.difficulties).map(([difficulty, users]) => {
						if (users.length === 0) return null;
						return (
							<AccordionItem
								value={raidId + difficulty}
								key={raidId + difficulty}
							>
								<AccordionTrigger className="items-center flex text-md">
									<span className="min-w-[60px]">{difficulty}</span>
									<div className="*:data-[slot=avatar]:ring-base flex -space-x-2 *:data-[slot=avatar]:ring-2">
										{users.map((user) => {
											return (
												<Avatar key={`${raidId}-${difficulty}-${user.id}`}>
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
								</AccordionTrigger>
								<AccordionContent className="grid grid-cols-1 lg:grid-cols-3 justify-around gap-2">
									<RaidGateAvatars
										raidId={raidId}
										difficulty={difficulty as Difficulty}
										users={users}
									/>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			</div>
		</div>
	);
}

export default function FriendRaids({ isOpen, onOpenChange }: Props) {
	const mainStore = useMainStore();
	const availableRaids = useMemo(() => mainStore.availableRaids(), [mainStore]);
	const session = authClient.useSession();
	const friendRaidsQuery = useQuery(
		orpc.friendRaids.getFriendsRaids.queryOptions({
			input: availableRaids,
			enabled: session.data !== null,
		}),
	);

	// Refetch if data is older than 5 minutes when dialog opens
	useEffect(() => {
		if (friendRaidsQuery.isSuccess && isOpen) {
			const lastDateUpdated = new Date(friendRaidsQuery.dataUpdatedAt);
			const now = new Date();
			const diffInMinutes = (now.getTime() - lastDateUpdated.getTime()) / 1000 / 60;
			if (diffInMinutes > 5) {
				friendRaidsQuery.refetch();
			}
		}
	}, [friendRaidsQuery, isOpen]);

	const data = useMemo(() => {
		if (friendRaidsQuery.data === undefined) return undefined;
		return translateToUsableData(friendRaidsQuery.data, availableRaids);
	}, [friendRaidsQuery.data, availableRaids]);

	return (
		<FriendRaidsDialog isOpen={isOpen} onOpenChange={onOpenChange}>
			{friendRaidsQuery.isLoading ? (
				<div className="text-center py-8">Loading...</div>
			) : friendRaidsQuery.isError ? (
				<div className="text-center py-8 text-destructive">
					Error loading friend raids.
				</div>
			) : data === undefined || Object.keys(data).length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					You have no available raids.
				</div>
			) : (
				<div className="flex flex-col space-y-6 max-h-[60vh] overflow-y-scroll p-2">
					{Object.entries(data).map(([raidId, raidData]) => {
						if (Object.keys(raidData.difficulties).length === 0) return null;
						return (
							<RaidCardGroup key={raidId} raidId={raidId} raidData={raidData} />
						)
					})}
				</div>
			)}
		</FriendRaidsDialog>
	);
}
