import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { MainStoreProvider } from "@/providers/MainStoreProvider";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "./providers";
import { SettingsStoreProvider } from "@/providers/SettingsProvider";

const inter = Inter({ subsets: ["latin"] });
const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: true,
});

export const metadata: Metadata = {
  title: "Lost Ark Utils",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <CSPostHogProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.className,
          )}
        >
          <PostHogPageView />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen w-full flex-col">
              <SettingsStoreProvider>
                <NavBar />
                <MainStoreProvider>{children}</MainStoreProvider>
              </SettingsStoreProvider>
            </div>
          </ThemeProvider>
          <Toaster />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
