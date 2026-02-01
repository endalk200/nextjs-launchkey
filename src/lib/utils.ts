import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get display name from firstName and lastName
 * Falls back to "User" if neither is provided
 */
export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "User";
}

/**
 * Get initials from firstName and lastName
 */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = firstName?.[0]?.toUpperCase() ?? "";
  const last = lastName?.[0]?.toUpperCase() ?? "";
  return first + last || "U";
}
