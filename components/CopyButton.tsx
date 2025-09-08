import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button, type buttonVariants } from "./ui/button";

type Props = {
	textToCopy: string;
	children?: React.ReactNode;
	iconClassName?: string;
} & React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	};

export default function CopyButton(props: Props) {
	const { textToCopy, children, iconClassName, ...rest } = props;
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				setCopied(false);
			}, 1500);

			return () => clearTimeout(timeout);
		}
	}, [copied]);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(textToCopy.toString());
		setCopied(true);
	};

	return (
		<Button onClick={copyToClipboard} {...rest}>
			{children}
			{copied ? (
				<CheckIcon
					className={cn(
						{
							"ml-2": props.size !== "icon",
						},
						iconClassName
					)}
				/>
			) : (
				<ClipboardIcon
					className={cn(
						{
							"ml-2": props.size !== "icon",
						},
						iconClassName
					)}
				/>
			)}
		</Button>
	);
}
