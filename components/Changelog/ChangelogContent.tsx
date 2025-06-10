"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	getDetailCategoryColor,
	fetchChangelogEntries,
	type ChangelogEntryWithNew,
	type PaginationInfo,
} from "@/lib/changelog";
import { useChangelogStore } from "@/providers/ChangelogStoreProvider";
import { format } from "date-fns";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

interface ChangelogEntryCardProps {
	entry: ChangelogEntryWithNew;
}

function ChangelogEntryCard({ entry }: ChangelogEntryCardProps) {
	const isNew = entry.isNew === true;

	// Parse d/m/y date format to Date object
	const parseDate = (dateString: string): Date => {
		const [day, month, year] = dateString.split("/").map(Number);
		return new Date(year, month - 1, day);
	};

	return (
		<Card id={entry.id}>
			<CardHeader className="flex justify-between items-start">
				<div>
					<CardTitle className="text-lg flex items-center justify-between">
						<span>{entry.title}</span>
					</CardTitle>
					<CardDescription className="flex items-center gap-2 mt-1">
						<span>{format(parseDate(entry.date), "MMM dd, yyyy")}</span>
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
						{entry.details.map(([category, detail], index) => (
							<li
								key={`${entry.id}-detail-${index}`}
								className="grid grid-cols-[60px_1fr] gap-3 items-start"
							>
								<Badge
									variant="secondary"
									className={`text-xs px-2 py-0.5 w-full justify-center ${getDetailCategoryColor(category)}`}
								>
									{category}
								</Badge>
								<span className="text-sm">{detail}</span>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

export default function ChangelogContent() {
	const { setLastViewedDate, lastViewedDate } = useChangelogStore();

	// Local state for component logic
	const [entries, setEntries] = useState<ChangelogEntryWithNew[]>([]);
	const [pagination, setPagination] = useState<PaginationInfo | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasScrolledToHash, setHasScrolledToHash] = useState(false);

	// Fetch entries function
	const fetchEntries = useCallback(
		async (page = 1, limit = 10) => {
			if (page === 1) {
				setIsLoading(true);
				setError(null);
			} else {
				setIsLoadingMore(true);
				setError(null);
			}

			try {
				const response = await fetchChangelogEntries({
					lastViewedDate,
					page,
					limit,
				});

				if (page === 1) {
					setEntries(response.entries);
					setPagination(response.pagination);
					setCurrentPage(page);
					setIsLoading(false);
				} else {
					// Append to existing entries for pagination
					setEntries((prev) => [...prev, ...response.entries]);
					setPagination(response.pagination);
					setCurrentPage(page);
					setIsLoadingMore(false);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to fetch changelog";
				setError(errorMessage);
				setIsLoading(false);
				setIsLoadingMore(false);
			}
		},
		[lastViewedDate],
	);

	// Load next page function
	const loadNextPage = async () => {
		if (pagination?.hasNext) {
			await fetchEntries(currentPage + 1);
		}
	};

	// Fetch entries on component mount
	useEffect(() => {
		fetchEntries(1, 10);
	}, [fetchEntries]);

	// Handle scrolling to specific entry if hash is present (only run once)
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.location.hash &&
			entries.length > 0 &&
			!hasScrolledToHash
		) {
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
					setHasScrolledToHash(true);
				}
			}, 100); // Small delay to ensure DOM is ready
		}
	}, [entries.length, hasScrolledToHash]); // Only run when entries are loaded and haven't scrolled yet

	// Mark as viewed when user leaves the page
	useEffect(() => {
		const handleBeforeUnload = () => {
			setLastViewedDate(new Date().toISOString());
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			// Mark as viewed when component unmounts
			setLastViewedDate(new Date().toISOString());
		};
	}, [setLastViewedDate]);

	const sortedEntries = [...entries].sort((a, b) => {
		const parseDate = (dateString: string): Date => {
			const [day, month, year] = dateString.split("/").map(Number);
			return new Date(year, month - 1, day);
		};
		return parseDate(b.date).getTime() - parseDate(a.date).getTime();
	});

	const handleLoadMore = () => {
		loadNextPage();
	};

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

				{error && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									Failed to load changelog
								</h3>
								<p className="text-muted-foreground mb-4">{error}</p>
								<button
									type="button"
									onClick={() => fetchEntries(1, 1)}
									className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
								>
									Try Again
								</button>
							</div>
						</CardContent>
					</Card>
				)}

				{!isLoading && !error && (
					<div className="flex flex-col gap-6">
						{sortedEntries.map((entry) => (
							<ChangelogEntryCard key={entry.id} entry={entry} />
						))}

						{pagination?.hasNext && (
							<div className="flex justify-center mt-8">
								<Button
									onClick={handleLoadMore}
									variant="outline"
									disabled={isLoadingMore}
								>
									{isLoadingMore ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Loading more...
										</>
									) : (
										"Load More"
									)}
								</Button>
							</div>
						)}

						{pagination && (
							<div className="text-center text-sm text-muted-foreground mt-4">
								Showing {entries.length} of {pagination.total} entries
							</div>
						)}
					</div>
				)}

				{!isLoading && !error && sortedEntries.length === 0 && (
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<div className="text-center">
								<Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No changelog entries yet
								</h3>
								<p className="text-muted-foreground">
									Check back later for updates and new features.
								</p>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
