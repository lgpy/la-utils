"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	fetchChangelogEntries,
	type ChangelogEntryWithNew,
} from "@/lib/changelog";
import { useChangelogStore } from "@/providers/ChangelogStoreProvider";
import { Bell, BellRing } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

export default function ChangelogNotification() {
	const { lastViewedDate } = useChangelogStore();

	// Local state for notification logic
	const [newEntries, setNewEntries] = useState<ChangelogEntryWithNew[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoadingNew, setIsLoadingNew] = useState(false);

	// Fetch new entries function
	const fetchNewEntries = useCallback(async () => {
		setIsLoadingNew(true);

		try {
			if (!lastViewedDate) {
				// For first-time users, fetch recent entries (limit to avoid overwhelming)
				const response = await fetchChangelogEntries({
					limit: 5, // Just show recent entries for first-time users
				});

				setNewEntries(response.entries);
				setTotalCount(response.pagination.total);
			} else {
				// For returning users, fetch only newer entries
				const response = await fetchChangelogEntries({
					newerThan: lastViewedDate,
					limit: 5, // Keep limit low, use total from pagination
				});

				setNewEntries(response.entries);
				setTotalCount(response.pagination.total);
			}
		} catch (error) {
			console.error("Failed to fetch new entries:", error);
		} finally {
			setIsLoadingNew(false);
		}
	}, [lastViewedDate]);

	// Helper functions
	const hasUnreadEntries = () => totalCount > 0;
	const getUnreadEntries = () => newEntries;

	// Fetch new entries when component mounts
	useEffect(() => {
		fetchNewEntries();
	}, [fetchNewEntries]);

	const unreadEntries = getUnreadEntries();
	const hasUnread = hasUnreadEntries();

	// Always show dropdown, even when no new updates
	const showDropdown = true;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					{hasUnread ? (
						<BellRing className="h-5 w-5" />
					) : (
						<Bell className="h-5 w-5" />
					)}
					{hasUnread && (
						<span className="absolute -top-1 -right-1 flex size-5">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
							<Badge
								variant="destructive"
								className="relative h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
							>
								{totalCount}
							</Badge>
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex items-center justify-between p-2">
					<h4 className="font-semibold">
						{hasUnread ? "New Updates" : "Changelog"}
					</h4>
				</div>
				<DropdownMenuSeparator />

				{hasUnread ? (
					<>
						<div className="max-h-96 overflow-y-auto">
							{unreadEntries.slice(0, 5).map((entry) => (
								<DropdownMenuItem
									key={entry.id}
									asChild
									className="cursor-pointer"
								>
									<Link
										href={`/changelog#${entry.id}`}
										className="block p-3 space-y-1"
									>
										<div className="flex items-center gap-2 min-w-0">
											<p className="text-sm font-medium truncate flex-1 min-w-0">
												{entry.title}
											</p>
										</div>
									</Link>
								</DropdownMenuItem>
							))}
						</div>
						{totalCount > 5 && (
							<div className="p-2 text-center text-sm text-muted-foreground">
								+ {totalCount - 5} more
							</div>
						)}
						<DropdownMenuSeparator />
					</>
				) : (
					<>
						<div className="p-4 text-center">
							<p className="text-sm text-muted-foreground mb-2">
								There are no new updates
							</p>
							<p className="text-xs text-muted-foreground">
								You&apos;re all caught up! Check back later for new features and
								improvements.
							</p>
						</div>
						<DropdownMenuSeparator />
					</>
				)}

				<DropdownMenuItem asChild>
					<Link
						href="/changelog"
						className="block p-2 text-center text-sm font-medium"
					>
						View Full Changelog
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
