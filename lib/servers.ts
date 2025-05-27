export enum ServerStatus {
	ONLINE = 0,
	OFFLINE = 1,
	BUSY = 2,
	FULL = 3,
	MAINTENANCE = 4,
}

// Create a Map for storing server status information
export const serverMap = new Map<string, ServerStatus>();

// Initialize the Map with server data
const initializeServerMap = () => {
	// NAW servers
	serverMap.set("Thaemine", ServerStatus.OFFLINE);
	serverMap.set("Brelshaza", ServerStatus.OFFLINE);

	// NAE servers
	serverMap.set("Luterra", ServerStatus.OFFLINE);
	serverMap.set("Balthorr", ServerStatus.OFFLINE);
	serverMap.set("Nineveh", ServerStatus.OFFLINE);
	serverMap.set("Inanna", ServerStatus.OFFLINE);
	serverMap.set("Vairgrys", ServerStatus.OFFLINE);

	// EUC servers
	serverMap.set("Ortuus", ServerStatus.OFFLINE);
	serverMap.set("Elpon", ServerStatus.OFFLINE);
	serverMap.set("Ratik", ServerStatus.OFFLINE);
	serverMap.set("Arcturus", ServerStatus.OFFLINE);
	serverMap.set("Gienah", ServerStatus.OFFLINE);
};

// Initialize the server map on module load
initializeServerMap();

/**
 * Gets the status of a server
 * @param server The name of the server
 * @returns The server status, or OFFLINE if server not found
 */
export function getServerStatus(server: string): ServerStatus {
	return serverMap.get(server) ?? ServerStatus.OFFLINE;
}

/**
 * Converts a server status to a human-readable string
 * @param status The server status
 * @returns A string representation of the status
 */
export function getServerStatusString(status: ServerStatus): string {
	switch (status) {
		case ServerStatus.OFFLINE:
			return "Offline";
		case ServerStatus.ONLINE:
			return "Online";
		case ServerStatus.FULL:
			return "Online - Full";
		case ServerStatus.BUSY:
			return "Online - Busy";
		case ServerStatus.MAINTENANCE:
			return "In Maintenance";
	}
}

/**
 * Sets the status of a server
 * @param server The name of the server
 * @param status The new status
 */
export function setServerStatus(server: string, status: ServerStatus): void {
	if (serverMap.has(server)) {
		serverMap.set(server, status);
	} else {
		// For unknown servers (should not happen in practice)
		console.warn(`Attempted to set status for unknown server: ${server}`);
	}
}
