import 'server-only'

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin, user } from "./auth.permissions";
import { fetchDiscordUser, getAvatarUrl } from "./discord";

let baseUrl: string;

if (process.env.VERCEL === "1" && process.env.NODE_ENV === "production") {
	baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
} else if (
	process.env.VERCEL === "1" &&
	process.env.NODE_ENV !== "production"
) {
	baseUrl = `https://${process.env.VERCEL_PROJECT_STAGING_URL}`;
} else if (process.env.URL) {
	baseUrl = process.env.URL;
} else if (process.env.BETTER_AUTH_URL) {
	baseUrl = process.env.BETTER_AUTH_URL;
} else {
	baseUrl = "http://localhost:3000";
}

const auth = betterAuth({
	baseURL: baseUrl,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	trustedOrigins: [baseUrl],
	socialProviders: {
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID as string,
			clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
		},
	},
	plugins: [
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	databaseHooks: {
		session: {
			create: {
				before: async ({ userId }) => {
					const existingUser = await prisma.user.findUnique({
						where: { id: userId },
						select: {
							image: true,
							name: true,
						},
					});
					if (!existingUser) {
						console.error(
							`No user found with ID ${userId}. Skipping avatar validation.`
						);
						return;
					}

					const acc = await prisma.account.findFirst({
						where: { providerId: "discord", userId: userId },
					});
					if (!acc) {
						console.error(
							`No Discord account found for user ${userId}. Skipping avatar validation.`
						);
						return;
					}

					try {
						const discordUser = await fetchDiscordUser(acc.accountId);
						if (!discordUser) {
							console.error(
								`Failed to fetch Discord user for account ${acc.accountId}. Skipping avatar validation.`
							);
							return;
						}

						const newAvatarUrl = discordUser.avatar
							? getAvatarUrl(discordUser.id, discordUser.avatar)
							: null;
						const newName = discordUser.global_name || discordUser.username;

						const isNewAvatar = newAvatarUrl !== existingUser.image;
						const isNewName = newName !== existingUser.name;

						await prisma.user.update({
							where: { id: userId },
							data: {
								image: isNewAvatar ? newAvatarUrl : undefined,
								name: isNewName ? newName : undefined,
							},
						});
					} catch {
						console.error(
							`Failed to fetch Discord user for account ${acc.accountId}. Skipping avatar validation.`
						);
						return;
					}
				},
			},
		},
	},
});

export type Session = ReturnType<typeof betterAuth>["$Infer"]["Session"];

type PermissionStatements = {
	[K in keyof typeof ac.statements]?: ((typeof ac.statements)[K] extends readonly unknown[]
		? (typeof ac.statements)[K][number]
		: never)[];
};

export async function hasPermission(
	permissions: PermissionStatements,
	session: Session
): Promise<boolean> {
	const ManagementPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permissions,
		},
	});

	return ManagementPermission.success;
}

export { auth };
