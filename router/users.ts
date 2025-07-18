import { hasPermission } from "@/lib/auth.server";
import { ORPCError, os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import { paginatedUserSchema } from "./users.schema";

export const listUsersInfinite = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .use(async ({ context, next }) => {
    const permission = await hasPermission({ user: ["list"] }, context.session);
    if (!permission) throw new ORPCError("Unauthorized");
    return next();
  })
  .input(paginatedUserSchema)
  .handler(async ({ context: { db }, input }) => {
    const { limit, cursor } = input;

    const users = await db.user.findMany({
      take: limit,
      skip: cursor,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      entries: users,
      nextCursor: users.length < limit ? undefined : cursor + limit,
    };
  });

export const count = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .use(async ({ context, next }) => {
    const permission = await hasPermission({ user: ["list"] }, context.session);
    if (!permission) throw new ORPCError("Unauthorized");
    return next();
  })
  .handler(async ({ context: { db } }) => await db.user.count());
