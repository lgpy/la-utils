import { OPFSReadOnlyVFS, SQLite, moduleFactory } from "@/lib/wa-sqlite";

type BaseMessage<T, Y> = {
	type: T;
	payload: Y;
};

type DBInitMessage = BaseMessage<
	"init",
	{
		fileHandle: FileSystemFileHandle;
	}
>;

type DBQueryMessage = BaseMessage<
	"query",
	{
		query: string;
	}
>;

type MessageType = DBInitMessage | DBQueryMessage;

export interface QueryResult {
	columns: string[];
	rows: unknown[][];
}

type InitResponse = BaseMessage<"init", { success: boolean }>;
type QueryResponse = BaseMessage<"query", QueryResult[]>;
type ErrorResponse = BaseMessage<"error", { message: string }>;

export type DBWorkerResponse = InitResponse | QueryResponse | ErrorResponse;

const IDBName = "sqlite-vfs";
const DBName = "encounters.db";

// A query reads a file that LOA Logs may be writing to at the same time, so a
// read can land between two commits. That is transient: retry once on a fresh
// connection before reporting a failure.
const MAX_QUERY_ATTEMPTS = 2;
const TRANSIENT_READ_ERRORS = new Set<number>([
	SQLite.SQLITE_CORRUPT,
	SQLite.SQLITE_NOTADB,
]);

let sqlite3: SQLiteAPI | null = null;
let db: number | null = null;
// biome-ignore lint/suspicious/noExplicitAny: We need to use `any` for dynamic module loading
let wasmModule: any = null;

let wasmUrl: string;
try {
	const resolvedUrl = new URL(
		"../lib/wa-sqlite/dist/wa-sqlite-async.wasm",
		import.meta.url
	).href;

	if (resolvedUrl.startsWith("/")) {
		wasmUrl = `${self.location.origin}${resolvedUrl}`;
	} else {
		wasmUrl = resolvedUrl;
	}
} catch {
	wasmUrl = `${self.location.origin}/_next/static/media/wa-sqlite-async.wasm`;
}

function debug(...args: unknown[]) {
	if (process.env.NODE_ENV !== "production") {
		console.debug(...args);
	}
}

async function openDb(): Promise<number> {
	if (!sqlite3) throw new Error("SQLite not initialized");
	const connection = await sqlite3.open_v2(
		DBName,
		SQLite.SQLITE_OPEN_READONLY | SQLite.SQLITE_OPEN_MAIN_DB,
		IDBName
	);
	db = connection;
	return connection;
}

async function closeDb(): Promise<void> {
	if (!sqlite3 || db === null) return;
	const handle = db;
	db = null;
	try {
		await sqlite3.close(handle);
	} catch (error) {
		// `sqlite3.close` throws when SQLite returns anything but SQLITE_OK (for
		// example SQLITE_BUSY for a statement that is still active). The handle is
		// already detached, so a failure must not take the worker down with it.
		console.warn("Failed to close the LOA Logs database", error);
	}
}

function isTransientReadError(error: unknown) {
	const code = (error as { code?: unknown } | null)?.code;
	return typeof code === "number" && TRANSIENT_READ_ERRORS.has(code);
}

async function execQuery(
	connection: number,
	query: string
): Promise<QueryResult[]> {
	if (!sqlite3) throw new Error("SQLite not initialized");
	const results: QueryResult[] = [];
	await sqlite3.exec(connection, query, (row: unknown[], columns: string[]) => {
		if (columns !== results.at(-1)?.columns) {
			results.push({ columns, rows: [] });
		}
		results.at(-1)?.rows.push(row);
	});
	return results;
}

/**
 * Runs one query against the current file contents.
 *
 * LOA Logs writes to the database continuously and the VFS caches a `File`
 * snapshot per open file, while SQLite caches pages per connection. Reopening
 * the database is therefore the only way to make both caches read the current
 * file. This is metadata-only: the file itself is never copied.
 */
async function runQuery(query: string): Promise<QueryResult[]> {
	const startedAt = performance.now();
	let lastError: unknown;

	for (let attempt = 1; attempt <= MAX_QUERY_ATTEMPTS; attempt++) {
		await closeDb();
		const connection = await openDb();
		try {
			const results = await execQuery(connection, query);
			debug(
				`Query finished in ${(performance.now() - startedAt).toFixed(1)} ms`
			);
			return results;
		} catch (error) {
			lastError = error;
			if (!isTransientReadError(error) || attempt === MAX_QUERY_ATTEMPTS) {
				throw error;
			}
			debug("Transient read error, retrying query", error);
		}
	}

	throw lastError;
}

async function init(fileHandle: FileSystemFileHandle) {
	await closeDb();
	wasmModule = await moduleFactory({
		locateFile: (path: string, _prefix: string) => {
			if (path.endsWith(".wasm")) {
				return wasmUrl;
			}
			return _prefix + path;
		},
	});
	sqlite3 = SQLite.Factory(wasmModule);
	const vfs = await OPFSReadOnlyVFS.create(IDBName, wasmModule, fileHandle, {
		lockPolicy: "shared+hint",
	});
	// @ts-ignore
	sqlite3.vfs_register(vfs, true);
	await openDb();
}

async function handleMessage(message: MessageType) {
	const { type, payload } = message;
	debug("Worker received message:", type);

	if (type === "init") {
		await init(payload.fileHandle);
		postMessage({ type: "init", payload: { success: true } } as InitResponse);
		return;
	}

	if (type === "query") {
		if (!sqlite3) {
			throw new Error(
				"Database not initialized. Please send an 'init' message first."
			);
		}
		const results = await runQuery(payload.query);
		postMessage({ type: "query", payload: results } as QueryResponse);
	}
}

// Messages are handled one at a time: a query closes and reopens the connection,
// so overlapping queries would close the connection another query is reading from.
let queue: Promise<void> = Promise.resolve();

addEventListener("message", (event: MessageEvent<MessageType>) => {
	queue = queue
		.then(() => handleMessage(event.data))
		.catch((error) => {
			postMessage({
				type: "error",
				payload: {
					message: error instanceof Error ? error.message : String(error),
				},
			} as ErrorResponse);
		});
});
