import EditCards from "@/components/EditCard/EditCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Characters",
};

export default function CharactersPage() {
	return <EditCards />;
}
