import { os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { last5ChangelogSchema, paginatedChangelogSchema } from "./changelog.schema";

export const paginatedChangelog = os
  .use(dbProviderMiddleware)
  .input(paginatedChangelogSchema)
  .handler(async ({ context: { db }, input }) => {
    const { limit, cursor } = input;

    const changelog = await db.changelog.findMany({
      take: limit,
      skip: cursor,
      orderBy: {
        date: "desc",
      },
      include: {
        details: true,
      }
    });

    return {
      entries: changelog,
      nextCursor: changelog.length < limit ? undefined : cursor + limit,
    };
  });

export const last5Changelog = os
  .use(dbProviderMiddleware)
  .input(last5ChangelogSchema)
  .handler(async ({ context: { db }, input }) => {
    const { lastViewedDate } = input;

    const changelog = await db.changelog.findMany({
      where: {
        date: {
          gt: new Date(lastViewedDate),
        },
      },
      take: 5,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        title: true,
        date: true,
      }
    });

    return changelog;
  });

