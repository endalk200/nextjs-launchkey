import type { Metadata } from "next";

import "@app/ui/globals.css";
import { cn } from "@app/ui/lib/utils";
import { Geist } from "next/font/google";
import { Providers } from "./provider";
import { getServerSession } from "./session";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "App",
	description: "Description",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession();

	return (
		<html lang="en" className={cn("font-sans", geist.variable)}>
			<body>
				<Providers
					telemetryUser={
						session
							? { email: session.user.email, id: session.user.id }
							: undefined
					}
				>
					{children}
				</Providers>
			</body>
		</html>
	);
}
