import {
	ServerStatus,
	getServerStatus,
	serverMap,
	setServerStatus,
} from "@/lib/servers";
import axios from "axios";
import * as cheerio from "cheerio";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = 300;

export type ServerStatusResponse = {
	lastUpdated: number;
	status: ServerStatus;
	error?: string;
};

// Parse the server status HTML and update the server status
const parseServerStatus = (html: string) => {
	const $ = cheerio.load(html, { xml: true });

	$("div.ags-ServerStatus-content-responses-response-server").each((i, el) => {
		const name = $(el)
			.find("div.ags-ServerStatus-content-responses-response-server-name")
			.text()
			.trim()
			.split(" ")[0]
			.trim();

		// Skip if server not found in our map
		if (!serverMap.has(name)) return;

		const status = $(el).find(
			"div.ags-ServerStatus-content-responses-response-server-status",
		);

		// Determine server status based on class names
		if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--good",
			)
		) {
			setServerStatus(name, ServerStatus.ONLINE);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--busy",
			)
		) {
			setServerStatus(name, ServerStatus.BUSY);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--full",
			)
		) {
			setServerStatus(name, ServerStatus.FULL);
		} else if (
			status.hasClass(
				"ags-ServerStatus-content-responses-response-server-status--maintenance",
			)
		) {
			setServerStatus(name, ServerStatus.MAINTENANCE);
		}
	});
};

// Track last update time
let lastUpdatedTimestamp = 0;

export async function GET(request: NextRequest) {
	// Get the server name from URL query parameter
	const url = new URL(request.url);
	const serverName = url.searchParams.get("server");

	// Require server parameter
	if (!serverName) {
		return NextResponse.json(
			{ error: "Missing server parameter" },
			{
				status: 400,
				headers: {
					"Content-Type": "application/json",
				}
			});
	}

	try {
		// Fetch server status data
		const { data: html } = await axios.get(
			"https://www.playlostark.com/en-us/support/server-status",
			{ timeout: 5000 }, // Add timeout to prevent hanging requests
		);

		// Parse the HTML and update server statuses in the map directly
		parseServerStatus(html);

		// Update timestamp
		lastUpdatedTimestamp = new Date().getTime();

		// Return only the requested server's status - direct from the map
		const status = getServerStatus(serverName);
		const response: ServerStatusResponse = {
			lastUpdated: lastUpdatedTimestamp,
			status,
		};

		return NextResponse.json(response, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=300", // Cache for 5 minutes
			},
		});
	} catch (error) {
		console.error("Server status fetch error:", error);

		// If we have a last updated timestamp, we have fetched data before
		if (lastUpdatedTimestamp > 0) {
			const status = getServerStatus(serverName);
			const response: ServerStatusResponse = {
				lastUpdated: lastUpdatedTimestamp,
				status,
				error: "Using cached data due to fetch error",
			};

			return NextResponse.json(response, {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=60", // Short cache time for error responses
				},
			});
		}

		// If no previous fetch, return error with offline status
		const response: ServerStatusResponse = {
			error: "Error fetching server status",
			lastUpdated: new Date().getTime(),
			status: ServerStatus.OFFLINE, // Default to offline when error occurs
		};

		return NextResponse.json(response, {
			status: 503,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
			},
		});
	}
}
