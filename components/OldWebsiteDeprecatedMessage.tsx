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
import { formatDistanceToNowStrict } from "date-fns";

const STORAGE_KEY = "hide-v2-domain-deprecation-notice-until";
const HIDE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const FINAL_SHUTDOWN_DATE = new Date("2025-07-02T00:00:00Z"); // 7 more days

const OLD_KEYS = [
	"hide-domain-change-notice",
	"hide-v2-domain-deprecation-notice",
];

export default function OldWebsiteDeprecatedMessage() {
	const [isOpen, setIsOpen] = useState(false);
	const [remaining, setRemaining] = useState("");

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

		// Update remaining time every minute
		const updateRemaining = () => {
			setRemaining(
				formatDistanceToNowStrict(FINAL_SHUTDOWN_DATE, { addSuffix: false })
			);
		};
		updateRemaining();
		const interval = setInterval(updateRemaining, 60000);
		return () => clearInterval(interval);
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
						<span className="text-red font-semibold">
							This website (<b>la-utilsv2.vercel.app</b>) will be <b>permanently shut down on July 2nd</b>.
						</span>
						<span>
							You have <b>{remaining}</b> to migrate your data. After this date, you will <b>lose access</b> to your data and all features here.
						</span>
						<span>
							Please switch to the main domain at {" "}
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
							To transfer your data, use the &quot;Import/Export Data&quot; option by clicking the cogwheel in the top right corner.
						</span>
						<span className="text-right">
							Thank you for using Lost Ark Utils!
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleHideForNow}>
						Hide for 12 hours
					</AlertDialogCancel>
					<AlertDialogAction onClick={() => setIsOpen(false)} autoFocus>
						Okay
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
