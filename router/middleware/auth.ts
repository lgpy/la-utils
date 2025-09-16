import { auth, Session } from "@/lib/auth.server";
import { os } from "@orpc/server";
import { headers } from "next/headers";

export const requiredAuthMiddleware = os
	.$context<{ session?: Session }>()
	.middleware(async ({ context, next }) => {
		if (auth === null) {
			throw new Error("AUTH_NOT_INITIALIZED");
		}

		const session =
			context.session ??
			(await auth.api.getSession({
				headers: await headers(),
			}));

		if (!session) {
			throw new Error("UNAUTHORIZED");
		}

		return next({
			context: { session: session },
		});
	});

export const optionalAuthMiddleware = os
	.$context<{ session?: Session }>()
	.middleware(async ({ context, next }) => {
		if (auth === null) {
			throw new Error("AUTH_NOT_INITIALIZED");
		}

		const session =
			context.session ??
			(await auth.api.getSession({
				headers: await headers(),
			}));

		return next({
			context: { session: session ?? undefined },
		});
	});
