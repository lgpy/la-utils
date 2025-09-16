import { z } from "zod";

export const respondSchema = z.object({
	userId: z.string(),
	action: z.enum(["accept", "reject"]),
});

export const revokeRequestSchema = z.object({
	userId: z.string(),
});

export const sendRequestSchema = z.object({
	userId: z.string(),
});

export const revokeFriendshipSchema = z.object({
	friendId: z.string(),
});
