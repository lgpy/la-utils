import * as v from "valibot";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;

export async function isDiscordAvatarValid(url: string): Promise<boolean> {
	if (url.startsWith("https://cdn.discordapp.com/embed/avatars/")) {
		return false; // This is a default avatar URL, not a custom avatar
	}
	const res = await fetch(url, { method: "HEAD" });
	return res.ok;
}

export function getAvatarUrl(userId: string, hash: string): string {
	if (hash.startsWith("a_")) {
		return `https://cdn.discordapp.com/avatars/${userId}/${hash}.gif`;
	}
	return `https://cdn.discordapp.com/avatars/${userId}/${hash}.png`;
}

const discordUserSchema = v.object({
	id: v.string(),
	username: v.string(),
	discriminator: v.string(),
	avatar: v.nullable(v.string()),
	global_name: v.nullable(v.string()),
});

export async function fetchDiscordUser(userId: string) {
	if (!DISCORD_BOT_TOKEN) {
		throw new Error("DISCORD_BOT_TOKEN is not set");
	}
	const res = await fetch(`https://discord.com/api/users/${userId}`, {
		headers: {
			Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
		},
	});
	if (!res.ok) return null;
	const data = await res.json();
	return v.parse(discordUserSchema, data);
}
