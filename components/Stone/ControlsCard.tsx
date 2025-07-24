"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { Label } from "@/components/ui/label"; // Added Label import

interface ControlsCardProps {
	onStartScreenShare: () => void;
	onStopScreenShare: () => void;
	mediaStreamActive: boolean;
	showDebugInfo: boolean;
	setShowDebugInfo: (value: boolean) => void;
}

export default function ControlsCard({
	onStartScreenShare,
	onStopScreenShare,
	mediaStreamActive,
	showDebugInfo,
	setShowDebugInfo,
}: ControlsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Controls</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{!mediaStreamActive ? (
					<Button onClick={onStartScreenShare} className="w-full">
						Start Screen Share
					</Button>
				) : (
					<Button
						onClick={onStopScreenShare}
						variant="destructive"
						className="w-full"
					>
						Stop Screen Share
					</Button>
				)}
				<div className="flex items-center space-x-2 mt-2">
					<Checkbox
						id="show-debug-info" // Changed id
						checked={showDebugInfo} // Changed prop
						onCheckedChange={(checked) => setShowDebugInfo(checked as boolean)} // Changed prop
					/>
					<Label
						htmlFor="show-debug-info"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Show Debug Info
					</Label>
				</div>
			</CardContent>
		</Card>
	);
}
