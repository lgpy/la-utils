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
import { orpc } from "@/lib/orpc";
import { useChangelogStore } from "@/providers/ChangelogStoreProvider";
import { useQuery } from "@tanstack/react-query";
import { Bell, BellRing } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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

	const changelogEntries = useQuery(
		orpc.changelog.last5Changelog.queryOptions({
			input: {
				lastViewedDate: lastViewedDate ?? new Date(0).toISOString(),
			},
			enabled: isHydrated,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false,
		}),
	);

	const friendRequestNotifications = useMemo(() => {
		if (!friendRequestQuery.data) return [];
		return friendRequestQuery.data.received.map((request) => ({
			id: request.id,
			title: `New friend request from ${request.name}`,
			date: new Date(request.createdAt),
		}));
	}, [friendRequestQuery.data]);

	const entries: NotificationEntry[] = useMemo(() => {

		return [
			...changelogEntries.data?.map((entry) => ({
				type: "changelog" as const,
				id: `cl-${entry.id}`,
				title: entry.title,
				date: entry.date,
			})) ?? [],
			...friendRequestNotifications.map((request) => ({
				type: "friendRequest" as const,
				id: `fr-${request.id}`,
				title: request.title,
				date: request.date,
			})),
		].sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [changelogEntries.data, friendRequestNotifications]);

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
