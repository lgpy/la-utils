import { ORPCError, os } from "@orpc/server";
import { z } from "zod";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import {
	respondSchema,
	revokeFriendshipSchema,
	revokeRequestSchema,
	sendRequestSchema,
} from "./friends.schema";

export const getFriends = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
		}) => {
			const friendships = await db.friendship.findMany({
				where: {
					status: "accepted",
					OR: [{ requesterId: user.id }, { addresseeId: user.id }],
				},
				include: {
					requester: true,
					addressee: true,
				},
			});

			const friends = [];
			for (const friendship of friendships) {
				friends.push(
					friendship.requesterId === user.id
						? friendship.addressee
						: friendship.requester
				);
			}

			return friends;
		}
	);

export const getFriendRequests = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
		}) => {
			const receivedRequests = await db.friendship.findMany({
				where: {
					OR: [{ requesterId: user.id }, { addresseeId: user.id }],
					status: "pending",
				},
				include: {
					requester: true,
					addressee: true,
				},
			});

			return {
				received: receivedRequests
					.filter((req) => req.addresseeId === user.id)
					.map((req) => req.requester),
				sent: receivedRequests
					.filter((req) => req.requesterId === user.id)
					.map((req) => req.addressee),
			};
		}
	);

export const getRecommendedFriends = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.input(z.object({ count: z.number().min(1).max(20).default(5) }))
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
			input,
		}) => {
			const allFriendships = await db.friendship.findMany({
				where: {
					OR: [{ requesterId: user.id }, { addresseeId: user.id }],
					status: { in: ["accepted", "pending"] },
				},
				select: {
					requesterId: true,
					addresseeId: true,
					status: true,
				},
			});

			const friendIds = new Set<string>();
			const pendingIds = new Set<string>();

			for (const f of allFriendships) {
				const otherId =
					f.requesterId === user.id ? f.addresseeId : f.requesterId;
				if (f.status === "accepted") friendIds.add(otherId);
				else if (f.status === "pending") pendingIds.add(otherId);
			}

			if (friendIds.size === 0) return [];

			const friendsOfFriends = await db.friendship.findMany({
				where: {
					status: "accepted",
					OR: [
						{ requesterId: { in: Array.from(friendIds) } },
						{ addresseeId: { in: Array.from(friendIds) } },
					],
				},
				select: {
					requesterId: true,
					addresseeId: true,
				},
			});

			const recommendedIds = new Set();
			for (const f of friendsOfFriends) {
				if (
					friendIds.has(f.requesterId) &&
					f.addresseeId !== user.id &&
					!friendIds.has(f.addresseeId) &&
					!pendingIds.has(f.addresseeId)
				) {
					recommendedIds.add(f.addresseeId);
				}
				if (
					friendIds.has(f.addresseeId) &&
					f.requesterId !== user.id &&
					!friendIds.has(f.requesterId) &&
					!pendingIds.has(f.requesterId)
				) {
					recommendedIds.add(f.requesterId);
				}
			}

			if (recommendedIds.size === 0) return [];

			const restrictedRecommendedIds = Array.from(recommendedIds)
				.sort(() => 0.5 - Math.random())
				.splice(0, input.count);

			let users = await db.user.findMany({
				where: {
					id: { in: restrictedRecommendedIds as string[] },
				},
			});

			return users;
		}
	);

export const revokeRequest = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.input(revokeRequestSchema)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
			input,
		}) => {
			const friendship = await db.friendship.findUnique({
				where: {
					requesterId_addresseeId: {
						requesterId: user.id,
						addresseeId: input.userId,
					},
				},
			});
			if (!friendship || friendship.status !== "pending") {
				throw new ORPCError("NOT_FOUND", {
					message: "No pending request found",
				});
			}
			await db.friendship.delete({
				where: {
					requesterId_addresseeId: {
						requesterId: user.id,
						addresseeId: input.userId,
					},
				},
			});
		}
	);

export const revokeFriendship = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.input(revokeFriendshipSchema)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
			input,
		}) => {
			const friendship = await db.friendship.findFirst({
				where: {
					status: "accepted",
					OR: [
						{
							requesterId: user.id,
							addresseeId: input.friendId,
						},
						{
							requesterId: input.friendId,
							addresseeId: user.id,
						},
					],
				},
			});

			if (!friendship) {
				throw new ORPCError("NOT_FOUND", { message: "No friendship found" });
			}

			await db.friendship.delete({
				where: {
					id: friendship.id,
				},
			});
		}
	);

export const respondToFriendRequest = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.input(respondSchema)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
			input,
		}) => {
			const friendship = await db.friendship.findUnique({
				where: {
					requesterId_addresseeId: {
						requesterId: input.userId,
						addresseeId: user.id,
					},
				},
			});

			if (!friendship || friendship.status !== "pending") {
				throw new ORPCError("NOT_FOUND", {
					message: "No pending request found",
				});
			}

			if (input.action === "accept") {
				await db.friendship.update({
					where: {
						requesterId_addresseeId: {
							requesterId: input.userId,
							addresseeId: user.id,
						},
					},
					data: { status: "accepted" },
				});
				return;
			}

			await db.friendship.delete({
				where: {
					requesterId_addresseeId: {
						requesterId: input.userId,
						addresseeId: user.id,
					},
				},
			});
		}
	);

export const sendFriendRequest = os
	.use(dbProviderMiddleware)
	.use(requiredAuthMiddleware)
	.input(sendRequestSchema)
	.handler(
		async ({
			context: {
				db,
				session: { user },
			},
			input,
		}) => {
			if (input.userId === user.id) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Cannot friend yourself",
				});
			}

			const existing = await db.friendship.findFirst({
				where: {
					OR: [
						{
							requesterId: user.id,
							addresseeId: input.userId,
						},
						{
							requesterId: input.userId,
							addresseeId: user.id,
						},
					],
				},
			});

			if (existing) {
				throw new ORPCError("CONFLICT", { message: "Request already exists" });
			}

			await db.friendship.create({
				data: {
					requesterId: user.id,
					addresseeId: input.userId,
					status: "pending",
				},
			});
		}
	);
