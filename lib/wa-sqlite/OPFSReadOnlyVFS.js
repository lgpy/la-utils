// Implements a custom VFS to read
// https://github.com/rhashimoto/wa-sqlite/discussions/226

import { OPFSAnyContextVFS as BaseVFS } from "./OPFSAnyContextVFS.js";
import * as SQLite from "./sqlite-api.js";

class File {
	/** @type {string} */ pathname;
	/** @type {number} */ flags;
	/** @type {FileSystemFileHandle} */ fileHandle;
	/** @type {Blob?} */ blob;
	/** @type {FileSystemWritableFileStream?} */ writable;

	constructor(pathname, flags) {
		this.pathname = pathname;
		this.flags = flags;
	}
}

export class OPFSReadOnlyVFS extends BaseVFS {
	/** @type {Map<number, File>} */ mapIdToFile = new Map();
	lastError = null;

	log = null;
	userFileSystemHandle = null;

	static async create(name, module, userFileSystemHandle, options) {
		const vfs = new OPFSReadOnlyVFS(
			name,
			module,
			userFileSystemHandle,
			options,
		);
		await vfs.isReady();
		return vfs;
	}

	constructor(name, module, userFileSystemHandle, options = {}) {
		super(name, module, options);
		this.userFileSystemHandle = userFileSystemHandle;
	}

	/**
	 * @param {string?} zName
	 * @param {number} fileId
	 * @param {number} flags
	 * @param {DataView} pOutFlags
	 * @returns {Promise<number>}
	 */
	async jOpen(zName, fileId, flags, pOutFlags) {
		try {
			const url = new URL(
				zName || Math.random().toString(36).slice(2),
				"file://",
			);
			const pathname = url.pathname;

			const file = new File(pathname, flags);
			this.mapIdToFile.set(fileId, file);

			file.fileHandle = this.userFileSystemHandle;

			pOutFlags.setInt32(0, flags, true);
			return SQLite.SQLITE_OK;
		} catch (e) {
			this.lastError = e;
			return SQLite.SQLITE_CANTOPEN;
		}
	}
}
