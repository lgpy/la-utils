"use client";

import { orpc, OrpcOutputs } from "@/lib/orpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { useChangelogStore } from "@/stores/changelog-store.provider";
import ChangelogEntryCard from "./ChangelogCard";

interface ChangelogContentProps {
	changelogs?: OrpcOutputs["changelog"]["paginatedChangelog"];
	showEditButton?: boolean;
}

export default function ChangelogContent({
	changelogs,
	showEditButton,
}: ChangelogContentProps) {
	const changelogQuery = useInfiniteQuery(
		orpc.changelog.paginatedChangelog.infiniteOptions({
			input: (cursor) => ({ cursor, limit: 10 }),
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: 0,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
			initialData: changelogs
				? {
						pages: [changelogs],
						pageParams: [0],
					}
				: undefined,
		})
	);

	const {
		setLastViewedDate,
		lastViewedDate: lastViewedDateString,
		hasHydrated,
	} = useChangelogStore();

	const lastViewedDate = useRef<Date | undefined>(undefined);
	const hasScrolledToHash = useRef(false);

	const isLoading = changelogQuery.isLoading || hasHydrated === false;

	// Mark as viewed when user leaves the page
	useEffect(() => {
		if (!hasHydrated) return;
		if (lastViewedDate.current === undefined) {
			lastViewedDate.current = new Date(lastViewedDateString ?? 0);
		}

		if (changelogQuery.data === undefined) return;
		const changelogEntries = changelogQuery.data.pages.flatMap(
			(page) => page.entries
		);
		if (changelogEntries.length === 0) return;

		if (changelogEntries.length > 0) {
			const mostRecentEntry = changelogEntries[0];
			if (
				new Date(mostRecentEntry.date).getTime() ===
				new Date(lastViewedDateString ?? 0).getTime()
			)
				return;
			setLastViewedDate(mostRecentEntry.date.toISOString());
		}
	}, [
		setLastViewedDate,
		changelogQuery.data,
		lastViewedDateString,
		hasHydrated,
	]);

	useEffect(() => {
		// load more changelog entries when the scroll reaches the bottom
		const handleScroll = () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight - 100
			) {
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
		const changelogEntries =
			changelogQuery.data?.pages.flatMap((page) => page.entries) || [];
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

	if (isLoading)
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center">
						<Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
						<h3 className="text-lg font-semibold mb-2">Loading changelog...</h3>
						<p className="text-muted-foreground">
							Fetching the latest updates for you.
						</p>
					</div>
				</CardContent>
			</Card>
		);

	if (changelogQuery.isError)
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center">
						<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Failed to load changelog
						</h3>
						<p className="text-muted-foreground mb-4">
							{changelogQuery.error.message}
						</p>
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
		);

	const entries =
		changelogQuery.data.pages.flatMap((page) => page.entries) || [];

	if (entries.length === 0)
		return (
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
		);

	return (
		<div className="flex flex-col gap-6">
			{entries.map((entry) => (
				<ChangelogEntryCard
					showEditButton={showEditButton}
					key={entry.id}
					entry={entry}
					isNew={
						lastViewedDate.current !== undefined
							? entry.date > lastViewedDate.current
							: undefined
					}
				/>
			))}
		</div>
	);
}
