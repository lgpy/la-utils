import { os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { changelogEntrySchema, getChangelogEntrySchema, last5ChangelogSchema, paginatedChangelogOutputSchema, paginatedChangelogSchema } from "./changelog.schema";
import { optionalAuthMiddleware } from "./middleware/auth";
import { auth } from "@/lib/auth.server";

export const paginatedChangelog = os
  .use(dbProviderMiddleware)
  .use(optionalAuthMiddleware)
  .input(paginatedChangelogSchema)
  .output(paginatedChangelogOutputSchema)
  .handler(async ({ context: { db, session }, input }) => {
    const { limit, cursor } = input;

    let hasPermission = false;

    if (session) {
      const ManagementPermission = await auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permissions: {
            changelog: ["manage"],
          },
        }
      })
      hasPermission = ManagementPermission.success;
    }

    const changelog = await db.changelog.findMany({
      where: {
        isVisible: hasPermission ? undefined : true,
      },
      take: limit,
      skip: cursor,
      orderBy: {
        date: "desc",
      },
      include: {
        details: {
          select: {
            id: true,
            description: true,
            type: true,
          },
        },
      },
      omit: {
        isVisible: hasPermission ? false : true, // Only include isVisible if the user has management permissions
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
        isVisible: true,
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

export const getChangelogEntry = os
  .use(dbProviderMiddleware)
  .input(getChangelogEntrySchema)
  .handler(async ({ context: { db }, input }) => {
    const { id } = input;

    const changelogEntry = await db.changelog.findUnique({
      where: { id },
      include: {
        details: true,
      },
    });

    if (!changelogEntry) {
      throw new Error(`Changelog entry with id ${id} not found`);
    }

    return changelogEntry;
  });

export const upsertChangelogEntry = os
  .use(dbProviderMiddleware)
  .input(changelogEntrySchema)
  .handler(async ({ context: { db }, input }) => {
    const { id, date, title, description, details, isVisible } = input;

    if (id) {
      const existingEntry = await db.changelog.findUnique({
        where: { id },
      });

      if (!existingEntry) {
        throw new Error(`Changelog entry with id ${id} not found`);
      }

      await db.changelog.update({
        where: { id },
        data: {
          date: new Date(date),
          title,
          description,
          isVisible,
          details: {
            deleteMany: {},
            create: details,
          },
        },
      });
    } else {
      await db.changelog.create({
        data: {
          date: new Date(date),
          title,
          description,
          isVisible,
          details: {
            create: details,
          },
        },
      });
    }
  });
