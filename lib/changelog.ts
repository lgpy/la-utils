import { z } from "zod";

export const zodChangelogEntry = z.object({
  id: z.string(),
  date: z.string(), // d/m/y date string
  title: z.string(),
  description: z.string(),
  details: z.array(z.tuple([z.enum(["added", "fixed", "removed", "improved", "changed"]), z.string()])).optional(),
});

export type ChangelogEntry = z.infer<typeof zodChangelogEntry>;

// API response type with isNew flag
export const zodChangelogEntryWithNew = zodChangelogEntry.extend({
  isNew: z.boolean().optional(),
});

export const zodChangelogResponse = z.object({
  entries: z.array(zodChangelogEntryWithNew),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
  newCount: z.number().optional(),
});

export type ChangelogResponse = z.infer<typeof zodChangelogResponse>;
export type ChangelogEntryWithNew = z.infer<typeof zodChangelogEntryWithNew>;
export type PaginationInfo = ChangelogResponse['pagination'];

// Fetch changelog entries from API
export async function fetchChangelogEntries(options?: {
  lastViewedDate?: string | null;
  newerThan?: string | null;
  page?: number;
  limit?: number;
}): Promise<ChangelogResponse> {
  try {
    const url = new URL('/api/changelog', window.location.origin);

    if (options?.lastViewedDate) {
      url.searchParams.set('lastViewedDate', options.lastViewedDate);
    }
    if (options?.newerThan) {
      url.searchParams.set('newerThan', options.newerThan);
    }
    if (options?.page) {
      url.searchParams.set('page', options.page.toString());
    }
    if (options?.limit) {
      url.searchParams.set('limit', options.limit.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch changelog: ${response.status}`);
    }

    const data = await response.json();
    return zodChangelogResponse.parse(data);
  } catch (error) {
    console.error('Error fetching changelog entries:', error);
    throw error;
  }
}

export function getDetailCategoryColor(category: "added" | "fixed" | "removed" | "improved" | "changed"): string {
  switch (category) {
    case "added":
      return "bg-ctp-green text-background";
    case "fixed":
      return "bg-ctp-blue text-background";
    case "removed":
      return "bg-ctp-red text-background";
    case "improved":
      return "bg-ctp-mauve text-background";
    case "changed":
      return "bg-ctp-peach text-background";
  }
}
