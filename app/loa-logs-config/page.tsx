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
import { CheckCircle, XCircle, FileIcon, AlertTriangle } from "lucide-react";
import {
	storeLoaLogsFileHandle,
	getStoredLoaLogsFileHandle,
	clearStoredLoaLogsFileHandle,
	isFileSystemAccessSupported,
	type LoaLogsFileAccess,
} from "@/components/LoaLogAccess/utils";

export default function LoaLogsConfigPage() {
	const [fileAccess, setFileAccess] = useState<LoaLogsFileAccess>({
		fileHandle: null,
		hasPermission: false,
		lastAccessed: null,
		fileSize: null,
	});
	const [isDragOver, setIsDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const supported = isClient && isFileSystemAccessSupported();

	const checkStoredFileAccess = useCallback(async () => {
		try {
			const handle = await getStoredLoaLogsFileHandle();
			if (handle) {
				const permission = await handle.queryPermission();
				if (permission === "granted") {
					const file = await handle.getFile();
					setFileAccess({
						fileHandle: handle,
						hasPermission: true,
						lastAccessed: new Date(),
						fileSize: file.size,
					});
				}
			}
		} catch (error) {
			console.warn("Failed to check stored file access:", error);
		}
	}, []);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		// Check for stored file access when the component mounts
		if (isClient) {
			checkStoredFileAccess();
		}
	}, [isClient, checkStoredFileAccess]);

	const handleFileAccess = useCallback(
		async (fileHandle: FileSystemFileHandle) => {
			try {
				setIsProcessing(true);
				setError(null);

				if (!fileHandle.name.toLowerCase().includes("encounters.db")) {
					throw new Error(
						"Please select the encounters.db file from LOA Logs directory",
					);
				}

				const permission = await fileHandle.requestPermission();
				if (permission !== "granted") {
					throw new Error(
						"Permission denied. Please allow access to the file.",
					);
				}

				const file = await fileHandle.getFile();
				setFileAccess({
					fileHandle,
					hasPermission: true,
					lastAccessed: new Date(),
					fileSize: file.size,
				});

				await storeLoaLogsFileHandle(fileHandle);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to access file");
			} finally {
				setIsProcessing(false);
			}
		},
		[],
	);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);

			if (!supported) {
				setError("File System Access API is not supported in this browser");
				return;
			}

			const items = Array.from(e.dataTransfer.items);
			for (const item of items) {
				if (item.kind === "file" && item.getAsFileSystemHandle) {
					try {
						const handle = await item.getAsFileSystemHandle();
						if (handle) {
							await handleFileAccess(handle as FileSystemFileHandle);
							break;
						}
					} catch (err) {
						console.warn("Failed to get file system handle:", err);
					}
				}
			}
		},
		[handleFileAccess, supported],
	);

	const clearAccess = useCallback(async () => {
		setFileAccess({
			fileHandle: null,
			hasPermission: false,
			lastAccessed: null,
			fileSize: null,
		});
		await clearStoredLoaLogsFileHandle();
	}, []);

	if (!isClient) {
		return (
			<div className="container mx-auto p-6 max-w-4xl">
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-muted-foreground">Loading...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-4xl">
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
							File System Access API is not supported in this browser. Please
							use Chrome, Edge, or another Chromium-based browser to access LOA
							Logs files.
						</AlertDescription>
					</Alert>
				)}

				{error && (
					<Alert variant="destructive">
						<XCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* File Access Status Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							{fileAccess.hasPermission ? (
								<CheckCircle className="h-5 w-5 text-green-500" />
							) : (
								<XCircle className="h-5 w-5 text-red-500" />
							)}
							File Access Status
						</CardTitle>
						<CardDescription>
							Current status of LOA Logs encounters.db file access
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="text-sm font-medium">Permission Status</div>
								<div className="mt-1">
									<Badge
										variant={fileAccess.hasPermission ? "default" : "secondary"}
									>
										{fileAccess.hasPermission ? "Granted" : "Not Granted"}
									</Badge>
								</div>
							</div>
							<div>
								<div className="text-sm font-medium">File Size</div>
								<div className="mt-1 text-sm">
									{fileAccess.fileSize
										? `${(fileAccess.fileSize / 1024).toFixed(2)} KB`
										: "Unknown"}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium">Last Accessed</div>
								<div className="mt-1 text-sm">
									{fileAccess.lastAccessed
										? fileAccess.lastAccessed.toLocaleString()
										: "Never"}
								</div>
							</div>
							<div>
								<div className="text-sm font-medium">File Name</div>
								<div className="mt-1 text-sm">
									{fileAccess.fileHandle?.name || "No file selected"}
								</div>
							</div>
						</div>
					</CardContent>
					{fileAccess.hasPermission && (
						<CardFooter className="flex justify-between">
							<Button
								variant="outline"
								onClick={() => {
									checkStoredFileAccess();
								}}
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
								Find the encounters.db file in your LOA Logs directory:
							</p>
							<code className="block bg-muted p-2 rounded text-sm">
								%localappdata%/LOA Logs/encounters.db
							</code>
							<p className="text-sm text-muted-foreground">
								This is typically located at:{" "}
								<code>
									C:\Users\[Username]\AppData\Local\LOA Logs\encounters.db
								</code>
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="font-semibold">3. Grant File Access</h4>
							<p className="text-sm text-muted-foreground">
								Drag and drop the encounters.db file onto the area below to
								grant persistent access to your raid data.
							</p>
						</div>
						<div className="space-y-2">
							<h4 className="font-semibold">After completing the setup</h4>
							<p className="text-sm text-muted-foreground">
								Navigate to the home page and there should be a button to update
								the raid completion in the bottom right corner.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* File Drop Area */}
				{supported && (
					<Card>
						<CardHeader>
							<CardTitle>Grant File Access</CardTitle>
							<CardDescription>
								Drag and drop your encounters.db file here to enable integration
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									isDragOver
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-muted-foreground/50"
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
									<p className="text-lg font-medium">
										Drop encounters.db file here
									</p>
									<p className="text-sm text-muted-foreground">
										The file will be accessible for reading raid completion data
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
