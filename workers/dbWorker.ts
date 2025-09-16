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

addEventListener("message", async (event: MessageEvent<MessageType>) => {
	const { type, payload } = event.data;
	console.debug("Worker received message:", type, payload);
	try {
		if (type === "init") {
			wasmModule = await moduleFactory();
			sqlite3 = SQLite.Factory(wasmModule);
			const vfs = await OPFSReadOnlyVFS.create(
				IDBName,
				wasmModule,
				payload.fileHandle,
				{ lockPolicy: "shared+hint" }
			);
			// @ts-ignore
			sqlite3.vfs_register(vfs, true);
			db = await sqlite3.open_v2(
				DBName,
				SQLite.SQLITE_OPEN_READONLY | SQLite.SQLITE_OPEN_MAIN_DB,
				IDBName
			);
			postMessage({ type: "init", payload: { success: true } } as InitResponse);
			return;
		}
		if (type === "query") {
			if (!sqlite3 || !db) {
				throw new Error(
					"Database not initialized. Please send an 'init' message first."
				);
			}
			const results: QueryResult[] = [];
			await sqlite3.exec(
				db,
				payload.query,
				(row: unknown[], columns: string[]) => {
					if (columns !== results.at(-1)?.columns) {
						results.push({ columns, rows: [] });
					}
					results.at(-1)?.rows.push(row);
				}
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
