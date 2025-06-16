import { ORPCError, os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import { respondSchema, revokeFriendshipSchema, revokeRequestSchema, sendRequestSchema } from "./friends.schema";

export const getFriends = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .handler(async ({ context: { db, session: { user } } }) => {

    const friendships = await db.friendship.findMany({
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

    const friends = []
    for (const friendship of friendships) {
      friends.push(friendship.requesterId === user.id ? friendship.addressee : friendship.requester);
    }

    return friends;
  });

export const getFriendRequests = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .handler(async ({ context: { db, session: { user } } }) => {
    const receivedRequests = await db.friendship.findMany({
      where: {
        OR: [
          { requesterId: user.id },
          { addresseeId: user.id },
        ],
        status: "pending",
      },
      include: {
        requester: true,
        addressee: true,
      },
    });

    return {
      received: receivedRequests.filter(req => req.addresseeId === user.id).map(req => (req.requester)),
      sent: receivedRequests.filter(req => req.requesterId === user.id).map(req => (req.addressee)),
    };
  });


export const revokeRequest = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .input(revokeRequestSchema)
  .handler(async ({ context: { db, session: { user } }, input }) => {
    const friendship = await db.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: user.id,
          addresseeId: input.userId,
        },
      },
    });
    if (!friendship || friendship.status !== "pending") {
      throw new ORPCError("NOT_FOUND", { message: "No pending request found" });
    }
    await db.friendship.delete({
      where: {
        requesterId_addresseeId: {
          requesterId: user.id,
          addresseeId: input.userId,
        },
      },
    });
  });

export const revokeFriendship = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .input(revokeFriendshipSchema)
  .handler(async ({ context: { db, session: { user } }, input }) => {

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
  });

export const respondToFriendRequest = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .input(respondSchema)
  .handler(async ({ context: { db, session: { user } }, input }) => {

    const friendship = await db.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: input.userId,
          addresseeId: user.id,
        },
      },
    });

    if (!friendship || friendship.status !== "pending") {
      throw new ORPCError("NOT_FOUND", { message: "No pending request found" });
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
  })

export const sendFriendRequest = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .input(sendRequestSchema)
  .handler(async ({ context: { db, session: { user } }, input }) => {

    if (input.userId === user.id) {
      throw new ORPCError("BAD_REQUEST", { message: "Cannot friend yourself" });
    }

    const existing = await db.friendship.findUnique({
      where: {
        requesterId_addresseeId: {
          requesterId: user.id,
          addresseeId: input.userId,
        },
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

  })

