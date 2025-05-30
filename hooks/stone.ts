import type { Resolution } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export function useResolution(
	res: Resolution,
): [Resolution, (res: Resolution) => void] {
	const [resolution, setResolution] = useState<Resolution>({
		width: res.width,
		height: res.height,
	});

	const updateResolution = (res: Resolution) => {
		setResolution((prev) => {
			if (prev.width === res.width && prev.height === res.height) {
				return prev; // No change, return previous state
			}
			return res;
		});
	};

	return [resolution, updateResolution];
}

export function useTesseractWorker() {
	const workerRef = useRef<Tesseract.Worker | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const initializeTesseractWorker = async () => {
			try {
				const worker = await Tesseract.createWorker("eng", 1, {
					// logger: m => console.log(m) // Uncomment for detailed logs
				});

				// Set parameters to optimize for "XX%" patterns
				await worker.setParameters({
					tessedit_char_whitelist: "0123456789%", // Only recognize digits and percent sign
					tessedit_pageseg_mode: Tesseract.PSM.SINGLE_LINE, // Treat the image as a single text line (PSM_SINGLE_LINE)
				});

				workerRef.current = worker;
				setIsReady(true);
				console.debug("Tesseract worker initialized and ready.");
			} catch (error) {
				console.error("Failed to initialize Tesseract worker:", error);
			}
		};

		initializeTesseractWorker();

		return () => {
			if (workerRef.current) {
				console.log("Terminating Tesseract worker...");
				workerRef.current
					.terminate()
					.then(() => console.log("Tesseract worker terminated successfully."))
					.catch((err) =>
						console.error("Error terminating Tesseract worker:", err),
					);
				workerRef.current = null;
				setIsReady(false);
			}
		};
	}, []); // Empty dependency array: runs on mount, cleans up on unmount

	return [workerRef.current, isReady] as const;
}

async function captureFrame(stream: MediaStream) {
	if (!stream.active) {
		throw new Error("No active stream to capture frame from.");
	}
	const videoTracks = stream.getVideoTracks();
	if (videoTracks.length === 0) {
		throw new Error("No video tracks available in the stream.");
	}
	const videoTrack = videoTracks[0];
	const imageCapture = new ImageCapture(videoTrack);
	return await imageCapture.grabFrame();
}

export function useScreenShare(
	delay: number,
	onFrameCaptured: (frame: ImageBitmap) => void,
) {
	const [isSharing, setIsSharing] = useState(false);
	const [stream, setStream] = useState<MediaStream | null>(null);

	const stopScreenShare = useCallback(() => {
		setStream((prevStream) => {
			if (prevStream === null) {
				return prevStream;
			}

			for (const track of prevStream.getTracks()) {
				track.stop();
			}

			return null;
		});
		setIsSharing(false);
	}, []);

	useEffect(() => {
		return () => {
			if (stream) {
				stopScreenShare(); // Ensure we stop the stream on unmount
			}
		};
	}, [stream, stopScreenShare]);

	const startScreenShare = useCallback(async () => {
		if (stream?.active) {
			stopScreenShare(); // Stop existing stream before starting a new one
		}
		try {
			const mediaStream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: false,
			});
			if (!mediaStream || mediaStream.getVideoTracks().length === 0) {
				throw new Error("Failed to get a valid video stream.");
			}
			mediaStream.getVideoTracks()[0].onended = () => {
				console.log("Screen share ended by user.");
				setIsSharing(false);
				setStream(null);
			};
			setStream(mediaStream);
			setIsSharing(true);
		} catch (error) {
			console.error("Error starting screen share:", error);
		}
	}, [stream, stopScreenShare]);

	useEffect(() => {
		if (stream === null || !stream.active) return;

		const intervalId = setInterval(async () => {
			if (stream.active) {
				try {
					const frame = await captureFrame(stream);
					await onFrameCaptured(frame);
				} catch (error) {
					console.error(error);
				}
			} else {
				console.log(
					"Stream became inactive during automation interval. Stopping.",
				);
				setIsSharing(false);
			}
		}, delay);

		return () => {
			clearInterval(intervalId);
		};
	}, [stream, onFrameCaptured, delay]);

	return {
		isSharing,
		startScreenShare,
		stopScreenShare,
	};
}
