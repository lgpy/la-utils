"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function OldWebsiteDeprecatedMessage() {
	const [value, setValue, removeValue] = useLocalStorage(
		"hide-v2-domain-deprecation-notice",
		false,
	);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		// Remove old notice key if present
		window.localStorage.removeItem("hide-domain-change-notice");
		if (window.location.hostname === "la-utilsv2.vercel.app") {
			setIsOpen(!value);
		}
	}, [value]);

	return (
		<AlertDialog open={isOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Notice</AlertDialogTitle>
					<AlertDialogDescription className="flex flex-col gap-2">
						<span>
							The current domain (<b>la-utilsv2.vercel.app</b>) will be{" "}
							<b>taken down on June 25th</b> to make way for new updates and
							improvements to Lost Ark Utils. Please switch to the main domain
							at{" "}
							<Link
								href="https://la-utils.vercel.app/"
								className="underline text-primary hover:primary/80"
								target="_blank"
							>
								la-utils.vercel.app
							</Link>{" "}
							to access all new features and updates.
						</span>
						<span>
							To transfer your data, use the &quot;Import/Export Data&quot;
							option by clicking the cogwheel in the top right corner.
						</span>
						<span className="text-right">
							Thank you for using Lost Ark Utils!
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setValue(true)}>
						Don&apos;t show me this again
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => setIsOpen(false)} autoFocus>
						Okay
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
