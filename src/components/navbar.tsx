import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getSession } from "@/server/better-auth/server";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Your App</span>
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <UserMenu
              user={{
                id: session.user.id,
                name: session.user.name,
                firstName: session.user.firstName,
                lastName: session.user.lastName,
                email: session.user.email,
                image: session.user.image ?? null,
              }}
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
