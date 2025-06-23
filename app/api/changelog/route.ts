import { type NextRequest, NextResponse } from "next/server";
import { changelogEntries, zodChangelogEntry } from "./entries";


// Helper function to parse d/m/y format to Date object
function parseChangelogDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lastViewedDate = searchParams.get('lastViewedDate');
    const newerThan = searchParams.get('newerThan');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');

    const validatedEntries = changelogEntries.map((entry) =>
      zodChangelogEntry.parse(entry)
    );

    // Sort entries by date (newest first)
    let sortedEntries = validatedEntries.sort((a, b) =>
      parseChangelogDate(b.date).getTime() - parseChangelogDate(a.date).getTime()
    );

    // Filter by newerThan date if provided (for notifications)
    if (newerThan) {
      sortedEntries = sortedEntries.filter(entry =>
        parseChangelogDate(entry.date) > new Date(newerThan)
      );
    }

    // Calculate pagination
    const total = sortedEntries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = sortedEntries.slice(startIndex, endIndex);

    // Mark entries as new if they're after the last viewed date
    const entriesWithNewFlag = paginatedEntries.map((entry) => ({
      ...entry,
      date: parseChangelogDate(entry.date).toISOString(), // Convert date to ISO string for consistency
      isNew: lastViewedDate ? parseChangelogDate(entry.date) > new Date(lastViewedDate) : true
    }));

    const newCount = entriesWithNewFlag.filter(entry => entry.isNew).length;

    return NextResponse.json({
      entries: entriesWithNewFlag,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      newCount,
    });
  } catch (error) {
    console.error("Error validating changelog entries:", error);
    return NextResponse.json(
      { error: "Invalid changelog data" },
      { status: 500 }
    );
  }
}
