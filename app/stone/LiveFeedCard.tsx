"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LiveFeedCardProps {
	capturedImageSrc: string | null;

	className?: string;
}

export default function LiveFeedCard({
	capturedImageSrc,
	className,
}: LiveFeedCardProps) {
	return (
		<>
			{capturedImageSrc && (
				<Card className={cn("overflow-hidden", className)}>
					<CardHeader>
						<CardTitle>Live Feed (with markers)</CardTitle>
					</CardHeader>
					<CardContent>
						<img
							src={capturedImageSrc}
							alt="Screen with markers"
							className="w-full h-auto block rounded-md border"
						/>
					</CardContent>
				</Card>
			)}
		</>
	);
}
