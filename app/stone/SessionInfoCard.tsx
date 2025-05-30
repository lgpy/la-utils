"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CellInfo } from "./types";
import type { Resolution } from "@/lib/utils";

interface SessionInfoCardProps {
	mediaStreamActive: boolean;
	cells: CellInfo[];
	resolution: Resolution;
}

export default function SessionInfoCard({
	mediaStreamActive,
	cells,
	resolution,
}: SessionInfoCardProps) {
	const parsedCells = cells.reduce(
		(acc, cell) => acc + (cell.detectedStatus !== "unknown" ? 1 : 0),
		0,
	);
	const allCellsParsed = parsedCells === cells.length && cells.length > 0;
	const cellsCount = cells.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Session Info</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<div>
					Screen Share:{" "}
					<Badge
						variant={mediaStreamActive ? "default" : "destructive"}
						className="ml-2"
					>
						{mediaStreamActive ? "Active" : "Inactive"}
					</Badge>
				</div>
				{cellsCount > 0 && (
					<div className="mt-2">
						Parsed:{" "}
						<Badge
							variant={allCellsParsed ? "default" : "destructive"}
							className="ml-2"
						>
							{parsedCells} / {cellsCount}
						</Badge>
					</div>
				)}
				<div className="mt-2">
					Resolution:{" "}
					<Badge variant="secondary" className="ml-2">
						{resolution.width}x{resolution.height}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
