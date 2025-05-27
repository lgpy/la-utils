import type { Metadata } from "next";
import Stone from "./Stone";

export const metadata: Metadata = {
	title: "Stone | Lost Ark Utils",
	description: "",
};

export default function StonePage() {
	return <Stone />;
}
