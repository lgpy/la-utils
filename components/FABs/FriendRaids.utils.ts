import { Difficulty } from "@/generated/prisma";
import { sortDifficulties, sortRaidKeys } from "@/lib/chars";
import { raidData } from "@/lib/game-info";
import { OrpcOutputs } from "@/lib/orpc";
import { MainStore } from "@/stores/main-store";

type FriendRaidsData = OrpcOutputs["friendRaids"]["getFriendsRaids"];

export function filterFriendDataByAvailableRaids(
	data: FriendRaidsData,
	availableRaids: ReturnType<MainStore["availableRaids"]>
): FriendRaidsData {
	const raids = Object.fromEntries(
		Object.entries(data.raids)
			.filter(([raidId]) =>
				availableRaids.some((raid) => raid.raidId === raidId)
			)
			.map(([raidId, diffs]) => {
				return [
					raidId,
					Object.fromEntries(
						Object.entries(diffs).filter(([difficulty]) =>
							availableRaids.some(
								(raid) =>
									raid.difficulty === difficulty && raid.raidId === raidId
							)
						)
					) as Record<
						Difficulty,
						{
							userId: string;
							charactersIds: string[];
						}[]
					>,
				];
			})
	);

	const userInfo = Object.fromEntries(
		Object.entries(data.userInfo).filter(([userId]) =>
			Object.values(raids).some((raid) =>
				Object.values(raid).some((diff) =>
					diff.some((run) => run.userId === userId)
				)
			)
		)
	);

	return {
		raids: raids,
		userInfo: userInfo,
	};
}

export function translateToUsableData(data: FriendRaidsData) {
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
									sortDifficulties(a as Difficulty, b as Difficulty)
								)
								.map(([difficulty, users]) => {
									return [
										difficulty,
										users
											.sort((a, b) =>
												data.userInfo[b.userId]?.name.localeCompare(
													data.userInfo[a.userId]?.name
												)
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
								})
						),
					},
				];
			})
	);
}
