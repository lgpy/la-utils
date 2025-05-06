import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { MainStoreProvider } from "@/providers/MainStoreProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/providers/PostHogProvider";

const inter = Inter({ subsets: ["latin"] });

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
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          inter.className
        )}
      >
        <MainStoreProvider>
          <PostHogProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <div className="flex min-h-screen w-full flex-col">
                <NavBar />{children}
              </div>
            </ThemeProvider>
            <Toaster />
          </PostHogProvider>
        </MainStoreProvider>
      </body>
    </html>
  );
}
