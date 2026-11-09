"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, FileIcon, AlertTriangle } from "lucide-react";
import {
	BLOCKED_PATH_HINT,
	clearStoredLoaLogsFileHandle,
	describeFileAccessError,
	getStoredLoaLogsFileHandle,
	isFileSystemAccessSupported,
	probeHandleReadable,
	requestPersistentPermission,
	storeLoaLogsFileHandle,
} from "@/components/FABs/LoaLogUpdateRaidCompletion.utils";

function formatSize(size: number | null | undefined) {
	if (size == null) return "Unknown";
	if (size < 1024) return `${size} B`;
	if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
	return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LoaLogsConfigPage() {
	// Set when the browser can read the original file on demand. The file is never
	// copied: it is read in place whenever data is needed.
	const [liveFile, setLiveFile] = useState<{
		name: string;
		size: number;
	} | null>(null);
	const [storedHandle, setStoredHandle] = useState<FileSystemFileHandle | null>(
		null
	);
	const [lastRead, setLastRead] = useState<number | null>(null);

	const [isDragOver, setIsDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const supported = isClient && isFileSystemAccessSupported();

	const refreshStatus = useCallback(async () => {
		setError(null);
		try {
			const handle = await getStoredLoaLogsFileHandle();
			setStoredHandle(handle);

			if (!handle) {
				setLiveFile(null);
				setLastRead(null);
				return;
			}

			const probe = await probeHandleReadable(handle);
			if (!probe.readable) {
				// A granted permission is not enough: the browser can still refuse reads
				// (file moved or replaced, access revoked, ...).
				setLiveFile(null);
				return;
			}

			setLiveFile({ name: probe.file.name, size: probe.file.size });
			setLastRead(Date.now());
		} catch (err) {
			setError(
				describeFileAccessError(err) ?? "Failed to check the file access status"
			);
			setLiveFile(null);
		}
	}, []);

	/**
	 * Registers a dropped/pasted file. Only the handle is stored: the database is
	 * always read in place, so nothing is copied into the browser.
	 */
	const applyFile = useCallback(
		async (file: File, handle: FileSystemFileHandle | null) => {
			setIsProcessing(true);
			setError(null);
			setNotice(null);

			try {
				if (file.name.toLowerCase() !== "encounters.db") {
					throw new Error(
						"Please select the encounters.db file from your LOA Logs database folder."
					);
				}

				if (!handle) {
					throw new Error(
						"This browser did not expose file access for the dropped file. " +
							"Drag encounters.db from your file manager, or copy it and press Ctrl+V " +
							"here, so it can be read in place. (The database is never copied.)"
					);
				}

				const permission = await handle
					.requestPermission()
					.catch(() => "denied" as const);
				if (permission !== "granted") {
					throw new Error(
						"Permission denied. Allow access to the file and try again."
					);
				}

				// The database is read in place - no copy is created, so nothing goes
				// stale and no extra disk space is used.
				const probe = await probeHandleReadable(handle);
				if (!probe.readable) {
					throw new Error(
						probe.reason === "blocked"
							? BLOCKED_PATH_HINT
							: "The file could not be read. It may have been moved or deleted."
					);
				}

				await storeLoaLogsFileHandle(handle);
				setStoredHandle(handle);
				setLiveFile({ name: probe.file.name, size: probe.file.size });
				setLastRead(Date.now());
				toast.success("LOA Logs database connected", {
					id: "loa-logs-config",
					description:
						"The file is read in place, so new encounters show up automatically.",
				});
			} catch (err) {
				setError(
					describeFileAccessError(err) ??
						(err instanceof Error ? err.message : "Failed to access file")
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[]
	);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);

			const items = Array.from(e.dataTransfer.items).filter(
				(item) => item.kind === "file"
			);

			if (items.length === 0) {
				setError(
					"No file found in the drop. Drag the encounters.db file itself."
				);
				return;
			}

			for (const item of items) {
				// Both calls have to happen synchronously, while the event is handled.
				const file = item.getAsFile();
				const handlePromise = item.getAsFileSystemHandle?.();

				if (!file) {
					// Dropping the LOA Logs folder instead of the file.
					setError(
						"Please drop the encounters.db file itself, not the folder that contains it."
					);
					return;
				}

				const handle = handlePromise
					? await handlePromise.catch(() => null)
					: null;

				await applyFile(file, handle as FileSystemFileHandle | null);
				return;
			}
		},
		[applyFile]
	);

	// Pasting a file copied in Explorer (Ctrl+V) works like a drop and is often
	// easier than dragging the file out of %LOCALAPPDATA%.
	useEffect(() => {
		const onPaste = async (e: ClipboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest("input, textarea, [contenteditable='true']")) return;

			const items = Array.from(e.clipboardData?.items ?? []).filter(
				(item) => item.kind === "file"
			);
			if (items.length === 0) return;

			e.preventDefault();
			const item = items[0];
			const file = item.getAsFile();
			const handlePromise = item.getAsFileSystemHandle?.();
			if (!file) return;

			const handle = handlePromise
				? await handlePromise.catch(() => null)
				: null;
			await applyFile(file, handle as FileSystemFileHandle | null);
		};

		document.addEventListener("paste", onPaste);
		return () => document.removeEventListener("paste", onPaste);
	}, [applyFile]);

	const requestPersistentAccess = useCallback(async () => {
		if (!storedHandle) return;

		setIsProcessing(true);
		setError(null);
		setNotice(null);

		try {
			const granted = await requestPersistentPermission(storedHandle);
			if (!granted) {
				setError(
					"Permission denied. Please try again and allow persistent access."
				);
				return;
			}

			const probe = await probeHandleReadable(storedHandle);
			if (!probe.readable) {
				await clearStoredLoaLogsFileHandle();
				setStoredHandle(null);
				setLiveFile(null);
				setNotice(
					probe.reason === "blocked"
						? BLOCKED_PATH_HINT
						: "The file could not be read. It may have been moved or deleted."
				);
				return;
			}

			setLiveFile({ name: probe.file.name, size: probe.file.size });
			setLastRead(Date.now());
		} catch (err) {
			setError(
				describeFileAccessError(err) ?? "Failed to request persistent access"
			);
		} finally {
			setIsProcessing(false);
		}
	}, [storedHandle]);

	const clearAccess = useCallback(async () => {
		setIsProcessing(true);
		setError(null);
		setNotice(null);
		try {
			await clearStoredLoaLogsFileHandle();
			setLiveFile(null);
			setStoredHandle(null);
			setLastRead(null);
		} finally {
			setIsProcessing(false);
		}
	}, []);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (isClient) {
			refreshStatus();
		}
	}, [isClient, refreshStatus]);

	if (!isClient) {
		return (
			<div className="container mx-auto py-6 max-w-4xl">
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-muted-foreground">Loading...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-6 max-w-4xl">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">LOA Logs Integration</h1>
					<p className="text-muted-foreground mt-2">
						Configure access to your LOA Logs encounters.db file for automatic
						raid tracking
					</p>
				</div>

				{!supported && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							Live updates require the File System Access API, which is only
							available in Chrome and Edge. Other browsers cannot connect the
							database yet.
						</AlertDescription>
					</Alert>
				)}

				{supported && (
					<Alert className="mt-4">
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>
							<p>
								<strong>Note:</strong> the database is read in place, so nothing
								is copied and every read sees the current file. If connecting
								fails, use <span className="font-semibold">Clear Access</span>{" "}
								and connect the file again.
								<span className="text-xs text-muted-foreground block mt-1">
									Brave browser can also work by enabling the{" "}
									<code className="bg-muted">file-system-access-api</code> flag
									in <code className="bg-muted">brave://flags</code>.
								</span>
							</p>
						</AlertDescription>
					</Alert>
				)}

				{error && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{notice && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertDescription>{notice}</AlertDescription>
					</Alert>
				)}

				{/* File Access Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{liveFile ? (
								<CheckCircle className="h-5 w-5 text-green-500" />
							) : (
								<XCircle className="h-5 w-5 text-red-500" />
							)}
							File Access Status
						</CardTitle>
						<CardDescription>
							The database is read in place - no copy is stored in this browser
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="text-sm font-medium">Access</div>
								<div className="mt-1">
									{liveFile ? (
										<Badge>Readable (live)</Badge>
									) : (
										<Badge variant="secondary">Not configured</Badge>
									)}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium">File Name</div>
								<div className="mt-1 text-sm">
									{liveFile?.name ?? "No file selected"}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium">Database Size</div>
								<div className="mt-1 text-sm">{formatSize(liveFile?.size)}</div>
							</div>
							<div>
								<div className="text-sm font-medium">Last Read</div>
								<div className="mt-1 text-sm">
									{lastRead ? new Date(lastRead).toLocaleString() : "Never"}
								</div>
							</div>
						</div>
					</CardContent>
					{(liveFile || storedHandle) && (
						<CardFooter className="flex flex-wrap justify-between gap-2">
							<Button
								variant="outline"
								onClick={refreshStatus}
								disabled={isProcessing}
							>
								{isProcessing ? "Checking..." : "Refresh Status"}
							</Button>
							<Button
								variant="destructive"
								onClick={clearAccess}
								disabled={isProcessing}
							>
								Clear Access
							</Button>
						</CardFooter>
					)}
				</Card>

				{/* Persistent Permissions Card */}
				{storedHandle && !liveFile && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-amber-500" />
								Enable Automatic Updates
							</CardTitle>
							<CardDescription>
								A previous file access was found, but the file cannot be read
								right now. Click below to grant persistent permissions to the
								file again.
							</CardDescription>
						</CardHeader>
						<CardFooter>
							<Button
								onClick={requestPersistentAccess}
								disabled={isProcessing}
								className="w-full"
							>
								{isProcessing
									? "Requesting permissions..."
									: "Enable Persistent Permissions"}
							</Button>
						</CardFooter>
					</Card>
				)}

				{/* Setup Instructions */}
				<Card>
					<CardHeader>
						<CardTitle>Setup Instructions</CardTitle>
						<CardDescription>
							Follow these steps to configure LOA Logs integration
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<h4 className="font-semibold">1. Install LOA Logs</h4>
							<p className="text-sm text-muted-foreground">
								Download and install LOA Logs from the official source. Make
								sure it&apos;s running and logging your raids.
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="font-semibold">2. Locate the Database File</h4>
							<p className="text-sm text-muted-foreground">
								Open LOA Logs and go to{" "}
								<span className="font-semibold">
									Settings &rarr; DB Settings &rarr; Open database folder
								</span>
								. The file is named{" "}
								<code className="bg-muted">encounters.db</code> and lives in{" "}
								<code className="bg-muted">%LOCALAPPDATA%\LOA Logs\</code>, i.e.{" "}
								<code className="bg-muted">
									C:\Users\[Username]\AppData\Local\LOA Logs\encounters.db
								</code>
								.
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="font-semibold">3. Connect the file</h4>
							<p className="text-sm text-muted-foreground">
								Drag <code className="bg-muted">encounters.db</code> onto the
								area below, or copy the file in your file manager and press{" "}
								<span className="font-semibold">Ctrl+V</span> here. Nothing is
								copied - the database is read in place, so every read sees the
								current contents.
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="font-semibold">4. Keep the access</h4>
							<p className="text-sm text-muted-foreground">
								When asked, choose <q>Allow on every visit</q> so the file can
								be re-read after reloads. Raid updates re-open the database each
								time, so new encounters are picked up without reconnecting.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* File Drop Area */}
				<Card>
					<CardHeader>
						<CardTitle>Connect Database</CardTitle>
						<CardDescription>
							Drag and drop your encounters.db file here to enable integration
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div
							data-pw="loa-logs-drop-zone"
							className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
								isDragOver
									? "border-primary bg-primary/5"
									: "border-muted-foreground/25"
							}`}
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragOver(true);
							}}
							onDragLeave={(e) => {
								e.preventDefault();
								setIsDragOver(false);
							}}
							onDrop={handleDrop}
						>
							<div className="space-y-2">
								<FileIcon className="h-12 w-12 mx-auto text-muted-foreground" />
								<p className="text-lg font-medium">Drop encounters.db here</p>
								<p className="text-sm text-muted-foreground">
									or copy the file and press Ctrl+V. It is read in place - no
									copy is stored in this browser.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
