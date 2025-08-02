import "@/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "NextCelerator — modern fully featured NextJs starter kit",
    description:
        "NextCelerator is a modern fully featured NextJs starter kit with shadcn/ui, tailwindcss, typescript, prisma, and more.",
    keywords: [
        "NextCelerator",
        "NextJs",
        "shadcn/ui",
        "tailwindcss",
        "typescript",
        "prisma",
        "nextjs starter kit",
        "shadcn/ui starter kit",
        "tailwindcss starter kit",
        "typescript starter kit",
        "prisma starter kit",
    ],
    authors: [
        {
            name: "Endalkachew Biruk <@endalk200>",
            url: "https://endalk200.com",
        },
    ],
    openGraph: {
        title: "NextCelerator — modern fully featured NextJs starter kit",
        description:
            "NextCelerator is a modern fully featured NextJs starter kit with shadcn/ui, tailwindcss, typescript, prisma, and more.",
        url: "https://nextcelerator.com/",
        siteName: "NextCelerator",
        images: [
            {
                url: "https://nextcelerator.com/og-image.v050725.png",
                width: 1200,
                height: 630,
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "NextCelerator — modern fully featured NextJs starter kit",
        description:
            "NextCelerator is a modern fully featured NextJs starter kit with shadcn/ui, tailwindcss, typescript, prisma, and more.",
        images: ["https://nextcelerator.com/og-image.v050725.png"],
    },
    robots: "noindex, nofollow",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-background text-foreground font-mono antialiased">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
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
