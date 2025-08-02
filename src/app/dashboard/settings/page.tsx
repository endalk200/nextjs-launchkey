"use client";

import React from "react";
import { User } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { ActiveSessions } from "./_components/active-sessions";
import { UserInfo } from "./_components/user-info";
import { ChangePassword } from "./_components/change-password";
import { DeleteAccount } from "./_components/delete-account";

export default function SettingsPage() {
    const { isPending } = useSession();

    // Check if user has email/password authentication by checking if they can change password
    // This will be true if the user signed up with email/password or set a password
    const hasEmailPassword = true; // Show password section by default, better-auth will handle validation

    if (isPending) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-8 p-6">
            <div className="mb-8 flex items-center gap-2">
                <User className="h-6 w-6" />
                <h1 className="text-3xl font-bold">Account Settings</h1>
            </div>

            <UserInfo />
            <ActiveSessions />

            {/* Password Section - Only show if user has email/password account */}
            {hasEmailPassword && <ChangePassword />}

            <DeleteAccount />
        </div>
    );
}
