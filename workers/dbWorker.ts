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

let sqlite3: SQLiteAPI | null = null;
let db: number | null = null;
// biome-ignore lint/suspicious/noExplicitAny: We need to use `any` for dynamic module loading
let wasmModule: any = null;

async function openDb(): Promise<number> {
	if (!sqlite3) throw new Error("SQLite not initialized");
	db = await sqlite3.open_v2(
		DBName,
		SQLite.SQLITE_OPEN_READONLY | SQLite.SQLITE_OPEN_MAIN_DB,
		IDBName
	);
	return db;
}

async function closeDb() {
	if (!sqlite3 || db === null) return;
	const handle = db;
	db = null;
	await sqlite3.close(handle);
}

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

addEventListener("message", async (event: MessageEvent<MessageType>) => {
	const { type, payload } = event.data;
	console.debug("Worker received message:", type, payload);
	try {
		if (type === "init") {
			wasmModule = await moduleFactory({
				locateFile: (path: string, _prefix: string) => {
					if (path.endsWith(".wasm")) {
						return wasmUrl;
					}
					return _prefix + path;
				},
			});
			sqlite3 = SQLite.Factory(wasmModule);
			const vfs = await OPFSReadOnlyVFS.create(
				IDBName,
				wasmModule,
				payload.fileHandle,
				{ lockPolicy: "shared+hint" }
			);
			// @ts-ignore
			sqlite3.vfs_register(vfs, true);
			await openDb();
			postMessage({ type: "init", payload: { success: true } } as InitResponse);
			return;
		}
		if (type === "query") {
			if (!sqlite3) {
				throw new Error(
					"Database not initialized. Please send an 'init' message first."
				);
			}

			// Re-open the database for every query so the worker reads the current
			// file contents. LOA Logs writes to the database continuously; the VFS
			// caches a File snapshot per open file, so a long-lived connection would
			// keep serving stale pages. This is a metadata-only operation: the file
			// itself is not copied.
			const startedAt = performance.now();
			await closeDb();
			const connection = await openDb();

			const results: QueryResult[] = [];
			await sqlite3.exec(
				connection,
				payload.query,
				(row: unknown[], columns: string[]) => {
					if (columns !== results.at(-1)?.columns) {
						results.push({ columns, rows: [] });
					}
					results.at(-1)?.rows.push(row);
				}
			);
			console.debug(
				`Query finished in ${(performance.now() - startedAt).toFixed(1)} ms`
			);
			postMessage({
				type: "query",
				payload: results,
			} as QueryResponse);
			return;
		}
	} catch (error) {
		postMessage({
			type: "error",
			payload: {
				message: error instanceof Error ? error.message : String(error),
			},
		} as ErrorResponse);
	}
});

// Cleanup on worker termination
self.addEventListener("close", async () => {
	if (sqlite3 && db) {
		await sqlite3.close(db);
		db = null;
	}
});

self.addEventListener("terminate", async () => {
	if (sqlite3 && db) {
		await sqlite3.close(db);
		db = null;
	}
});
