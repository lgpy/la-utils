"use client";

import {
	type Cell,
	type CellInfo,
	type CellPosition,
	ImageProcessor,
	parseSuccessRate,
} from "@/lib/stone";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import CellOverviewCard from "./CellOverviewCard";
import ControlsCard from "./ControlsCard";
import LiveFeedCard from "./LiveFeedCard";
import SupportedResCard from "./SupportedResCard";
import {
	useScreenShare,
	useStoneStatus,
	useTesseractWorker,
} from "./StoneCalculator.hooks";
import StoneStatus from "./StoneStatus";

export default function StoneCalculator() {
	const [ocrImageSrc, setOcrImageSrc] = useState<string>();
	const [cellsImageSrc, setCellsImageSrc] = useState<string>();

	const [parsedState, setParsedState] = useState<{
		cellsInfo: CellInfo[];
		ocrText: string;
	}>({
		cellsInfo: [],
		ocrText: "",
	});

	const { onResChange, stoneHelper, stoneInfo } = useStoneStatus(parsedState);

	const cells = useMemo<Cell[]>(() => {
		if (stoneHelper.getCells().length !== parsedState.cellsInfo.length)
			return stoneHelper.getCells().map((cellPosition: CellPosition) => ({
				...cellPosition,
				detectedStatus: "unknown",
				hsl: [-1, -1, -1],
				rgb: [-1, -1, -1],
			}));

		return stoneHelper.getCells().map((cellPosition) => {
			const cellInfo = parsedState.cellsInfo.find(
				(t) => t.line === cellPosition.line && t.pos === cellPosition.pos
			);
			if (cellInfo === undefined)
				return {
					...cellPosition,
					detectedStatus: "unknown",
					hsl: [-1, -1, -1],
					rgb: [-1, -1, -1],
				};

			return {
				...cellPosition,
				detectedStatus: cellInfo.detectedStatus,
				hsl: cellInfo.hsl,
				rgb: cellInfo.rgb,
			};
		});
	}, [stoneHelper, parsedState]);

	const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

	const [tesseractWorker, isTesseractWorkerReady] = useTesseractWorker();

	const onFrameCaptured = useCallback(
		async (img: ImageBitmap, stopCapture: () => void) => {
			const helperResolution = stoneHelper.getResolution();
			if (
				img.width !== helperResolution.width ||
				img.height !== helperResolution.height
			) {
				onResChange(
					{
						width: img.width,
						height: img.height,
					},
					() => {
						stopCapture();
						toast.error("Unsupported Resolution", {
							description: `The current resolution (${img.width}x${img.height}) is not supported, stopped the screen sharing.`,
						});
					}
				);
				return;
			}
			try {
				let tesseractRes: Tesseract.RecognizeResult | undefined; // Initialize to allow for undefined case
				if (tesseractWorker && isTesseractWorkerReady) {
					const ocrImgOperator = await ImageProcessor.fromImageBitmap(
						img,
						stoneHelper.getSuccessRateRegion()
					);
					if (showDebugInfo) setOcrImageSrc(ocrImgOperator.getDataUrl());
					tesseractRes = await tesseractWorker.recognize(
						ocrImgOperator.getCanvas()
					);
				} else {
					console.warn(
						"OCR: Tesseract worker not ready or not initialized. Skipping OCR."
					);
				}
				const cellImgOperator = await ImageProcessor.fromImageBitmap(
					img,
					stoneHelper.getCellsCropRegion()
				);
				if (showDebugInfo) setCellsImageSrc(cellImgOperator.getDataUrl());

				setParsedState((currentState) => {
					const cellsInfo = stoneHelper.parseCellsInfo(cellImgOperator);
					// Ensure ocrText is handled even if tesseractRes is undefined
					const ocrText = tesseractRes?.data.text.trim().replace("%", "") || "";

					if (currentState.cellsInfo.length === 0) {
						console.debug("No cells info found, updating state with new data.");
						return {
							cellsInfo,
							ocrText,
						};
					}

					if (ocrText !== undefined && currentState.ocrText !== ocrText) {
						const parsedSR = parseSuccessRate(ocrText);
						if (parsedSR !== null) {
							console.debug(
								`OCR text has changed, updating state with new success rate: ${parsedSR}%`
							);
							return {
								cellsInfo,
								ocrText,
							};
						}
					}

					if (
						cellsInfo.some(
							(cell, i) =>
								cell.detectedStatus !== currentState.cellsInfo[i].detectedStatus
						)
					) {
						console.debug("Cell status has changed, updating state.");
						return {
							cellsInfo,
							ocrText,
						};
					}

					return currentState;
				});
			} catch (error) {
				console.error("Error processing screen share image:", error);
			}
		},
		[
			stoneHelper,
			isTesseractWorkerReady,
			showDebugInfo,
			tesseractWorker,
			onResChange,
		]
	);

	const ss = useScreenShare(500, (f) => onFrameCaptured(f, ss.stopScreenShare));

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full items-center">
			{" "}
			{/* MODIFIED: className for full width and responsive padding */}
			<h1 className="text-3xl font-bold text-center">Stone Cutter</h1>
			<p className="text-sm text-muted-foreground text-center max-w-prose">
				This tool has been tested mostly with 1920x1080 (16:9) resolution. It
				might not work correctly with other resolutions. Accuracy may be
				affected by brightness and color settings. Join the Discord server for
				support and feedback.
			</p>
			<div className="grid sm:grid-cols-[max-content_max-content] gap-6 justify-center">
				<ControlsCard
					onStartScreenShare={ss.startScreenShare}
					onStopScreenShare={ss.stopScreenShare}
					mediaStreamActive={ss.isSharing}
					showDebugInfo={showDebugInfo}
					setShowDebugInfo={setShowDebugInfo}
				/>
				<SupportedResCard />
			</div>
			<StoneStatus stoneState={stoneInfo} className="w-fit" />
			{showDebugInfo && (
				<>
					<CellOverviewCard cells={cells} className="h-fit w-fit" />
					<LiveFeedCard
						ocrImageSrc={ocrImageSrc}
						cellsImageSrc={cellsImageSrc}
					/>
				</>
			)}
		</div>
	);
}
