"use client";

import { orpc, OrpcOutputs } from "@/lib/orpc";
import { useMainStore } from "@/stores/main-store/provider";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Class, Difficulty } from "@/generated/prisma";
import type { MainStore } from "@/stores/main-store/main-store";
import {
	separateSupportAndDps,
	sortDifficulties,
	sortRaidKeys,
} from "@/lib/chars";
import ClassIcon from "@/components/class-icons/ClassIcon";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { raidData } from "@/lib/game-info";

type FriendRaidsData = OrpcOutputs["friendRaids"]["getFriendsRaids"];
type FriendRaidsUsableData = ReturnType<typeof translateToUsableData>;

function filterFriendDataByAvailableRaids(
	data: FriendRaidsData,
	availableRaids: ReturnType<
		MainStore["availableRaids"]
	>,
): FriendRaidsData {

	const raids = Object.fromEntries(
		Object.entries(data.raids)
			.filter(([raidId]) =>
				availableRaids.some((raid) => raid.raidId === raidId),
			).map(([raidId, diffs]) => {
				return [
					raidId,
					Object.fromEntries(
						Object.entries(diffs)
							.filter(([difficulty]) =>
								availableRaids.some(
									(raid) =>
										raid.difficulty === difficulty && raid.raidId === raidId,
								),
							)
					) as Record<Difficulty, {
						userId: string;
						charactersIds: string[];
					}[]>,
				];
			})
	);

	const userInfo = Object.fromEntries(
		Object.entries(data.userInfo)
			.filter(([userId]) =>
				Object.values(raids).some((raid) => Object.values(raid).some((diff) => diff.some((run) => run.userId === userId)))
			),
	)

	return {
		raids: raids,
		userInfo: userInfo,
	};
}

function translateToUsableData(
	data: FriendRaidsData
) {
	return Object.fromEntries(
		Object.entries(data.raids)
			.sort(([a], [b]) => sortRaidKeys(b, a)) // Sort raids by keys in reverse order
			.map(([raidId, diffs]) => {
				return [
					raidId,
					{
						name: raidData.get(raidId)?.name || "Unknown Raid",
						difficulties: Object.fromEntries(
							Object.entries(diffs)
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

type UserChars = FriendRaidsUsableData[string]["difficulties"][Difficulty][number]["characters"];

function getCharsToClassMap(dps: UserChars, support: UserChars) {
	const dpsMap = new Map<Class, UserChars>();
	const supportMap = new Map<Class, UserChars>();

	for (const char of dps) {
		const mapEntry = dpsMap.get(char.class);
		if (!mapEntry) {
			dpsMap.set(char.class, [char]);
		} else {
			mapEntry.push(char);
		}
	}
	for (const char of support) {
		const mapEntry = supportMap.get(char.class);
		if (!mapEntry) {
			supportMap.set(char.class, [char]);
		} else {
			mapEntry.push(char);
		}
	}

	return {
		dpsMap,
		supportMap,
	}
}

function getUniqueCharacterClassesV2(chars: UserChars): {
	uniqueClasses: Class[];
	dpsCount: number;
	supportCount: number;
} {
	const separatedByClassType = separateSupportAndDps(chars);
	const { dpsMap, supportMap } = getCharsToClassMap(separatedByClassType.dps, separatedByClassType.support);

	const totalDps = Array.from(dpsMap.values()).flat().length;
	const totalSupport = Array.from(supportMap.values()).flat().length;

	const CLASS_LIMIT = 6;
	const separatedUniqueClasses: Class[] = [];
	let supportCount = 0;
	let dpsCount = 0;

	const dpsClasses = Array.from(dpsMap.keys());
	const supportClasses = Array.from(supportMap.keys());

	const supportDefficient = supportMap.size < CLASS_LIMIT / 2;
	const dpsDefficient = dpsMap.size < CLASS_LIMIT / 2;
	for (let i = 0; i < CLASS_LIMIT; i++) {
		if (dpsCount === supportMap.size && supportCount === dpsMap.size) {
			break;
		}

		if (dpsCount < dpsMap.size && (supportDefficient || dpsCount < CLASS_LIMIT / 2)) {
			separatedUniqueClasses.push(dpsClasses[dpsCount]);
			dpsCount++;
		} else if (supportCount < supportMap.size && (dpsDefficient || supportCount < CLASS_LIMIT / 2)) {
			separatedUniqueClasses.push(supportClasses[supportCount]);
			supportCount++;
		}
	}


	return {
		uniqueClasses: separatedUniqueClasses,
		dpsCount: totalDps,
		supportCount: totalSupport,
	};
}

interface Props {
	filterByRaids: boolean;
	isVisible: boolean;
}

export default function FriendRaids({ filterByRaids, isVisible }: Props) {
	const mainStore = useMainStore();
	const availableRaids = useMemo(() => mainStore.availableRaids(), [mainStore]);
	const friendRaidsQuery = useQuery(
		orpc.friendRaids.getFriendsRaids.queryOptions({
			input: {
				filterByRaids: filterByRaids,
				raids: filterByRaids ? availableRaids : [],
			},
			enabled: isVisible,
			staleTime: 5 * 60 * 1000,
			select: (data) => {
				if (filterByRaids)
					data = filterFriendDataByAvailableRaids(data, availableRaids);
				return translateToUsableData(data);
			},
			refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
		}),
	);


	if (friendRaidsQuery.isLoading)
		return (
			<div className="text-center py-8">Loading...</div>
		)

	if (friendRaidsQuery.isError) {
		return (
			<div className="text-center py-8 text-destructive">
				Error loading friend raids.
			</div>
		);
	}

	if (friendRaidsQuery.data === undefined || Object.keys(friendRaidsQuery.data).length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				You have no available raids.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{Object.entries(friendRaidsQuery.data).map(([raidId, raidData]) => {
				if (Object.keys(raidData.difficulties).length === 0) return null;
				return (
					<div key={raidId} className="border rounded-lg p-4">
						<div className="font-bold text-lg text-primary mb-4 flex items-center justify-between">
							<span>{raidData.name}</span>
						</div>
						<div className="flex flex-col gap-4">
							<Accordion type="multiple" className="flex flex-col gap-1">
								{Object.entries(raidData.difficulties).map(([difficulty, users]) => {
									if (users.length === 0) return null;
									return (
										<AccordionItem
											value={raidId + difficulty}
											key={raidId + difficulty}
											className="bg-muted/60 border-0 rounded-base"
										>
											<AccordionTrigger className="items-center flex text-md py-2 px-4 data-[state=open]:rounded-b-none hover:no-underline bg-muted cursor-pointer hover:text-ctp-text/80">
												<span className="min-w-[60px]">{difficulty}</span>
												<div className="*:data-[slot=avatar]:ring-ctp-surface1/50 flex -space-x-2 *:data-[slot=avatar]:ring-2">
													{users.map((user) => {
														return (
															<Avatar key={`${raidId}-${difficulty}-${user.id}`}>
																<AvatarImage src={user.image ?? undefined} alt={user.name} />
																<AvatarFallback>
																	{user.name.charAt(0).toUpperCase()}
																</AvatarFallback>
															</Avatar>
														);
													})}
												</div>
											</AccordionTrigger>
											<AccordionContent className="grid grid-cols-1 lg:grid-cols-3 justify-around p-2 gap-2">
												{users.map((user) => {
													const {
														dpsCount,
														supportCount,
														uniqueClasses,
													} = getUniqueCharacterClassesV2(user.characters);

													return (
														<div
															key={`${raidId}-${difficulty}-${user.id}`}
															className="flex justify-between items-center p-2 gap-4 w-full bg-ctp-base rounded-md"
														>
															<div className="flex items-center gap-2">
																<Avatar className="shrink-0 size-10">
																	<AvatarImage src={user.image ?? undefined} alt={user.name} />
																	<AvatarFallback>
																		{user.name.charAt(0).toUpperCase()}
																	</AvatarFallback>
																</Avatar>
																<div className="flex flex-col">
																	<span className="font-medium">{user.name}</span>
																	<span className="text-xs text-muted-foreground flex items-center gap-1">
																		{uniqueClasses.map((c, i) => (
																			<ClassIcon c={c as Class} key={`${c}-${i}`} className="size-5" />
																		))}
																		{user.characters.length > uniqueClasses.length && (
																			<span className="font-semibold">
																				+{user.characters.length - uniqueClasses.length}{" "}
																			</span>
																		)}
																	</span>
																</div>
															</div>

															<div className="flex flex-col justify-around gap-0.5 text-end">
																{dpsCount > 0 && (
																	<span className="text-xs text-muted-foreground">
																		{dpsCount} DPS
																	</span>
																)}
																{supportCount > 0 && (
																	<span className="text-xs text-muted-foreground">
																		{supportCount} SUP
																	</span>
																)}
															</div>
														</div>
													);
												})}
											</AccordionContent>
										</AccordionItem>
									);
								})}
							</Accordion>
						</div>
					</div>
				)
			})}
		</div>
	);
}
