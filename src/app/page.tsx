import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Next.js Starter Template
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-8">
            A modern full-stack starter template with authentication,
            organizations, and a beautiful UI. Build your next project faster.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/40 border-t">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
          <nav className="text-muted-foreground flex gap-4 text-sm">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
