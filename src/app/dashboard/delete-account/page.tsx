"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { deleteUser, useSession, signOut } from "@/lib/auth/auth-client";
import Link from "next/link";

export default function DeleteAccountPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [token, setToken] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
            setIsValidToken(true); // Assume valid until proven otherwise
        } else {
            setIsValidToken(false);
        }
    }, [searchParams]);

    const handleDeleteAccount = async () => {
        if (!token) {
            toast.error("Invalid deletion token");
            return;
        }

        setIsDeleting(true);
        try {
            // Delete the user account
            const result = await deleteUser({
                token,
                callbackURL: "/goodbye", // Redirect to goodbye page after deletion
            });

            console.log("Delete user result:", result);

            // Explicitly sign out the user to ensure they're logged out
            // This is a safety measure in case Better Auth doesn't handle it automatically
            try {
                await signOut({
                    fetchOptions: {
                        onSuccess: () => {
                            console.log(
                                "User signed out successfully after account deletion",
                            );
                        },
                        onError: (ctx) => {
                            console.log(
                                "Sign out after deletion had an error, but that's expected:",
                                ctx.error,
                            );
                        },
                    },
                });
            } catch (signOutError) {
                // This might fail if the user is already signed out, which is fine
                console.log(
                    "Sign out error (expected if user already signed out):",
                    signOutError,
                );
            }

            toast.success("Account deleted successfully");

            // Small delay to ensure cleanup completes, then redirect
            setTimeout(() => {
                // Force redirect to goodbye page
                window.location.href = "/goodbye";
            }, 1500);
        } catch (error: unknown) {
            console.error("Account deletion failed:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to delete account";
            toast.error(message);
            setIsValidToken(false);
        } finally {
            setIsDeleting(false);
        }
    };

    // Loading state
    if (isValidToken === null) {
        return (
            <div className="container mx-auto max-w-2xl p-6">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
                        <p className="text-muted-foreground">
                            Verifying deletion request...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!isValidToken || !token) {
        return (
            <div className="container mx-auto max-w-2xl p-6">
                <Card className="border-destructive">
                    <CardHeader className="text-center">
                        <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                            <XCircle className="text-destructive h-6 w-6" />
                        </div>
                        <CardTitle className="text-destructive">
                            Invalid Deletion Link
                        </CardTitle>
                        <CardDescription>
                            This account deletion link is invalid, expired, or
                            has already been used.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-muted-foreground text-sm">
                            If you want to delete your account, please request a
                            new deletion link from your account settings.
                        </p>
                        <div className="flex justify-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/dashboard/settings">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Settings
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/dashboard">Go to Dashboard</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <AlertTriangle className="text-destructive h-8 w-8" />
                    </div>
                    <h1 className="text-destructive text-3xl font-bold">
                        Confirm Account Deletion
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        You&apos;re about to permanently delete your account
                    </p>
                </div>

                {/* User Info Card */}
                {session?.user && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Account to be deleted
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Email:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                        {session.user.email}
                                    </span>
                                    {session.user.emailVerified && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Name:
                                </span>
                                <span className="text-sm">
                                    {session.user.name || "Not set"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Account created:
                                </span>
                                <span className="text-sm">
                                    {new Date(
                                        session.user.createdAt,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Warning Card */}
                <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            This action cannot be undone
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm">Deleting your account will:</p>
                        <ul className="ml-4 space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                                <div className="bg-destructive h-1.5 w-1.5 rounded-full" />
                                Permanently delete all your account data
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="bg-destructive h-1.5 w-1.5 rounded-full" />
                                Remove access to all your projects and settings
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="bg-destructive h-1.5 w-1.5 rounded-full" />
                                Sign you out of all devices immediately
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="bg-destructive h-1.5 w-1.5 rounded-full" />
                                Make your email address available for new
                                registrations
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 pt-4">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/dashboard/settings">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancel
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="lg"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting Account...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete My Account
                                    </>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="text-destructive h-5 w-5" />
                                    Final Confirmation
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you absolutely sure you want to delete
                                    your account? This action is permanent and
                                    cannot be reversed.
                                    {session?.user?.email && (
                                        <div className="bg-muted mt-3 rounded-md p-3">
                                            <p className="font-medium">
                                                Account: {session.user.email}
                                            </p>
                                        </div>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    No, Keep My Account
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Yes, Delete Forever"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-muted-foreground text-xs">
                        Need help? Contact our support team before proceeding
                        with deletion.
                    </p>
                </div>
            </div>
        </div>
    );
}
