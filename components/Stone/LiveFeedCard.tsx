// oxlint-disable no-img-element
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LiveFeedCardProps {
	ocrImageSrc: string | undefined;
	cellsImageSrc: string | undefined;

	className?: string;
}

export default function LiveFeedCard({
	ocrImageSrc,
	cellsImageSrc,
	className,
}: LiveFeedCardProps) {
	return (
		<>
			{ocrImageSrc && (
				<Card className={cn("overflow-hidden", className)}>
					<CardHeader>
						<CardTitle>Live Feed</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col md:flex-row gap-4">
						<img
							src={cellsImageSrc}
							alt="Cells"
							className="w-full md:w-1/2 h-auto block rounded-md border"
						/>
						<img
							src={ocrImageSrc}
							alt="Screen with markers"
							className="w-full md:w-1/2 h-auto block rounded-md border"
						/>
					</CardContent>
				</Card>
			)}
		</>
	);
}
