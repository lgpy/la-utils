"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import CopyButton from "@/components/CopyButton";
import { showAlert } from "@/components/AlertDialog.hooks";

type User = {
	id: string;
	name: string;
	image: string | null;
};

export default function FriendsPage() {
	const session = authClient.useSession();
	const userId = session.data?.user.id;

	const friendQuery = useQuery(
		orpc.friends.getFriends.queryOptions({
			enabled: session.data !== null,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
		})
	);
	const requestsQuery = useQuery(
		orpc.friends.getFriendRequests.queryOptions({
			enabled: session.data !== null,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
		})
	);
	const recommendedQuery = useQuery(
		orpc.friends.getRecommendedFriends.queryOptions({
			enabled: session.data !== null,
			refetchOnMount: false,
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
			input: { count: 5 },
		})
	);

	return (
		<main className="py-8 px-4 flex flex-col lg:flex-row gap-6 justify-center">
			<div className="flex flex-col gap-6 w-full max-w-md">
				<Card>
					<CardHeader>
						<CardTitle>Add Friend</CardTitle>
					</CardHeader>
					<CardContent>
						<AddFriendForm
							disabled={session.isPending || !userId}
							userId={userId}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Friend Requests</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						{requestsQuery.isLoading ? (
							<div>Loading...</div>
						) : requestsQuery.isError ? (
							<div className="text-destructive">
								Failed to load friend requests.
							</div>
						) : requestsQuery.data?.received.length === 0 ? (
							<div className="text-muted-foreground">No friend requests.</div>
						) : (
							requestsQuery.data?.received.map((req) => (
								<FriendRequestItem key={req.id} req={req} />
							))
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Sent Friend Requests</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						{requestsQuery.isLoading ? (
							<div>Loading...</div>
						) : requestsQuery.isError ? (
							<div className="text-destructive">
								Failed to load sent requests.
							</div>
						) : requestsQuery.data?.sent.length === 0 ? (
							<div className="text-muted-foreground">No sent requests.</div>
						) : (
							requestsQuery.data?.sent.map((req) => (
								<SentFriendRequestItem key={req.id} req={req} />
							))
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recommended Friends</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1">
						{recommendedQuery.isLoading ? (
							<div>Loading...</div>
						) : recommendedQuery.isError ? (
							<div className="text-destructive">
								Failed to load recommendations.
							</div>
						) : recommendedQuery.data?.length === 0 ? (
							<div className="text-muted-foreground">
								No recommendations found.
							</div>
						) : (
							recommendedQuery.data?.map((user) => (
								<RecommendedFriendItem key={user.id} user={user} />
							))
						)}
					</CardContent>
				</Card>
			</div>
			<div className="flex flex-col gap-6 w-full max-w-md lg:max-w-2xl">
				<Card>
					<CardHeader>
						<CardTitle>Friends</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-2">
						{friendQuery.isLoading ? (
							<div>Loading...</div>
						) : friendQuery.isError ? (
							<div className="text-destructive">
								Failed to load friends. Please try again later.
							</div>
						) : friendQuery.isSuccess && friendQuery.data.length === 0 ? (
							<div className="text-muted-foreground">No friends yet.</div>
						) : (
							friendQuery.data?.map((friend) => (
								<FriendItem key={friend.id} friend={friend} />
							))
						)}
					</CardContent>
				</Card>
			</div>
		</main>
	);

	function RecommendedFriendItem({ user }: { user: User }) {
		const queryClient = useQueryClient();
		const sendFriendRequestMutation = useMutation(
			orpc.friends.sendFriendRequest.mutationOptions({
				onSuccess: (_, context) => {
					toast.success("Friend request sent successfully");
					queryClient.setQueryData(
						orpc.friends.getRecommendedFriends.queryKey({
							input: { count: 5 },
						}),
						(oldData) => {
							return oldData?.filter((u) => u.id !== context.userId) || [];
						}
					);
				},
				onError: (error) => {
					toast.error("Failed to send friend request", {
						description: error.message,
					});
				},
				onSettled: () => {
					queryClient.invalidateQueries({
						queryKey: orpc.friends.getFriendRequests.queryKey({}),
					});
				},
			})
		);
		return (
			<UserCard user={user}>
				<Button
					size="sm"
					variant="default"
					onClick={() => sendFriendRequestMutation.mutate({ userId: user.id })}
					disabled={sendFriendRequestMutation.isPending}
				>
					Add Friend
				</Button>
			</UserCard>
		);
	}
}

function AddFriendForm({
	disabled = false,
	userId,
}: {
	disabled?: boolean;
	userId: string | undefined;
}) {
	const [userIdToFriend, setUserIdToFriend] = useState("");

	const queryClient = useQueryClient();
	const sendFriendRequestMutation = useMutation(
		orpc.friends.sendFriendRequest.mutationOptions({
			onSuccess: () => {
				toast.success("Friend request sent successfully");
				setUserIdToFriend("");
			},
			onError: (error) => {
				toast.error("Failed to send friend request", {
					description: error.message,
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.friends.getFriendRequests.queryKey({}),
				});
			},
		})
	);

	return (
		<div className="gap-2 flex flex-col">
			<Input
				type="text"
				value={userIdToFriend}
				onChange={(e) => setUserIdToFriend(e.target.value)}
				placeholder="Enter User ID..."
				required
				disabled={disabled || sendFriendRequestMutation.isPending}
			/>
			<div className="flex justify-between">
				<CopyButton variant="secondary" textToCopy={userId ?? ""}>
					Copy my User ID
				</CopyButton>
				<Button
					onClick={() => {
						sendFriendRequestMutation.mutate({
							userId: userIdToFriend,
						});
					}}
					disabled={disabled || sendFriendRequestMutation.isPending}
				>
					Send Friend Request
				</Button>
			</div>
		</div>
	);
}

function FriendRequestItem({ req }: { req: User }) {
	const queryClient = useQueryClient();

	const respondMutation = useMutation(
		orpc.friends.respondToFriendRequest.mutationOptions({
			onSuccess: () => {
				toast.success("Friend request responded successfully");
			},
			onError: (error) => {
				toast.error("Failed to respond to friend request", {
					description: error.message,
				});
			},
			onSettled(data, error, variables) {
				if (variables.action === "accept") {
					queryClient.invalidateQueries({
						queryKey: orpc.friends.getFriends.queryKey({}),
					});
					queryClient.invalidateQueries({
						queryKey: orpc.friends.getFriendRequests.queryKey({}),
					});
				} else {
					queryClient.invalidateQueries({
						queryKey: orpc.friends.getFriendRequests.queryKey({}),
					});
				}
			},
		})
	);

	return (
		<UserCard user={req}>
			<Button
				size="sm"
				variant="outline"
				onClick={() =>
					respondMutation.mutate({
						userId: req.id,
						action: "accept",
					})
				}
				disabled={respondMutation.isPending}
			>
				Accept
			</Button>
			<Button
				size="sm"
				variant="ghost"
				onClick={() =>
					respondMutation.mutate({
						userId: req.id,
						action: "reject",
					})
				}
				disabled={respondMutation.isPending}
			>
				Decline
			</Button>
		</UserCard>
	);
}

function SentFriendRequestItem({ req }: { req: User }) {
	const queryClient = useQueryClient();

	const sendFriendRequestMutation = useMutation(
		orpc.friends.sendFriendRequest.mutationOptions({
			onSuccess: () => {},
			onError: (error) => {
				toast.error("Failed to send friend request", {
					description: error.message,
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.friends.getFriendRequests.queryKey({}),
				});
			},
		})
	);

	const revokeMutation = useMutation(
		orpc.friends.revokeRequest.mutationOptions({
			onSuccess: () => {
				toast.success("Friend request revoked successfully", {
					action: {
						label: "Undo",
						onClick: () => {
							sendFriendRequestMutation.mutate({
								userId: req.id,
							});
						},
					},
				});
			},
			onError: (error) => {
				toast.error("Failed to revoke friend request", {
					description: error.message,
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.friends.getFriendRequests.queryKey({}),
				});
			},
		})
	);

	return (
		<UserCard user={req}>
			<Button
				size="sm"
				variant="ghost"
				onClick={() =>
					revokeMutation.mutate({
						userId: req.id,
					})
				}
				disabled={revokeMutation.isPending}
			>
				Revoke
			</Button>
		</UserCard>
	);
}

function FriendItem({ friend }: { friend: User }) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation(
		orpc.friends.revokeFriendship.mutationOptions({
			onSuccess: () => {
				toast.success("Friend removed successfully");
			},
			onError: (error) => {
				toast.error("Failed to remove friend", {
					description: error.message,
				});
			},
			onSettled: () => {
				queryClient.invalidateQueries({
					queryKey: orpc.friends.getFriends.queryKey({}),
				});
			},
		})
	);

	return (
		<UserCard user={friend}>
			<Button
				size="sm"
				variant="destructive"
				onClick={async () => {
					try {
						const decision = await showAlert({
							title: "Remove Friend",
							description: `Are you sure you want to remove ${friend.name || friend.id} from your friends?`,
							confirmButton: { text: "Remove" },
							cancelButton: { text: "Cancel" },
						});

						if (decision) {
							deleteMutation.mutate({ friendId: friend.id });
						}
					} catch (error) {
						console.error(
							"Alert error:",
							error instanceof Error ? error.message : error
						);
					}
				}}
				disabled={deleteMutation.isPending}
			>
				Remove
			</Button>
		</UserCard>
	);
}

interface UserCardProps {
	user: User;
	children?: React.ReactNode;
}

function UserCard({ user, children }: UserCardProps) {
	return (
		<div className="flex items-center gap-3 border rounded-md px-3 py-2 mb-2 justify-between">
			<div className="flex items-center gap-3 min-w-0">
				<Avatar>
					<AvatarImage src={user.image ?? undefined} alt={user.name} />
					<AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<div className="font-medium truncate">{user.name || user.id}</div>
					<div className="text-xs text-muted-foreground break-all truncate">
						{user.id}
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2">{children}</div>
		</div>
	);
}
