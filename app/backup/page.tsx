import BackupCards from "@/components/BackupCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Backup",
	description: "",
};

export default function BackUpPage() {
	return (
		<main className="my-6 grid gap-6 lg:grid-cols-2">
			<BackupCards />
		</main>
	);
}
