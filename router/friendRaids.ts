import { os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import { Difficulty } from "@/prisma/generated/enums";
import { getGateResetDate } from "@/lib/dates";
import { isGateCompleted } from "@/lib/raids";

export const getFriendsRaids = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
		}) => {
			const friends = await db.friendship.findMany({
				where: {
					status: "accepted",
					OR: [{ requesterId: user.id }, { addresseeId: user.id }],
				},
				include: {
					requester: {
						select: { id: true, name: true, image: true, characters: true },
					},
					addressee: {
						select: { id: true, name: true, image: true, characters: true },
					},
				},
			});

			const friendIds = friends.map((friend) =>
				friend.requesterId === user.id ? friend.addresseeId : friend.requesterId
			);
			const friendRaids = await db.assignedRaid.findMany({
				where: {
					userId: { in: friendIds },
					gates: {
						some: {
							difficulty: { not: Difficulty.Solo },
						},
					},
				},
				select: {
					raidId: true,
					characterId: true,
					userId: true,
					gates: {
						select: {
							gateId: true,
							difficulty: true,
							completedDate: true,
						}
					},
				}
			});

			const incompleteFriendRaids = friendRaids.filter((raid) => {
				return raid.gates.some((gate) => {
					const resetDate = getGateResetDate(raid.raidId, gate.gateId);
					const completed = gate.completedDate
						? isGateCompleted(new Date(gate.completedDate), resetDate)
						: false;
					return !completed;
				});
			});

			const structuredFriendRaids = {} as Record<
				string, // RaidID
				Record<
					Difficulty, // Difficulty
					Array<{
						userId: string;
						charactersIds: Array<string>;
					}>
				>
			>;

			for (const raid of incompleteFriendRaids) {
				for (const gate of raid.gates) {
					if (!structuredFriendRaids[raid.raidId]) {
						structuredFriendRaids[raid.raidId] = {} as Record<
							Difficulty,
							Array<{ userId: string; charactersIds: Array<string> }>
						>;
					}
					if (
						!structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty]
					) {
						structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty] =
							[];
					}
					const usersArr =
						structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty];
					let userEntry = usersArr.find(
						(u) => u.userId === raid.userId
					);
					if (!userEntry) {
						userEntry = {
							userId: raid.userId,
							charactersIds: [],
						};
						usersArr.push(userEntry);
					}
					if (!userEntry.charactersIds.includes(raid.characterId)) {
						userEntry.charactersIds.push(raid.characterId);
					}
				}
			}

			const userInfo = Object.fromEntries(friends.map((friend) => {
				const friendUser =
					friend.requesterId === user.id ? friend.addressee : friend.requester;
				return [
					friendUser.id,
					{
						name: friendUser.name,
						image: friendUser.image,
						characters: Object.fromEntries(
							friendUser.characters.map((char) => [
								char.id,
								{
									characterName: char.name,
									class: char.class,
									itemLevel: char.itemLevel,
									isGoldEarner: char.isGoldEarner,
								},
							])
						),
					},
				];
			}));


			return {
				raids: structuredFriendRaids, userInfo
			};
		}
	);
