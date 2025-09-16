import {
	type CellInfo,
	type Resolution,
	StoneHelper,
	StoneState,
	parseSuccessRate,
} from "@/lib/stone";
import { useCallback, useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

declare global {
	interface MediaStream {
		captureFrame: () => Promise<ImageBitmap>;
	}
}

if (typeof window !== "undefined" && typeof MediaStream !== "undefined") {
	MediaStream.prototype.captureFrame = function () {
		return new Promise<ImageBitmap>((resolve, reject) => {
			if (!this.active) {
				reject(new Error("No active stream to capture frame from."));
				return;
			}
			const videoTracks = this.getVideoTracks();
			if (videoTracks.length === 0) {
				reject(new Error("No video tracks available in the stream."));
				return;
			}
			const videoTrack = videoTracks[0];
			const imageCapture = new ImageCapture(videoTrack);
			imageCapture
				.grabFrame()
				.then((frame) => resolve(frame))
				.catch((error) =>
					reject(new Error(`Failed to capture frame: ${error}`))
				);
		});
	};
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
						console.error("Error terminating Tesseract worker:", err)
					);
				workerRef.current = null;
				setIsReady(false);
			}
		};
	}, []); // Empty dependency array: runs on mount, cleans up on unmount

	return [workerRef.current, isReady] as const;
}

export function useScreenShare(
	delay: number,
	onFrameCaptured: (frame: ImageBitmap) => void
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
					const frame = await stream.captureFrame();
					await onFrameCaptured(frame);
				} catch (error) {
					console.error(error);
				}
			} else {
				console.log(
					"Stream became inactive during automation interval. Stopping."
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

export function useStoneStatus(parsedState: {
	cellsInfo: CellInfo[];
	ocrText: string;
}) {
	const [stoneInfo, setStoneInfo] = useState<StoneState>();
	const [stoneHelper, setStoneHelper] = useState<StoneHelper>(
		new StoneHelper({ width: 1920, height: 1080 })
	);

	useEffect(() => {
		if (parsedState.cellsInfo.length !== stoneHelper.getCells().length) {
			console.debug(
				`Parsed cells length (${parsedState.cellsInfo.length}) does not match expected length (${stoneHelper.getCells().length}).`
			);
			return;
		}

		const parsedSuccessRate = parseSuccessRate(parsedState.ocrText);
		let finalSuccessRate = parsedSuccessRate;

		const line1 = parsedState.cellsInfo
			.filter((cell) => cell.line === 1)
			.map((cell) => ({
				detectedStatus: cell.detectedStatus,
				pos: cell.pos,
			}));
		const line2 = parsedState.cellsInfo
			.filter((cell) => cell.line === 2)
			.map((cell) => ({
				detectedStatus: cell.detectedStatus,
				pos: cell.pos,
			}));
		const line3 = parsedState.cellsInfo
			.filter((cell) => cell.line === 3)
			.map((cell) => ({
				detectedStatus: cell.detectedStatus,
				pos: cell.pos,
			}));

		setStoneInfo((currentStoneInfo) => {
			if (parsedSuccessRate === null && currentStoneInfo) {
				const predict = currentStoneInfo.predictPercentageChange({
					line1,
					line2,
					line3,
				});

				if (predict !== null) {
					finalSuccessRate = predict;
					console.debug(
						`Predicting percentage based on current state: ${finalSuccessRate}%`
					);
				}
			}

			if (finalSuccessRate === null) {
				console.debug("No valid percentage value found.");
				return currentStoneInfo;
			}

			const newState = new StoneState({
				line1,
				line2,
				line3,
				percentage: finalSuccessRate,
			});

			if (!newState.isStateValid()) {
				console.debug(
					"New stone state is invalid, returning current state without update."
				);
				return currentStoneInfo;
			}

			const isStoneStateUnchanged = currentStoneInfo?.isEqual({
				line1,
				line2,
				line3,
				percentage: finalSuccessRate,
			});

			if (isStoneStateUnchanged) {
				console.debug(
					"Stone state has not changed, returning current state without update."
				);
				return currentStoneInfo;
			}

			return newState;
		});
	}, [parsedState, stoneHelper]);

	return {
		stoneInfo,
		stoneHelper,
		onResChange: (res: Resolution, onResNotSupported: () => void) => {
			try {
				const newHelper = new StoneHelper(res);
				setStoneHelper(newHelper);
			} catch (error) {
				onResNotSupported();
				console.error(error);
			}
		},
	};
}
