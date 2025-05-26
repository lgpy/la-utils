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
          inter.className,
          "min-h-screen bg-background font-sans antialiased flex flex-col"
        )}
      >
        <MainStoreProvider>
          <PostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NavBar />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {children}
              </main>
              <footer className="py-4 text-center text-xs text-muted-foreground/50">
                <p>Made by Slayersen (EUC)</p>
                <p>Feel free to contact me on <a
                  href="https://discord.com/users/119529240587796482"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Discord
                </a></p>
              </footer>
              <Toaster />
            </ThemeProvider>
          </PostHogProvider>
        </MainStoreProvider>
      </body>
    </html>
  );
}
