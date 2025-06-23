import { os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import type { Class, Difficulty } from "@/generated/prisma";
import { FriendRaidsSchema } from "./friendRaids.schema";
import { getGateResetDate } from "@/lib/dates";
import { isGateCompleted } from "@/lib/raids";

export const getFriendsRaids = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .input(FriendRaidsSchema)
  .handler(async ({ context: { db, session: { user } }, input }) => {
    const friends = await db.friendship.findMany({
      where: {
        status: "accepted",
        OR: [
          { requesterId: user.id },
          { addresseeId: user.id },
        ],
      },
      include: {
        requester: true,
        addressee: true,
      },
    });

    const friendIds = friends.map(friend => friend.requesterId === user.id ? friend.addresseeId : friend.requesterId);
    const friendRaids = await db.assignedRaid.findMany({
      where: {
        userId: { in: friendIds },
        raidId: { in: input.map(r => r.raidId) },
        gates: {
          some: {
            difficulty: { in: input.map(r => r.difficulty) },
          },
        },
      },
      include: {
        character: {
          include: {
            user: true,
          }
        },
        gates: true,
      },
    });

    const filteredFriendRaids = friendRaids.filter(raid => {
      return raid.gates.some(gate => {
        const resetDate = getGateResetDate(raid.raidId, gate.gateId);
        const completed = gate.completedDate
          ? isGateCompleted(new Date(gate.completedDate), resetDate)
          : false;
        return !completed;
      });
    });

    const userInfo: Record<string, {
      name: string; image: string | null; characters: Record<string, {
        characterName: string;
        class: Class;
        itemLevel: number;
        isGoldEarner: boolean;
      }>
    }> = {};

    for (const raid of filteredFriendRaids) {
      const u = raid.character.user;
      if (!userInfo[u.id]) {
        userInfo[u.id] = { name: u.name, image: u.image ?? null, characters: {} };
      }
      userInfo[u.id].characters[raid.character.id] = {
        characterName: raid.character.name,
        class: raid.character.class,
        itemLevel: raid.character.itemLevel,
        isGoldEarner: raid.character.isGoldEarner
      };
    }

    // Change: structuredFriendRaids is now a nested Record structure
    const structuredFriendRaids = {} as Record<string, // RaidID
      Record<Difficulty, // Difficulty
        Array<{
          userId: string;
          charactersIds: Array<string>;
        }>
      >
    >;

    for (const raid of filteredFriendRaids) {
      for (const gate of raid.gates) {
        if (!structuredFriendRaids[raid.raidId]) {
          structuredFriendRaids[raid.raidId] = {} as Record<Difficulty, Array<{ userId: string; charactersIds: Array<string> }>>;
        }
        if (!structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty]) {
          structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty] = [];
        }
        const usersArr = structuredFriendRaids[raid.raidId][gate.difficulty as Difficulty];
        let userEntry = usersArr.find(u => u.userId === raid.character.user.id);
        if (!userEntry) {
          userEntry = {
            userId: raid.character.user.id,
            charactersIds: []
          };
          usersArr.push(userEntry);
        }
        if (!userEntry.charactersIds.includes(raid.character.id)) {
          userEntry.charactersIds.push(raid.character.id);
        }
      }
    }
    return { raids: structuredFriendRaids, userInfo };
  })
