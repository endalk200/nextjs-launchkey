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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserMinus, Shield } from "lucide-react";
import { unlinkAccount } from "@/lib/auth/auth-client";
import { api } from "@/trpc/react";

interface RemoveCredentialsProps {
    authProviders: {
        hasCredentialAuth: boolean;
        hasGoogleAuth: boolean;
        hasGithubAuth: boolean;
        providers: string[];
        canRemoveCredentials: boolean;
    };
}

export function RemoveCredentials({ authProviders }: RemoveCredentialsProps) {
    const { refetch: refetchProviders } =
        api.account.getAuthProviders.useQuery();

    const handleRemoveCredentials = async () => {
        try {
            await unlinkAccount({
                providerId: "credential",
            });
            toast.success("Password authentication removed successfully");
            // Refetch providers to update UI
            await refetchProviders();
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to remove password authentication";
            toast.error(message);
        }
    };

    if (!authProviders.hasCredentialAuth) {
        return null;
    }

    const otherMethods = [];
    if (authProviders.hasGoogleAuth) otherMethods.push("Google");
    if (authProviders.hasGithubAuth) otherMethods.push("GitHub");

    return (
        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <UserMinus className="h-5 w-5" />
                    Remove Password Authentication
                </CardTitle>
                <CardDescription>
                    Remove email and password authentication from your account.
                    You'll still be able to sign in with your other connected
                    accounts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {authProviders.canRemoveCredentials ? (
                    <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Shield className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div className="text-sm">
                                    <p className="text-muted-foreground font-medium">
                                        You'll still be able to sign in with:
                                    </p>
                                    <p className="text-muted-foreground">
                                        {otherMethods.join(" and ")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    Remove Password Authentication
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Remove Password Authentication?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will no longer be able to sign in
                                        with email and password. Make sure you
                                        can access your account through your
                                        other connected methods:
                                        {otherMethods.length > 0 && (
                                            <span className="mt-2 block font-medium">
                                                • {otherMethods.join("\n• ")}
                                            </span>
                                        )}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleRemoveCredentials}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Remove Password Authentication
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ) : (
                    <div className="bg-muted rounded-lg p-4">
                        <p className="text-muted-foreground text-sm">
                            You cannot remove password authentication because
                            it's your only sign-in method. Link another account
                            first to enable removal.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
