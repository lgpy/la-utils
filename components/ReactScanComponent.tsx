"use client";
import { type JSX, useEffect } from "react";

export function ReactScan(): JSX.Element {
	useEffect(() => {
		// Dynamically import react-scan only on the client side
		if (process.env.NODE_ENV === "development") {
			import("react-scan").then(({ scan }) => {
				scan({
					enabled: true,
				});
			});
		}
	}, []);

	return <></>;
}
