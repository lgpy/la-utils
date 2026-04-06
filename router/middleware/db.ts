import { os } from "@orpc/server";
import prisma from "@/lib/db";
import type { PrismaClient } from "@/prisma/generated/client";

export const dbProviderMiddleware = os
	.$context<{ db?: PrismaClient }>()
	.middleware(async ({ context, next }) => {
		/**
		 * Why we should ?? here?
		 * Because it can avoid `createFakeDB` being called when unnecessary.
		 * {@link https://orpc.unnoq.com/docs/best-practices/dedupe-middleware}
		 */
		const db = context.db ?? prisma;

		return next({
			context: {
				db,
			},
		});
	});
