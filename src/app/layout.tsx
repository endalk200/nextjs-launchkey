import "@/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "TACTICAL OPS - v2.1.7 CLASSIFIED",
  description:
    "Tactical Operations Command Center - Classified Military Intelligence Dashboard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-mono antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="nextcelerator-theme"
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster theme="dark" />
        </ThemeProvider>
      </body>
    </html>
  );
}
