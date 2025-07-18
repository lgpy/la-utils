import { hasPermission } from "@/lib/auth.server";
import { ORPCError, os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { requiredAuthMiddleware } from "./middleware/auth";
import { paginatedUserSchema } from "./users.schema";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
  isWithinInterval,
} from "date-fns";

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


export const graphData = os
  .use(dbProviderMiddleware)
  .use(requiredAuthMiddleware)
  .use(async ({ context, next }) => {
    const permission = await hasPermission({ user: ["list"] }, context.session);
    if (!permission) throw new ORPCError("Unauthorized");
    return next();
  })
  .handler(async ({ context: { db } }) => {
    const users = await db.user.findMany({
      select: {
        createdAt: true,
      },
    });

    const now = new Date();

    // Weekly growth for the last 7 weeks
    const weeklyGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const weekDate = subWeeks(now, i);
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 3 }); // Wednesday
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 3 }); // Tuesday

      const weekUsers = users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return isWithinInterval(createdAt, { start: weekStart, end: weekEnd });
      });

      weeklyGrowth.push({
        week: format(weekStart, 'd/M'),
        users: weekUsers.length,
        startDate: weekStart,
        endDate: weekEnd
      });
    }

    // Monthly growth - group all users by month
    const monthlyGrowthMap = new Map<string, number>();

    users.forEach(user => {
      const createdAt = new Date(user.createdAt);
      const monthKey = format(createdAt, 'yyyy-MM');

      monthlyGrowthMap.set(monthKey, (monthlyGrowthMap.get(monthKey) || 0) + 1);
    });

    // Convert to array and sort chronologically
    const monthlyGrowth = Array.from(monthlyGrowthMap.entries())
      .map(([month, users]) => ({ month, users }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      weeklyGrowth,
      monthlyGrowth,
      totalUsers: users.length
    };
  });
