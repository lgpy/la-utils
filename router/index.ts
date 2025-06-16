
import { getFriendsRaids } from "./friendRaids";
import { getFriends, getFriendRequests, respondToFriendRequest, revokeRequest, sendFriendRequest, revokeFriendship } from "./friends";

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
  }
}
