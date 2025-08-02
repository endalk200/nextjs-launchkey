"use client";

import React from "react";
import { User } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { api } from "@/trpc/react";
import { ActiveSessions } from "./_components/active-sessions";
import { UserInfo } from "./_components/user-info";
import { ChangePassword } from "./_components/change-password";
import { DeleteAccount } from "./_components/delete-account";
import { AccountLinking } from "./_components/account-linking";
import { AddCredentials } from "./_components/add-credentials";
import { RemoveCredentials } from "./_components/remove-credentials";

export default function SettingsPage() {
    const { isPending } = useSession();
    const { data: authProviders, isLoading: isLoadingProviders } =
        api.account.getAuthProviders.useQuery();

    if (isPending || isLoadingProviders) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!authProviders) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive">
                        Failed to load authentication settings
                    </p>
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
            <AccountLinking />

            {/* Password Management Section */}
            {authProviders.hasCredentialAuth ? (
                // User has password auth - show change password and option to remove
                <>
                    <ChangePassword authProviders={authProviders} />
                    <RemoveCredentials authProviders={authProviders} />
                </>
            ) : (
                // User only has social auth - show option to add password
                <AddCredentials />
            )}

            <DeleteAccount />
        </div>
    );
}
