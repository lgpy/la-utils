"use client";

import { useEffect, useMemo, useState } from "react";
import ControlsCard from "./ControlsCard";
import LiveFeedCard from "./LiveFeedCard"; // Added import
import SessionInfoCard from "./SessionInfoCard";
import StoneStatus from "./StoneStatus";
import CellOverviewCard from "./CellOverviewCard";
import type { CellPosition, StoneState, CellInfo } from "./types";
import { useScreenShare, useTesseractWorker } from "@/hooks/stone";
import { ImageProcessor, PredictPercentage } from "./utils";
import { StoneHelper } from "./helper";

export default function Stone() {
	const [ocrImageSrc, setOcrImageSrc] = useState<string>();
	const [cellsImageSrc, setCellsImageSrc] = useState<string>();

	const [stoneHelper, setStoneHelper] = useState<StoneHelper>(
		new StoneHelper({ width: 1920, height: 1080 }),
	);

	const [parsedState, setParsedState] = useState<{
		cellsInfo: CellInfo[];
		ocrText: string | undefined;
	}>({
		cellsInfo: [],
		ocrText: undefined,
	});

	const cells = useMemo(() => {
		if (stoneHelper.getCells().length !== parsedState.cellsInfo.length)
			return stoneHelper.getCells().map((cellPosition: CellPosition) => ({
				...cellPosition,
				detectedStatus: "unknown",
				isMatch: false,
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
					isMatch: false,
					rgbColor: { r: -1, g: -1, b: -1 },
				};

			return {
				...cellPosition,
				detectedStatus: cellInfo.detectedStatus,
				isMatch: cellInfo.isMatch,
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
				`Parsed cells length (${parsedState.cellsInfo.length}) does not match expected length (${stoneHelper.getCells().length}). Reinitializing cells.`,
			);
			return;
		}
		if (parsedState.ocrText === undefined) {
			console.debug("OCR text is undefined, skipping processing.");
			return;
		}
		//ocrText needs to be 75 65 55 45 35 25 and optionally have % at the end
		const Acceptable_Percentages = [75, 65, 55, 45, 35, 25];
		const percentage = parsedState.ocrText.trim().match(/^(\d{2})(?:\%)?$/);
		let percentageValue: number | undefined;
		let ocrWasSuccessful = false;

		if (percentage) {
			percentageValue = Number.parseInt(percentage[1], 10);
			if (!Number.isNaN(percentageValue)) {
				if (Acceptable_Percentages.includes(percentageValue)) {
					ocrWasSuccessful = true;
				} else {
					console.debug(
						`Percentage ${percentageValue} is not in the acceptable range.`,
					);
					ocrWasSuccessful = false;
				}
			} else {
				console.debug("Parsed percentage is NaN.");
				ocrWasSuccessful = false;
			}
		} else {
			console.debug(
				`OCR text does not match expected format: "${parsedState.ocrText}".`,
			);
			ocrWasSuccessful = false;
		}

		if (
			parsedState.cellsInfo.some(
				(cell) => cell.detectedStatus === "unknown" || !cell.isMatch,
			)
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
			if (!ocrWasSuccessful && currentStoneInfo) {
				const predict = PredictPercentage(currentStoneInfo, {
					line1,
					line2,
					line3,
				});

				if (predict !== null) {
					percentageValue = predict;
					console.debug(
						`Predicting percentage based on current state: ${percentageValue}`,
					);
				}
			}

			if (percentageValue === undefined) {
				console.debug("No valid percentage value found.");
				return currentStoneInfo;
			}

			if (
				currentStoneInfo &&
				currentStoneInfo.percentage === percentageValue &&
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
			)
				return currentStoneInfo;

			return {
				line1,
				line2,
				line3,
				percentage: percentageValue,
			};
		});
	}, [parsedState, stoneHelper]);

	const ss = useScreenShare(500, async (img) => {
		const helperResolution = stoneHelper.getResolution();
		if (
			img.width !== helperResolution.width ||
			img.height !== helperResolution.height
		) {
			setStoneHelper(new StoneHelper({ width: img.width, height: img.height }));
			return;
		}
		try {
			let tesseractRes: Tesseract.RecognizeResult;
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
				const parsedCells = stoneHelper.parseCellsInfo(cellImgOperator);

				if (currentState.cellsInfo.length === 0) {
					return {
						cellsInfo: parsedCells,
						ocrText: tesseractRes?.data?.text.trim() || undefined,
					};
				}

				if (
					parsedCells.every(
						(cell) => cell.detectedStatus !== "unknown" && cell.isMatch,
					) &&
					parsedCells.some(
						(cell, i) =>
							cell.detectedStatus !== currentState.cellsInfo[i].detectedStatus,
					)
				) {
					return {
						cellsInfo: parsedCells,
						ocrText: tesseractRes?.data?.text.trim() || undefined,
					};
				}
				return currentState;
			});
		} catch (error) {
			console.error("Error processing screen share image:", error);
		}
	});

	return (
		<div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full items-center">
			{" "}
			{/* MODIFIED: className for full width and responsive padding */}
			<h1 className="text-3xl font-bold text-center">Stone Cutter</h1>
			<p className="text-sm text-muted-foreground text-center max-w-prose">
				This tool has only been tested in fullscreen and borderless mode at
				1920x1080 (16:9) resolution. It will not work correctly with other
				resolutions or windowed modes, and may also be affected by certain color
				or brightness settings.
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
