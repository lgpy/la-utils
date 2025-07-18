"use client";

import { useTruncatedElement } from "@/lib/hooks/truncated";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

type Props = {
	text: string;
	className: {
		text: string;
		tooltip: string;
	};
};

export default function TruncatedTooltip(props: Props) {
	const { text, className } = props;
	const titleRef = useRef<HTMLDivElement>(null);
	const titleIsTruncated = useTruncatedElement(titleRef);
	const [tooltipIsHovered, setTooltipIsHovered] = useState(false);
	const [titleIsHovered, setTitleIsHovered] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!titleIsTruncated) {
			setIsOpen(false);
			return;
		}
		if (tooltipIsHovered || titleIsHovered) {
			setIsOpen(true);
			if (closeTimeoutRef.current) {
				clearTimeout(closeTimeoutRef.current);
				closeTimeoutRef.current = null;
			}
		} else {
			closeTimeoutRef.current = setTimeout(() => {
				setIsOpen(false);
			}, 100);
		}
	}, [titleIsTruncated, tooltipIsHovered, titleIsHovered]);

	if (!titleIsTruncated) {
		return (
			<div className={cn(className.text)} ref={titleRef}>
				{text}
			</div>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip open={isOpen}>
				<TooltipTrigger asChild>
					<div
						className={cn(className.text)}
						ref={titleRef}
						onMouseEnter={() => setTitleIsHovered(true)}
						onMouseLeave={() => setTitleIsHovered(false)}
					>
						{text}
					</div>
				</TooltipTrigger>
				<TooltipContent
					className={cn(className.tooltip)}
					onMouseEnter={() => setTooltipIsHovered(true)}
					onMouseLeave={() => setTooltipIsHovered(false)}
				>
					<p>{text}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
