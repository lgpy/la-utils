import { getFriendsRaids } from "./friendRaids";
import { getFriends, getFriendRequests, respondToFriendRequest, revokeRequest, sendFriendRequest, revokeFriendship } from "./friends";
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
  }
}
