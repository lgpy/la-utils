"use client";

import { Button, type buttonVariants } from "./ui/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useRef, useLayoutEffect, useState } from "react";

type ExpandableButtonProps = {
	label: string;
	children: React.ReactNode;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

export function ExpandableButton({
	label,
	children,
	className,
	...otherProps
}: ExpandableButtonProps) {
	const [labelWidth, setLabelWidth] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const measureRef = useRef<HTMLSpanElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: label is a dependency for measuring width
	useLayoutEffect(() => {
		if (measureRef.current) {
			setLabelWidth(measureRef.current.offsetWidth);
		}
	}, [label]);

	return (
		<Button
			className={cn("group flex items-center !px-1.5 !py-1 gap-0", className)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			{...otherProps}
		>
			{/* Hidden span for measuring label width */}
			<span
				ref={measureRef}
				className="absolute invisible h-0 whitespace-nowrap"
				aria-hidden
			>
				{label}
			</span>
			<span
				className="overflow-hidden whitespace-nowrap transition-[width,opacity] duration-200 opacity-0 pr-0 min-w-0"
				style={{
					width: isHovered ? labelWidth + 16 : 0,
					opacity: isHovered ? 1 : 0,
					paddingRight: isHovered ? 4 : 0,
				}}
			>
				{label}
			</span>
			{children}
		</Button>
	);
}
