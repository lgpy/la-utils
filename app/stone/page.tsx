import { StoneCalculator } from "@/components/Stone";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Stone",
	description: "",
};

export default function StonePage() {
	return <StoneCalculator />;
}
