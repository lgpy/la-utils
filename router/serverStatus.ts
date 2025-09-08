import { ORPCError, os } from "@orpc/server";
import { dbProviderMiddleware } from "./middleware/db";
import { z } from "zod";
import { ServerName, ServerStatus } from "@/generated/prisma";
import * as cheerio from "cheerio";

async function fetchServerStatus() {
	const response = await fetch(
		"https://www.playlostark.com/en-us/support/server-status"
	);
	if (!response.ok) {
		throw new Error(`Failed to fetch server status: ${response.statusText}`);
	}
	const html = await response.text();
	const $ = cheerio.load(html, { xml: true });

	const serverMap = new Map<ServerName, ServerStatus>();

	$("div.ags-ServerStatus-content-responses-response-server").each((i, el) => {
		const name = $(el)
			.find("div.ags-ServerStatus-content-responses-response-server-name")
			.text()
			.trim()
			.split(" ")[0]
			.trim();

		if (ServerName[name as keyof typeof ServerName] === undefined) {
			// Skip if server name is not recognized
			console.warn(`Unknown server name: ${name}`);
			return;
		}

		if (serverMap.has(name as ServerName)) {
			// Skip if server already processed
			console.warn(`Duplicate server found: ${name}`);
			return;
		}

		const status = $(el).find(
			"div.ags-ServerStatus-content-responses-response-server-status"
		);

		// Determine server status based on class names
		if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--good"
			)
		) {
			serverMap.set(name as ServerName, ServerStatus.ONLINE);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--busy"
			)
		) {
			serverMap.set(name as ServerName, ServerStatus.BUSY);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--full"
			)
		) {
			serverMap.set(name as ServerName, ServerStatus.FULL);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--maintenance"
			)
		) {
			serverMap.set(name as ServerName, ServerStatus.MAINTENANCE);
		}
	});

	return serverMap;
}

const POLLING_INTERVALS = {
	FAST: 5 * 60 * 1000, // 5 minutes for offline/maintenance
	SLOW: 60 * 60 * 1000, // 1 hour for online servers
} as const;

function isStatusOld(updatedAt: Date, status: ServerStatus): boolean {
	const isOfflineOrMaintenance =
		status === ServerStatus.OFFLINE || status === ServerStatus.MAINTENANCE;

	const pollingInterval = isOfflineOrMaintenance
		? POLLING_INTERVALS.FAST
		: POLLING_INTERVALS.SLOW;

	return updatedAt < new Date(Date.now() - pollingInterval);
}

export const getServerStatus = os
	.use(dbProviderMiddleware)
	.input(z.nativeEnum(ServerName))
	.handler(async ({ context: { db }, input }) => {
		const isServerNameValid = Object.values(ServerName).includes(
			input as ServerName
		);
		if (!isServerNameValid) {
			throw new ORPCError("INVALID_ARGUMENT", {
				message: `Invalid server name: ${input}`,
			});
		}

		const serverStatus = await db.server.findUnique({
			where: { id: input },
			select: {
				status: true,
				updatedAt: true,
			},
		});

		if (
			serverStatus === null ||
			isStatusOld(serverStatus.updatedAt, serverStatus.status)
		) {
			const servers_status = await fetchServerStatus();

			const promises = [];

			for (const [name, status] of servers_status.entries()) {
				const p = db.server.upsert({
					where: { id: name },
					create: {
						id: name,
						status,
					},
					update: {
						status,
					},
				});
				promises.push(p);
			}

			await Promise.all(promises);

			const server_status = servers_status.get(input);
			if (server_status === undefined) {
				throw new ORPCError("NOT_FOUND", {
					message: `Server status for ${input} not found`,
				});
			}

			return {
				status: server_status,
				updatedAt: new Date(),
			};
		}

		return serverStatus;
	});
