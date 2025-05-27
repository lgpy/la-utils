import EditCards from "@/components/EditCard/EditCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Characters | Lost Ark Utils",
	description: "",
};

export default function CharactersPage() {
	return <EditCards />;
}
