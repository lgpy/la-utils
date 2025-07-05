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
import { authClient } from "@/lib/auth";
import {
	fetchChangelogEntries,
	type ChangelogEntryWithNew,
} from "@/lib/changelog";
import { orpc } from "@/lib/orpc";
import { useChangelogStore } from "@/providers/ChangelogStoreProvider";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellRing } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";

type NotificationEntry = {
	type: "friendRequest" | "changelog";
	id: string;
	title: string;
	date: Date;
};

export default function NotificationDropdown() {
	const { lastViewedDate, isHydrated } = useChangelogStore();
	const session = authClient.useSession();

	const friendRequestQuery = useQuery(
		orpc.friends.getFriendRequests.queryOptions({
			enabled: session.data !== null,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		}),
	);

	const [changelogNotifications, setChangelogNotifications] = useState<{
		entries: NotificationEntry[];
		total: number;
	}>({
		entries: [],
		total: 0,
	});

	// Fetch new entries function
	const fetchNewEntries = useCallback(async () => {
		try {
			const response = await fetchChangelogEntries({
				newerThan: lastViewedDate !== null ? lastViewedDate : undefined,
				limit: 5, // Keep limit low, use total from pagination
			});

			setChangelogNotifications({
				entries: response.entries.map((entry: ChangelogEntryWithNew) => ({
					id: entry.id,
					type: "changelog",
					title: entry.title,
					date: new Date(entry.date),
				})),
				total: response.pagination.total,
			});
		} catch (error) {
			console.error("Failed to fetch new notifications:", error);
		}
	}, [lastViewedDate]);

	// Fetch new entries when component mounts
	useEffect(() => {
		if (!isHydrated) return;
		fetchNewEntries();
	}, [fetchNewEntries, isHydrated]);

	const friendRequestNotifications = useMemo(() => {
		if (!friendRequestQuery.data) return [];
		return friendRequestQuery.data.received.map((request) => ({
			id: request.id,
			title: `New friend request from ${request.name}`,
			type: "friendRequest",
			date: new Date(request.createdAt),
		}));
	}, [friendRequestQuery.data]);

	const entries = [
		...changelogNotifications.entries,
		...friendRequestNotifications,
	].sort((a, b) => {
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	const hasUnread = entries.length > 0;
	const totalCount = entries.length;

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
						Notifications
					</h4>
				</div>
				<DropdownMenuSeparator />

				{hasUnread ? (
					<>
						<div className="max-h-96 overflow-y-auto">
							{entries.map((entry) => {
								let href = "";
								if (entry.type === "changelog") {
									href = `/changelog#${entry.id}`;
								} else if (entry.type === "friendRequest") {
									href = "/friends";
								}

								return (
									<DropdownMenuItem
										key={entry.id}
										asChild
										className="cursor-pointer"
									>
										<Link href={href} className="block p-3 space-y-1">
											<div className="flex items-center gap-2 min-w-0">
												<p className="text-sm font-medium truncate flex-1 min-w-0">
													{entry.title}
												</p>
											</div>
										</Link>
									</DropdownMenuItem>
								);
							})}
						</div>
					</>
				) : (
					<div className="p-4 text-center">
						<p className="text-sm text-muted-foreground mb-2">
							There are no new notifications
						</p>
						<p className="text-xs text-muted-foreground">
							You&apos;re all caught up! Check back later for updates.
						</p>
					</div>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
