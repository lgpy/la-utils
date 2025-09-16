"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolutionConfigs } from "@/lib/stone/resolutions";

export default function SupportedResCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Supported Resolutions</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col text-sm text-center">
				{resolutionConfigs.getSupportedResolutions().map(([width, height]) => (
					<div key={`${width}x${height}`}>
						{width}x{height}
					</div>
				))}
			</CardContent>
		</Card>
	);
}
