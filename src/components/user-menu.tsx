"use client";

import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/server/better-auth/client";

interface UserMenuProps {
  user: {
    id: string;
    name: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    image: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const getInitials = () => {
    // Try first/last name initials first
    const first = user.firstName?.[0]?.toUpperCase() ?? "";
    const last = user.lastName?.[0]?.toUpperCase() ?? "";
    if (first || last) return first + last;

    // Fallback to name field initials
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0]?.toUpperCase() ?? "U";
  };

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.name ||
    "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:ring-ring flex items-center gap-2 rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={displayName} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{displayName}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/home" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
