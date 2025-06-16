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

const STORAGE_KEY = "hide-v2-domain-deprecation-notice-until";
const HIDE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

const OLD_KEYS = [
	"hide-domain-change-notice",
	"hide-v2-domain-deprecation-notice",
];

export default function OldWebsiteDeprecatedMessage() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		for (const key of OLD_KEYS) {
			window.localStorage.removeItem(key);
		}

		if (
			window.location.hostname === "la-utilsv2.vercel.app" ||
			window.location.hostname === "localhost"
		) {
			const hideUntil = window.localStorage.getItem(STORAGE_KEY);
			const now = Date.now();
			if (!hideUntil || now > Number(hideUntil)) {
				setIsOpen(true);
			}
		}
	}, []);

	const handleHideForNow = () => {
		const until = Date.now() + HIDE_DURATION_MS;
		window.localStorage.setItem(STORAGE_KEY, String(until));
		setIsOpen(false);
	};

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
					<AlertDialogCancel onClick={handleHideForNow}>
						Hide for Now
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => setIsOpen(false)} autoFocus>
						Okay
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
