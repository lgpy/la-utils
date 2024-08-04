import BackupCards from "@/components/BackupCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backup | Lost Ark Utils",
  description: "",
};

export default function BackUpPage() {
  return (
    <main className="my-6 flex md:flex-row flex-col gap-6 2xl:gap-40 justify-evenly px-6 2xl:px-40 items-center">
      <BackupCards />
    </main>
  );
}
