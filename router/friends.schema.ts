import * as v from 'valibot';

export const respondSchema = v.object({
	userId: v.string(),
	action: v.picklist(["accept", "reject"]),
});

export const revokeRequestSchema = v.object({
	userId: v.string(),
});

export const sendRequestSchema = v.object({
	userId: v.string(),
});

export const revokeFriendshipSchema = v.object({
	friendId: v.string(),
});
