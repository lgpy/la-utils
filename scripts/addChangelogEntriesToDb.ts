import { ChangelogDetailType } from "@/generated/prisma";
import { changelogEntries } from "@/lib/changelog-entries"
import prisma from "@/lib/db"

function parseChangelogDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function convertType(ceType: "added" | "fixed" | "removed" | "improved" | "changed"): ChangelogDetailType {
  switch (ceType) {
    case "added":
      return ChangelogDetailType.adition;
    case "fixed":
      return ChangelogDetailType.fix;
    case "removed":
      return ChangelogDetailType.removal;
    case "improved":
      return ChangelogDetailType.improvement;
    case "changed":
      return ChangelogDetailType.change;
    default: {
      const _exhaustiveCheck: never = ceType;
      throw new Error(`Unknown changelog entry type: ${_exhaustiveCheck}`);
    }
  }
}

async function main() {
  for (const entry of changelogEntries) {
    await prisma.changelog.create({
      data: {
        date: parseChangelogDate(entry.date),
        title: entry.title,
        description: entry.description,
        details: {
          create: entry.details?.map(([type, description]) => ({
            type: convertType(type),
            description: description,
          })),
        },
      }
    });
  }
}

main()
