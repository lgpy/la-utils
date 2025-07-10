"use client";

import { orpc } from "@/lib/orpc";
import { type router } from "@/router";
import { type InferRouterOutputs } from "@orpc/server";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { ChangelogDetailType } from "@/generated/prisma";
import { useChangelogStore } from "@/providers/ChangelogStoreProvider";
import { has } from "lodash";

export type Outputs = InferRouterOutputs<typeof router>;

export type ChangelogEntry = Outputs["changelog"]["paginatedChangelog"]["entries"][number];

type ChangelogEntryCardProps = {
  entry: ChangelogEntry;
  isNew?: boolean;
}

function getDetailTypeUiConfig(type: ChangelogDetailType) {
  switch (type) {
    case ChangelogDetailType.adition:
      return { label: "Added", color: "bg-ctp-green text-background" };
    case ChangelogDetailType.fix:
      return { label: "Fixed", color: "bg-ctp-blue text-background" };
    case ChangelogDetailType.removal:
      return { label: "Removed", color: "bg-ctp-red text-background" };
    case ChangelogDetailType.improvement:
      return { label: "Improved", color: "bg-ctp-mauve text-background" };
    case ChangelogDetailType.change:
      return { label: "Changed", color: "bg-ctp-peach text-background" };
    default:
      const _exhaustiveCheck: never = type;
      return { label: "Unknown", color: "bg-gray-500 text-white" };
  }
}

function ChangelogEntryCard({ entry, isNew }: ChangelogEntryCardProps) {

  return (
    <Card id={`cl-${entry.id}`}>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{entry.title}</span>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 mt-1">
            <span>{format(entry.date, "MMM dd, yyyy")}</span>
          </CardDescription>
        </div>
        {isNew && (
          <Badge variant="destructive" className="text-xs px-2 py-0.5">
            NEW
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {entry.description}
        </p>
        {entry.details && entry.details.length > 0 && (
          <ul className="text-sm flex flex-col gap-1.5">
            {entry.details.map((detail) => {
              const detailUiConfig = getDetailTypeUiConfig(detail.type);

              return (
                <li
                  key={`${entry.id}-detail-${detail.id}`}
                  className="grid grid-cols-[65px_1fr] gap-3 items-start"
                >
                  <Badge
                    variant="secondary"
                    className={cn(`text-xs px-2 py-0.5 w-full justify-center`, detailUiConfig.color)}
                  >
                    {detailUiConfig.label}
                  </Badge>
                  <span className="text-sm">{detail.description}</span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface ChangelogContentProps {
  changelogs?: Outputs["changelog"]["paginatedChangelog"];
}

export default function ChangelogContent({ changelogs }: ChangelogContentProps) {
  const changelogQuery = useInfiniteQuery(orpc.changelog.paginatedChangelog.infiniteOptions({
    input: cursor => ({ cursor, limit: 10 }),
    getNextPageParam: lastPage => lastPage.nextCursor,
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    initialData: changelogs ? {
      pages: [changelogs],
      pageParams: [0],
    } : undefined,
  }));

  const { setLastViewedDate, lastViewedDate: lastViewedDateString, isHydrated } = useChangelogStore();

  const lastViewedDate = useRef<Date | undefined>(undefined);
  const hasScrolledToHash = useRef(false);

  const isLoading = changelogQuery.isLoading;

  // Mark as viewed when user leaves the page
  useEffect(() => {

    if (!isHydrated) return;
    if (lastViewedDate.current === undefined) {
      lastViewedDate.current = new Date(lastViewedDateString ?? 0);
    }

    if (changelogQuery.data === undefined) return;
    const changelogEntries = changelogQuery.data.pages.flatMap(page => page.entries);
    if (changelogEntries.length === 0) return;

    if (changelogEntries.length > 0) {
      const mostRecentEntry = changelogEntries[0];
      if (new Date(mostRecentEntry.date).getTime() === new Date(lastViewedDateString ?? 0).getTime()) return;
      setLastViewedDate(mostRecentEntry.date.toISOString());
    }
  }, [setLastViewedDate, changelogQuery.data, lastViewedDateString, isHydrated]);


  useEffect(() => {
    // load more changelog entries when the scroll reaches the bottom
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        if (!changelogQuery.isFetchingNextPage && changelogQuery.hasNextPage) {
          changelogQuery.fetchNextPage();
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [changelogQuery]);

  // Handle scrolling to specific entry if hash is present (only run once)
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    if (hasScrolledToHash.current) return; // Prevent multiple scrolls
    const changelogEntries = changelogQuery.data?.pages.flatMap(page => page.entries) || [];
    if (changelogEntries.length === 0) return;
    hasScrolledToHash.current = true;
    const hash = window.location.hash.substring(1);
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a highlight effect
        element.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.5)";
        setTimeout(() => {
          element.style.boxShadow = "";
        }, 3000);
      }
    }, 100); // Small delay to ensure DOM is ready
  }, [changelogQuery.data]);


  return (

    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">
                  Loading changelog...
                </h3>
                <p className="text-muted-foreground">
                  Fetching the latest updates for you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {changelogQuery.isError && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Failed to load changelog
                </h3>
                <p className="text-muted-foreground mb-4">{changelogQuery.error.message}</p>
                <button
                  type="button"
                  onClick={() => changelogQuery.refetch()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !changelogQuery.isError && (
          <div className="flex flex-col gap-6">
            {changelogQuery.data?.pages.map((group, i) => (
              <Fragment key={i}>
                {group.entries.map((entry) => (
                  <ChangelogEntryCard key={entry.id} entry={entry} isNew={lastViewedDate.current !== undefined ? entry.date > lastViewedDate.current : undefined} />
                ))}
              </Fragment>
            ))}
          </div>
        )}

        {!isLoading && !changelogQuery.isError && changelogQuery.data?.pages.length === 1 && changelogQuery.data?.pages[0].entries.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No changelog entries yet
                </h3>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
