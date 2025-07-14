import { last5Changelog, paginatedChangelog } from "./changelog";
import { getFriendsRaids } from "./friendRaids";
import { getFriends, getFriendRequests, respondToFriendRequest, revokeRequest, sendFriendRequest, revokeFriendship } from "./friends";
import { getMarketPrices } from "./market";
import { getServerStatus } from "./serverStatus";

export const router = {
  friends: {
    getFriends,
    getFriendRequests,
    respondToFriendRequest,
    revokeRequest,
    revokeFriendship,
    sendFriendRequest,
  },
  friendRaids: {
    getFriendsRaids
  },
  serverStatus: {
    getServerStatus
  },
  changelog: {
    paginatedChangelog,
    last5Changelog
  },
  market:{
    getMarketPrices
  }
}
