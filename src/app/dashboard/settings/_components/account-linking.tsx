"use client";

import React from "react";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, Unlink, Github, User, Shield, ExternalLink } from "lucide-react";
import { linkSocial, unlinkAccount } from "@/lib/auth/auth-client";
import { api } from "@/trpc/react";

// Google icon as SVG since Lucide doesn't have one
const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const getProviderIcon = (providerId: string) => {
    switch (providerId) {
        case "google":
            return <GoogleIcon />;
        case "github":
            return <Github className="h-4 w-4" />;
        case "credential":
            return <User className="h-4 w-4" />;
        default:
            return <Shield className="h-4 w-4" />;
    }
};

const getProviderName = (providerId: string) => {
    switch (providerId) {
        case "google":
            return "Google";
        case "github":
            return "GitHub";
        case "credential":
            return "Email & Password";
        default:
            return providerId;
    }
};

export function AccountLinking() {
    const { data: linkedAccounts, refetch: refetchAccounts } =
        api.account.getLinkedAccounts.useQuery();
    const { data: authProviders, refetch: refetchProviders } =
        api.account.getAuthProviders.useQuery();

    const handleLinkAccount = async (provider: "google" | "github") => {
        try {
            await linkSocial({
                provider,
                callbackURL: "/dashboard/settings",
            });
            toast.success(
                `${getProviderName(provider)} account linking initiated`,
            );
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : `Failed to link ${getProviderName(provider)} account`;
            toast.error(message);
        }
    };

    const handleUnlinkAccount = async (providerId: string) => {
        try {
            await unlinkAccount({
                providerId,
            });
            toast.success(
                `${getProviderName(providerId)} account unlinked successfully`,
            );
            // Refetch data after successful unlink
            await Promise.all([refetchAccounts(), refetchProviders()]);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : `Failed to unlink ${getProviderName(providerId)} account`;
            toast.error(message);
        }
    };

    const canUnlink = (providerId: string) => {
        if (!authProviders) return false;

        // Don't allow unlinking if it's the only authentication method
        if (authProviders.providers.length <= 1) return false;

        // Don't allow unlinking credentials if user only has social accounts
        // (they should always have at least one way to authenticate)
        return true;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Linked Accounts
                </CardTitle>
                <CardDescription>
                    Manage your authentication methods. Link or unlink social
                    accounts to access your account in multiple ways.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Linked Accounts */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Connected Accounts</h4>
                    {linkedAccounts && linkedAccounts.length > 0 ? (
                        <div className="space-y-3">
                            {linkedAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {getProviderIcon(account.providerId)}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {getProviderName(
                                                    account.providerId,
                                                )}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                Connected{" "}
                                                {new Date(
                                                    account.createdAt,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {authProviders?.providers.length ===
                                            1 && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                Primary
                                            </Badge>
                                        )}
                                    </div>
                                    {canUnlink(account.providerId) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleUnlinkAccount(
                                                    account.providerId,
                                                )
                                            }
                                        >
                                            <Unlink className="mr-1 h-3 w-3" />
                                            Unlink
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-4 text-center text-sm">
                            No connected accounts found
                        </p>
                    )}
                </div>

                <Separator />

                {/* Available Providers to Link */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Available to Link</h4>
                    <div className="space-y-3">
                        {/* Google */}
                        {!authProviders?.hasGoogleAuth && (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <GoogleIcon />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Google
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Link your Google account for easy
                                            sign-in
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLinkAccount("google")}
                                >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Link Account
                                </Button>
                            </div>
                        )}

                        {/* GitHub */}
                        {!authProviders?.hasGithubAuth && (
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <Github className="h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            GitHub
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            Link your GitHub account for easy
                                            sign-in
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLinkAccount("github")}
                                >
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Link Account
                                </Button>
                            </div>
                        )}

                        {/* Show message if all providers are linked */}
                        {authProviders?.hasGoogleAuth &&
                            authProviders?.hasGithubAuth && (
                                <p className="text-muted-foreground py-4 text-center text-sm">
                                    All available social accounts are linked
                                </p>
                            )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
