"use client";

import { orpc, OrpcOutputs } from "@/lib/orpc";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
	initialData?: OrpcOutputs["users"]["listUsersInfinite"];
	userCount: number;
	activeUsers: number;
	className?: string;
	scrollArea?: {
		className?: string;
	};
}

export default function UserList({
	initialData,
	userCount,
	className,
	scrollArea,
	activeUsers,
}: Props) {
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const userQuery = useInfiniteQuery(
		orpc.users.listUsersInfinite.infiniteOptions({
			input: (cursor) => ({ cursor, limit: 20 }),
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: 0,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: false,
			initialData: initialData
				? {
						pages: [initialData],
						pageParams: [0],
					}
				: undefined,
		})
	);

	useEffect(() => {
		const scrollArea = scrollAreaRef.current;
		if (!scrollArea) return;

		// Find the actual scrollable viewport within the ScrollArea
		const viewport = scrollArea.querySelector(
			"[data-radix-scroll-area-viewport]"
		) as HTMLElement;
		if (!viewport) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = viewport;

			// Check if we're near the bottom (within 50px for better UX)
			if (scrollHeight - scrollTop <= clientHeight + 50) {
				if (userQuery.hasNextPage && !userQuery.isFetchingNextPage) {
					userQuery.fetchNextPage();
				}
			}
		};

		viewport.addEventListener("scroll", handleScroll);
		return () => viewport.removeEventListener("scroll", handleScroll);
	}, [userQuery]);

	const users = userQuery.data?.pages.flatMap((page) => page.entries) || [];

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Users</CardTitle>
				<CardDescription>
					Total Users: {userCount} ({activeUsers} active)
				</CardDescription>
				{userQuery.isFetchingNextPage && (
					<CardAction>
						<Loader2 className="animate-spin" />
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="p-0">
				<ScrollArea
					ref={scrollAreaRef}
					className={cn("h-[400px] px-6", scrollArea?.className)}
				>
					<div
						className={cn("flex flex-col", {
							"divide-border divide-y": users.length > 0,
						})}
					>
						{userQuery.isLoading ? (
							<div className="flex justify-center p-4">
								<Loader2 className="animate-spin" />
							</div>
						) : (
							users.map((user) => (
								<div
									key={user.id}
									className="flex flex-row gap-6 items-center justify-between p-2"
								>
									<div className="flex items-center gap-2">
										<Avatar className="size-12">
											<AvatarImage src={user.image ?? undefined} />
											<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
										</Avatar>
										{user.name}
									</div>
									{user.createdAt.toLocaleDateString("pt-PT")}
								</div>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
