import BackupCards from "@/components/BackupCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backup | Lost Ark Utils",
  description: "",
};

export default function BackUpPage() {
  return (
    <main className="mt-6 flex flex-row flex-wrap gap-3 justify-evenly">
      <BackupCards />
    </main>
  );
}
