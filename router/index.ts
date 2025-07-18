import { getChangelogEntry, last5Changelog, paginatedChangelog, upsertChangelogEntry } from "./changelog";
import { getFriendsRaids } from "./friendRaids";
import { getFriends, getFriendRequests, respondToFriendRequest, revokeRequest, sendFriendRequest, revokeFriendship } from "./friends";
import { getMarketPrices } from "./market";
import { getServerStatus } from "./serverStatus";
import { listUsersInfinite, count, graphData } from "./users";

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
    last5Changelog,
    getChangelogEntry,
    upsertChangelogEntry
  },
  market: {
    getMarketPrices
  },
  users: {
    listUsersInfinite,
    count,
    graphData
  }
}
