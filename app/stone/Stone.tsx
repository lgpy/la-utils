"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ControlsCard from "./ControlsCard";
import LiveFeedCard from "./LiveFeedCard";
import SessionInfoCard from "./SessionInfoCard";
import StoneStatus from "./StoneStatus";
import CellOverviewCard from "./CellOverviewCard";
import type { CellPosition, StoneState, CellInfo, Cell } from "./types";
import { useScreenShare, useTesseractWorker } from "@/hooks/stone";
import { ImageProcessor, parseSuccessRate, PredictPercentage } from "./utils";
import { StoneHelper } from "./helper";
import { toast } from "sonner";

export default function Stone() {
	const [ocrImageSrc, setOcrImageSrc] = useState<string>();
	const [cellsImageSrc, setCellsImageSrc] = useState<string>();

	const [stoneHelper, setStoneHelper] = useState<StoneHelper>(
		new StoneHelper({ width: 1920, height: 1080 }),
	);

	const [parsedState, setParsedState] = useState<{
		cellsInfo: CellInfo[];
		ocrText: string;
	}>({
		cellsInfo: [],
		ocrText: "",
	});

	const cells = useMemo<Cell[]>(() => {
		if (stoneHelper.getCells().length !== parsedState.cellsInfo.length)
			return stoneHelper.getCells().map((cellPosition: CellPosition) => ({
				...cellPosition,
				detectedStatus: "unknown",
				rgbColor: { r: -1, g: -1, b: -1 },
			}));

		return stoneHelper.getCells().map((cellPosition) => {
			const cellInfo = parsedState.cellsInfo.find(
				(t) => t.line === cellPosition.line && t.pos === cellPosition.pos,
			);
			if (cellInfo === undefined)
				return {
					...cellPosition,
					detectedStatus: "unknown",
					rgbColor: { r: -1, g: -1, b: -1 },
				};

			return {
				...cellPosition,
				detectedStatus: cellInfo.detectedStatus,
				rgbColor: cellInfo.rgbColor,
			};
		});
	}, [stoneHelper, parsedState]);

	const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

	const [tesseractWorker, isTesseractWorkerReady] = useTesseractWorker();

	const [stoneInfo, setStoneInfo] = useState<StoneState>();

	useEffect(() => {
		if (parsedState.cellsInfo.length !== stoneHelper.getCells().length) {
			console.debug(
				`Parsed cells length (${parsedState.cellsInfo.length}) does not match expected length (${stoneHelper.getCells().length}).`,
			);
			return;
		}

		const parsedSuccessRate = parseSuccessRate(parsedState.ocrText);
		let finalSuccessRate = parsedSuccessRate;

		if (
			parsedState.cellsInfo.some((cell) => cell.detectedStatus === "unknown")
		) {
			console.debug("Not all cells are matched or have unknown status.");
			return;
		}

		const line1 = parsedState.cellsInfo
			.filter((cell) => cell.line === 1)
			.map((cell) => cell.detectedStatus);
		const line2 = parsedState.cellsInfo
			.filter((cell) => cell.line === 2)
			.map((cell) => cell.detectedStatus);
		const line3 = parsedState.cellsInfo
			.filter((cell) => cell.line === 3)
			.map((cell) => cell.detectedStatus);

		setStoneInfo((currentStoneInfo) => {
			if (parsedSuccessRate === null && currentStoneInfo) {
				const predict = PredictPercentage(currentStoneInfo, {
					line1,
					line2,
					line3,
				});

				if (predict !== null) {
					finalSuccessRate = predict;
					console.debug(
						`Predicting percentage based on current state: ${finalSuccessRate}%`,
					);
				}
			}

			if (finalSuccessRate === null) {
				console.debug("No valid percentage value found.");
				return currentStoneInfo;
			}

			if (
				currentStoneInfo &&
				currentStoneInfo.percentage === finalSuccessRate &&
				line1.length === currentStoneInfo.line1.length &&
				line2.length === currentStoneInfo.line2.length &&
				line3.length === currentStoneInfo.line3.length &&
				line1.every(
					(status, index) => status === currentStoneInfo.line1[index],
				) &&
				line2.every(
					(status, index) => status === currentStoneInfo.line2[index],
				) &&
				line3.every((status, index) => status === currentStoneInfo.line3[index])
			) {
				console.debug(
					"Stone state has not changed, returning current state without update.",
				);
				return currentStoneInfo;
			}

			return {
				line1,
				line2,
				line3,
				percentage: finalSuccessRate,
			};
		});
	}, [parsedState, stoneHelper]);

	const onFrameCaptured = useCallback(
		async (img: ImageBitmap) => {
			const helperResolution = stoneHelper.getResolution();
			if (
				img.width !== helperResolution.width ||
				img.height !== helperResolution.height
			) {
				try {
					const newHelper = new StoneHelper({
						width: img.width,
						height: img.height,
					});
					setStoneHelper(newHelper);
				} catch (error) {
					ss.stopScreenShare();
					console.error(error);
					toast.error("Unsupported Resolution", {
						description: `The current resolution (${img.width}x${img.height}) is not supported, stopped the screen sharing.`,
					});
				}
				return;
			}
			try {
				let tesseractRes: Tesseract.RecognizeResult | undefined; // Initialize to allow for undefined case
				if (tesseractWorker && isTesseractWorkerReady) {
					const ocrImgOperator = await ImageProcessor.fromImageBitmap(
						img,
						stoneHelper.getSuccessRateRegion(),
					);
					if (showDebugInfo) setOcrImageSrc(ocrImgOperator.getDataUrl());
					tesseractRes = await tesseractWorker.recognize(
						ocrImgOperator.getCanvas(),
					);
				} else {
					console.warn(
						"OCR: Tesseract worker not ready or not initialized. Skipping OCR.",
					);
				}
				const cellImgOperator = await ImageProcessor.fromImageBitmap(
					img,
					stoneHelper.getCellsCropRegion(),
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
								`OCR text has changed, updating state with new success rate: ${parsedSR}%`,
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
								cell.detectedStatus !==
									currentState.cellsInfo[i].detectedStatus &&
								cell.detectedStatus !== "unknown",
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
		[stoneHelper, isTesseractWorkerReady, showDebugInfo, tesseractWorker],
	);

	const ss = useScreenShare(500, onFrameCaptured);

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full items-center">
			{" "}
			{/* MODIFIED: className for full width and responsive padding */}
			<h1 className="text-3xl font-bold text-center">Stone Cutter</h1>
			<p className="text-sm text-muted-foreground text-center max-w-prose">
				This tool has only been tested at 1920x1080 (16:9) resolution. It will
				not work correctly with other resolutions. Accuracy may be affected by
				brightness and color settings.
			</p>
			<div className="grid sm:grid-cols-[max-content_max-content] gap-6 justify-center">
				<ControlsCard
					onStartScreenShare={ss.startScreenShare}
					onStopScreenShare={ss.stopScreenShare}
					mediaStreamActive={ss.isSharing}
					showDebugInfo={showDebugInfo}
					setShowDebugInfo={setShowDebugInfo}
				/>
				<SessionInfoCard
					mediaStreamActive={ss.isSharing}
					cells={parsedState.cellsInfo}
					resolution={stoneHelper.getResolution()}
				/>
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
