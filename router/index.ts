import { getFriendsRaids } from "./friendRaids";
import {
	getFriends,
	getFriendRequests,
	respondToFriendRequest,
	revokeRequest,
	sendFriendRequest,
	revokeFriendship,
	getRecommendedFriends,
} from "./friends";
import { getMarketPrices } from "./market";
import { listUsersInfinite, count, graphData } from "./users";

export const router = {
	friends: {
		getFriends,
		getFriendRequests,
		respondToFriendRequest,
		revokeRequest,
		revokeFriendship,
		sendFriendRequest,
		getRecommendedFriends,
	},
	friendRaids: {
		getFriendsRaids,
	},
	market: {
		getMarketPrices,
	},
	users: {
		listUsersInfinite,
		count,
		graphData,
	},
};
