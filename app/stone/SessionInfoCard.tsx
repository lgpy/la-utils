"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CellInfo } from "./types";

interface SessionInfoCardProps {
	mediaStreamActive: boolean;
	cells: CellInfo[];
}

export default function SessionInfoCard({
	mediaStreamActive,
	cells,
}: SessionInfoCardProps) {
	const allCellssMatch = cells.length > 0 && cells.every((t) => t.isMatch);
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
						All Match:{" "}
						<Badge
							variant={allCellssMatch ? "default" : "destructive"}
							className="ml-2"
						>
							{allCellssMatch ? "YES" : "NO"}
						</Badge>
					</div>
				)}
				{cellsCount > 0 && (
					<div className="mt-2">
						Cells:{" "}
						<Badge variant={"outline"} className="ml-2">
							{cellsCount}
						</Badge>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
